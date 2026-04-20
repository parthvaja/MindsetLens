from rest_framework import serializers

from .models import StudyPlan


class StudyPlanListSerializer(serializers.ModelSerializer):
    """Lightweight serialiser used for the list endpoint."""

    student_count = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = [
            'id', 'topic', 'duration_minutes',
            'student_count', 'created_at',
        ]

    def get_student_count(self, obj):
        return len(obj.student_ids)


class StudyPlanDetailSerializer(serializers.ModelSerializer):
    """Full serialiser including plan_content used for the detail endpoint."""

    student_count = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = [
            'id', 'topic', 'duration_minutes',
            'student_ids', 'context_notes',
            'plan_content', 'student_count', 'created_at',
        ]

    def get_student_count(self, obj):
        return len(obj.student_ids)
