from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class TeachingRecommendation(models.Model):
    """AI-generated personalised teaching strategies."""

    CATEGORIES = [
        ('communication', 'Communication'),
        ('feedback', 'Feedback'),
        ('challenge', 'Challenge Level'),
        ('motivation', 'Motivation'),
        ('general', 'General Strategy'),
    ]

    SOURCES = [
        ('initial_survey', 'Initial Survey'),
        ('followup_survey', 'Follow-up Survey'),
        ('teacher_note', 'Teacher Note'),
        ('combined', 'Combined Analysis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='recommendations',
    )

    recommendation_text = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES)
    confidence_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text='AI confidence in this recommendation (0-1)',
    )

    source = models.CharField(max_length=20, choices=SOURCES)
    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teaching_recommendations'
        ordering = ['-confidence_score', '-created_at']
        indexes = [
            models.Index(fields=['student', 'is_active', '-confidence_score']),
        ]

    def __str__(self):
        return f"{self.category} for {self.student.full_name}"
