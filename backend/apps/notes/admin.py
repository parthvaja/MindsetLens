from django.contrib import admin
from .models import TeacherNote


@admin.register(TeacherNote)
class TeacherNoteAdmin(admin.ModelAdmin):
    list_display = ('student', 'teacher', 'observation_date', 'sentiment_score', 'triggered_update', 'created_at')
    list_filter = ('triggered_update',)
    search_fields = ('student__first_name', 'student__last_name', 'teacher__email')
    raw_id_fields = ('student', 'teacher')
