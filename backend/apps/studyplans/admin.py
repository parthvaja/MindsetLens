from django.contrib import admin
from .models import StudyPlan


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('topic', 'teacher', 'duration_minutes', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('topic', 'teacher__email', 'teacher__first_name', 'teacher__last_name')
    raw_id_fields = ('teacher',)
    readonly_fields = ('id', 'created_at')
