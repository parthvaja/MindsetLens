from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class SurveyResponse(models.Model):
    """Student survey response with mindset analysis."""

    SURVEY_TYPES = [
        ('initial', 'Initial Assessment'),
        ('followup', 'Follow-up Assessment'),
        ('quarterly', 'Quarterly Check-in'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='survey_responses',
    )
    survey_type = models.CharField(max_length=20, choices=SURVEY_TYPES, default='initial')

    # JSONB: [{"question_id": "q1", "question_text": "...", "answer_value": 4}, ...]
    responses = models.JSONField()

    # Calculated scores
    growth_mindset_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    likert_component = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Score from Likert scale questions only',
    )
    text_adjustment = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Adjustment from NLP analysis of open-ended responses',
    )

    mindset_classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')],
    )

    ai_analysis_summary = models.TextField(blank=True)
    processing_time_ms = models.PositiveIntegerField(
        help_text='Time to calculate score in milliseconds',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'survey_responses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.survey_type} ({self.created_at.date()})"
