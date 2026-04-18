from rest_framework import serializers

from .models import SurveyResponse


class SurveyResponseSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = SurveyResponse
        fields = [
            'id', 'student', 'student_name', 'survey_type', 'responses',
            'growth_mindset_score', 'likert_component', 'text_adjustment',
            'mindset_classification', 'ai_analysis_summary',
            'processing_time_ms', 'created_at',
        ]
        read_only_fields = [
            'id', 'growth_mindset_score', 'likert_component', 'text_adjustment',
            'mindset_classification', 'ai_analysis_summary',
            'processing_time_ms', 'created_at',
        ]


class ResponseItemSerializer(serializers.Serializer):
    """Validates a single question response."""

    question_id = serializers.RegexField(r'^q(1[0-2]|[1-9])$')
    question_text = serializers.CharField()
    answer_value = serializers.IntegerField(min_value=1, max_value=5, required=False)
    answer_text = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate(self, data):
        qid = data['question_id']
        if qid in ('q11', 'q12'):
            text = data.get('answer_text', '').strip()
            if len(text) < 20:
                raise serializers.ValidationError(
                    {qid: 'Open-ended responses must be at least 20 characters.'}
                )
        else:
            if 'answer_value' not in data:
                raise serializers.ValidationError(
                    {qid: 'Likert questions require an answer_value (1–5).'}
                )
        return data


class SurveySubmissionSerializer(serializers.Serializer):
    """Validates the full survey submission payload."""

    survey_type = serializers.ChoiceField(
        choices=['initial', 'followup', 'quarterly'],
        default='initial',
    )
    responses = ResponseItemSerializer(many=True)

    def validate_responses(self, responses):
        if len(responses) != 12:
            raise serializers.ValidationError(
                f'Expected 12 responses, got {len(responses)}.'
            )

        question_ids = {r['question_id'] for r in responses}
        expected = {f'q{i}' for i in range(1, 13)}
        missing = expected - question_ids

        if missing:
            raise serializers.ValidationError(
                f"Missing responses for: {', '.join(sorted(missing))}"
            )

        return responses
