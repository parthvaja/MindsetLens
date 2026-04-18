from rest_framework import serializers

from .models import MindsetTrend


class MindsetTrendSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = MindsetTrend
        fields = [
            'id', 'student', 'student_name',
            'score', 'classification', 'data_source', 'recorded_at',
        ]
        read_only_fields = ['id', 'recorded_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    assessed_students = serializers.IntegerField()
    growth_count = serializers.IntegerField()
    mixed_count = serializers.IntegerField()
    fixed_count = serializers.IntegerField()
    average_score = serializers.FloatField(allow_null=True)
    recent_assessments = serializers.IntegerField()
