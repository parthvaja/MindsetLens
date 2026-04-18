from django.contrib import admin
from .models import TeachingRecommendation


@admin.register(TeachingRecommendation)
class TeachingRecommendationAdmin(admin.ModelAdmin):
    list_display = ('student', 'category', 'confidence_score', 'source', 'is_active', 'created_at')
    list_filter = ('category', 'source', 'is_active')
    search_fields = ('student__first_name', 'student__last_name')
    raw_id_fields = ('student',)
