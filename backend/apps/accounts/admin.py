from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'school_name', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name', 'school_name')
    ordering = ('email',)
    fieldsets = UserAdmin.fieldsets + (
        ('School Info', {'fields': ('school_name', 'phone')}),
    )
