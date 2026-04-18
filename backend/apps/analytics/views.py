from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import Student

from .models import MindsetTrend
from .serializers import DashboardStatsSerializer, MindsetTrendSerializer


class DashboardStatsView(APIView):
    """Aggregate statistics for the teacher dashboard."""

    def get(self, request):
        students = Student.objects.filter(teacher=request.user)
        assessed = students.filter(latest_mindset_score__isnull=False)

        classification_counts = (
            assessed
            .values('latest_classification')
            .annotate(count=Count('id'))
        )
        counts = {
            row['latest_classification']: row['count']
            for row in classification_counts
        }

        avg_score = assessed.aggregate(avg=Avg('latest_mindset_score'))['avg']

        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_assessments = students.filter(last_assessed__gte=seven_days_ago).count()

        data = {
            'total_students': students.count(),
            'assessed_students': assessed.count(),
            'growth_count': counts.get('growth', 0),
            'mixed_count': counts.get('mixed', 0),
            'fixed_count': counts.get('fixed', 0),
            'average_score': round(float(avg_score), 2) if avg_score is not None else None,
            'recent_assessments': recent_assessments,
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)


class MindsetTrendViewSet(viewsets.ReadOnlyModelViewSet):
    """Mindset trend data points for charts."""

    serializer_class = MindsetTrendSerializer

    def get_queryset(self):
        qs = MindsetTrend.objects.filter(
            student__teacher=self.request.user
        ).select_related('student')

        student_id = self.request.query_params.get('student_id')
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs
