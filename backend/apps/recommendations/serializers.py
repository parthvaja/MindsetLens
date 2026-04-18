from rest_framework import serializers

from .models import TeachingRecommendation


class TeachingRecommendationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = TeachingRecommendation
        fields = [
            'id', 'student', 'student_name',
            'recommendation_text', 'category',
            'confidence_score', 'source', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
