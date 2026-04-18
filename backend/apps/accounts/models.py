from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class Teacher(AbstractUser):
    """Custom user model for teachers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    school_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'teachers'
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
