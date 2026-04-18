from django.db import models
import uuid


class MindsetTrend(models.Model):
    """Historical tracking of mindset scores for charting."""

    SOURCES = [
        ('survey', 'Survey'),
        ('note_analysis', 'Note Analysis'),
        ('combined', 'Combined Analysis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='mindset_trends',
    )

    score = models.DecimalField(max_digits=5, decimal_places=2)
    classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')],
    )
    data_source = models.CharField(max_length=20, choices=SOURCES)

    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mindset_trends'
        ordering = ['student', 'recorded_at']
        indexes = [
            models.Index(fields=['student', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.score} ({self.recorded_at.date()})"
