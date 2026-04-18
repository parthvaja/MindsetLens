from rest_framework import serializers

from .models import TeacherNote


class TeacherNoteSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = TeacherNote
        fields = [
            'id', 'student', 'student_name', 'teacher', 'teacher_name',
            'note_text', 'observation_date',
            'sentiment_score', 'detected_themes', 'triggered_update',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'teacher', 'sentiment_score', 'detected_themes',
            'triggered_update', 'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)
