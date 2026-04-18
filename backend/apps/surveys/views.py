import time

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.analytics.models import MindsetTrend
from apps.recommendations.tasks import generate_recommendations_async
from apps.students.models import Student

from .models import SurveyResponse
from .scoring import MindsetScorer
from .serializers import SurveyResponseSerializer, SurveySubmissionSerializer


class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    """Survey response endpoints."""

    serializer_class = SurveyResponseSerializer

    def get_queryset(self):
        qs = SurveyResponse.objects.filter(
            student__teacher=self.request.user
        ).select_related('student')

        student_id = self.request.query_params.get('student_id')
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    @action(
        detail=False,
        methods=['post'],
        url_path=r'submit/(?P<student_id>[^/.]+)',
    )
    def submit_survey(self, request, student_id=None):
        """
        POST /api/surveys/submit/{student_id}/

        Submit a 12-question mindset survey for a student.
        Returns the calculated score and classification immediately;
        AI recommendations are generated asynchronously.
        """
        try:
            student = Student.objects.get(id=student_id, teacher=request.user)
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Student not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SurveySubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Score the survey
        start_time = time.time()
        scoring_result = MindsetScorer.calculate_score(
            serializer.validated_data['responses']
        )
        processing_time_ms = int((time.time() - start_time) * 1000)

        # Persist survey response
        survey = SurveyResponse.objects.create(
            student=student,
            survey_type=serializer.validated_data.get('survey_type', 'initial'),
            responses=serializer.validated_data['responses'],
            growth_mindset_score=scoring_result['growth_mindset_score'],
            likert_component=scoring_result['likert_component'],
            text_adjustment=scoring_result['text_adjustment'],
            mindset_classification=scoring_result['classification'],
            processing_time_ms=processing_time_ms,
        )

        # Update cached fields on student
        student.latest_mindset_score = scoring_result['growth_mindset_score']
        student.latest_classification = scoring_result['classification']
        student.last_assessed = timezone.now()
        student.save(update_fields=[
            'latest_mindset_score', 'latest_classification', 'last_assessed', 'updated_at',
        ])

        # Record trend data point
        MindsetTrend.objects.create(
            student=student,
            score=scoring_result['growth_mindset_score'],
            classification=scoring_result['classification'],
            data_source='survey',
        )

        # Kick off async recommendation generation (Phase 3).
        # Wrapped so a broker/Redis outage never kills the survey submission.
        try:
            generate_recommendations_async.delay(str(survey.id))
        except Exception:
            pass  # task will be skipped; survey score is already saved

        return Response(
            {
                'survey_id': str(survey.id),
                'growth_mindset_score': scoring_result['growth_mindset_score'],
                'likert_component': scoring_result['likert_component'],
                'text_adjustment': scoring_result['text_adjustment'],
                'classification': scoring_result['classification'],
                'processing_time_ms': processing_time_ms,
                'message': (
                    'Survey submitted successfully. '
                    'Recommendations are being generated.'
                ),
            },
            status=status.HTTP_201_CREATED,
        )
