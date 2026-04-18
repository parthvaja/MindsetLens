from django.contrib import admin
from .models import MindsetTrend


@admin.register(MindsetTrend)
class MindsetTrendAdmin(admin.ModelAdmin):
    list_display = ('student', 'score', 'classification', 'data_source', 'recorded_at')
    list_filter = ('classification', 'data_source')
    search_fields = ('student__first_name', 'student__last_name')
