from django.contrib import admin
from .models import SurveyResponse


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ('student', 'survey_type', 'growth_mindset_score', 'mindset_classification', 'processing_time_ms', 'created_at')
    list_filter = ('survey_type', 'mindset_classification')
    search_fields = ('student__first_name', 'student__last_name')
    readonly_fields = ('growth_mindset_score', 'likert_component', 'text_adjustment', 'processing_time_ms')
