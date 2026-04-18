from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """Full student serializer."""

    full_name = serializers.ReadOnlyField()
    survey_count = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            'id', 'first_name', 'last_name', 'full_name',
            'age', 'grade_level', 'gender', 'notes',
            'latest_mindset_score', 'latest_classification', 'last_assessed',
            'survey_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'latest_mindset_score', 'latest_classification', 'last_assessed', 'created_at', 'updated_at')

    def get_survey_count(self, obj):
        return obj.survey_responses.count()


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating student profiles."""

    class Meta:
        model = Student
        fields = ('first_name', 'last_name', 'age', 'grade_level', 'gender', 'notes')

    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = (
            'id', 'full_name', 'grade_level',
            'latest_mindset_score', 'latest_classification', 'last_assessed',
        )
