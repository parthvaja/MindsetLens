from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Student(models.Model):
    """Student profile managed by a teacher."""

    GRADE_CHOICES = [
        ('K', 'Kindergarten'),
        ('1', '1st Grade'),
        ('2', '2nd Grade'),
        ('3', '3rd Grade'),
        ('4', '4th Grade'),
        ('5', '5th Grade'),
        ('6', '6th Grade'),
        ('7', '7th Grade'),
        ('8', '8th Grade'),
        ('9', '9th Grade'),
        ('10', '10th Grade'),
        ('11', '11th Grade'),
        ('12', '12th Grade'),
    ]

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('NB', 'Non-binary'),
        ('O', 'Other'),
        ('P', 'Prefer not to say'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        'accounts.Teacher',
        on_delete=models.CASCADE,
        related_name='students',
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(4), MaxValueValidator(19)],
        null=True,
        blank=True,
    )
    grade_level = models.CharField(max_length=2, choices=GRADE_CHOICES, blank=True)
    gender = models.CharField(max_length=2, choices=GENDER_CHOICES, blank=True)
    notes = models.TextField(blank=True)

    # Cached latest mindset data for fast dashboard queries
    latest_mindset_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    latest_classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')],
        null=True,
        blank=True,
    )
    last_assessed = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['teacher', '-last_assessed']),
            models.Index(fields=['latest_classification']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
