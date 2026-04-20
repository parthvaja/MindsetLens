from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notes.models import TeacherNote
from apps.students.models import Student

from .ai_service import StudyPlanGenerator
from .models import StudyPlan
from .serializers import StudyPlanDetailSerializer, StudyPlanListSerializer


class StudyPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Study plan endpoints.

    list:   GET  /api/studyplans/
    detail: GET  /api/studyplans/{id}/
    generate: POST /api/studyplans/generate/
    chat:   POST /api/studyplans/{id}/chat/
    """

    def get_serializer_class(self):
        if self.action == 'list':
            return StudyPlanListSerializer
        return StudyPlanDetailSerializer

    def get_queryset(self):
        return StudyPlan.objects.filter(teacher=self.request.user)

    # ── generate ─────────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        POST /api/studyplans/generate/

        Body:
            student_ids       (required) list of student UUID strings
            topic             (required) e.g. "Fractions"
            duration_minutes  (required) integer
            context_notes     (optional) string
        """
        student_ids = request.data.get('student_ids', [])
        topic = (request.data.get('topic') or '').strip()
        duration_minutes = request.data.get('duration_minutes')
        context_notes = (request.data.get('context_notes') or '').strip()

        # --- Validation ---
        errors = {}
        if not student_ids or not isinstance(student_ids, list):
            errors['student_ids'] = 'A non-empty list of student IDs is required.'
        if len(student_ids) < 2:
            errors['student_ids'] = 'Select at least 2 students to generate a study plan.'
        if not topic:
            errors['topic'] = 'Topic is required.'
        if not duration_minutes:
            errors['duration_minutes'] = 'Duration is required.'
        else:
            try:
                duration_minutes = int(duration_minutes)
                if duration_minutes < 10:
                    errors['duration_minutes'] = 'Duration must be at least 10 minutes.'
            except (TypeError, ValueError):
                errors['duration_minutes'] = 'Duration must be an integer.'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # --- Fetch students (teacher-scoped) ---
        students = Student.objects.filter(
            id__in=student_ids,
            teacher=request.user,
        ).prefetch_related('teacher_notes')

        found_ids = {str(s.id) for s in students}
        missing = [sid for sid in student_ids if sid not in found_ids]
        if missing:
            return Response(
                {'student_ids': f'Students not found: {", ".join(missing)}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # --- Build per-student context dicts ---
        students_data = []
        for student in students:
            recent_notes = list(
                TeacherNote.objects.filter(student=student)
                .order_by('-observation_date')
                .values_list('note_text', flat=True)[:3]
            )
            students_data.append({
                'name': student.full_name,
                'mindset_score': float(student.latest_mindset_score or 50),
                'classification': student.latest_classification or 'mixed',
                'recent_notes': recent_notes,
            })

        # --- Call AI ---
        generator = StudyPlanGenerator()
        plan_content = generator.generate_plan(
            topic=topic,
            duration_minutes=duration_minutes,
            students_data=students_data,
            context_notes=context_notes,
        )

        # --- Persist ---
        plan = StudyPlan.objects.create(
            teacher=request.user,
            topic=topic,
            duration_minutes=duration_minutes,
            student_ids=[str(sid) for sid in student_ids],
            context_notes=context_notes,
            plan_content=plan_content,
        )

        serializer = StudyPlanDetailSerializer(plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ── chat ─────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='chat')
    def chat(self, request, pk=None):
        """
        POST /api/studyplans/{id}/chat/

        Body:
            message               (required)
            conversation_history  (optional) list of {"role": ..., "content": ...}
        """
        try:
            plan = StudyPlan.objects.get(pk=pk, teacher=request.user)
        except StudyPlan.DoesNotExist:
            return Response(
                {'detail': 'Study plan not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        message = (request.data.get('message') or '').strip()
        if not message:
            return Response(
                {'detail': 'message is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        conversation_history = request.data.get('conversation_history', [])

        # Re-fetch student context for the chat system prompt.
        students = Student.objects.filter(
            id__in=plan.student_ids,
            teacher=request.user,
        )
        students_data = [
            {
                'name': s.full_name,
                'mindset_score': float(s.latest_mindset_score or 50),
                'classification': s.latest_classification or 'mixed',
            }
            for s in students
        ]

        generator = StudyPlanGenerator()
        response_text = generator.generate_chat_response(
            message=message,
            plan_content=plan.plan_content,
            students_data=students_data,
            conversation_history=conversation_history,
        )

        return Response({'response': response_text})
