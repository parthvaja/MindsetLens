from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class TeacherNote(models.Model):
    """Teacher observations about student behaviour/performance."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='teacher_notes',
    )
    teacher = models.ForeignKey(
        'accounts.Teacher',
        on_delete=models.CASCADE,
        related_name='notes',
    )

    note_text = models.TextField(help_text='Observation details')
    observation_date = models.DateField()

    # NLP analysis results
    sentiment_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(-1), MaxValueValidator(1)],
        null=True,
        blank=True,
        help_text='Sentiment score: -1 (negative) to 1 (positive)',
    )
    detected_themes = models.JSONField(
        default=list,
        help_text='Array of detected behavioural themes',
    )

    triggered_update = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_notes'
        ordering = ['-observation_date', '-created_at']
        indexes = [
            models.Index(fields=['student', '-observation_date']),
            models.Index(fields=['teacher', '-created_at']),
        ]

    def __str__(self):
        return f"Note for {self.student.full_name} on {self.observation_date}"
