from django.db import models
import uuid


class StudyPlan(models.Model):
    """AI-generated multi-student personalised study plan."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        'accounts.Teacher',
        on_delete=models.CASCADE,
        related_name='study_plans',
    )

    topic = models.CharField(max_length=255)
    duration_minutes = models.PositiveIntegerField()

    # Snapshot of which students this plan was generated for.
    # Stored as a JSON array of UUID strings so the plan remains
    # self-contained even if students are later deleted.
    student_ids = models.JSONField(default=list)

    # Optional extra context the teacher provided when creating the plan.
    context_notes = models.TextField(blank=True)

    # Structured plan returned by Claude (see ai_service.py for schema).
    plan_content = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_plans'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.topic} ({self.created_at.date()})"
