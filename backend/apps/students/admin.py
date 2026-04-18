from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'teacher', 'grade_level', 'latest_classification', 'latest_mindset_score', 'last_assessed')
    list_filter = ('grade_level', 'latest_classification', 'gender')
    search_fields = ('first_name', 'last_name', 'teacher__email')
    raw_id_fields = ('teacher',)
