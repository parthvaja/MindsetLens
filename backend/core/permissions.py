from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    """Allow access only to authenticated Teacher users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsStudentOwner(BasePermission):
    """Allow access only to the teacher who owns the student."""

    def has_object_permission(self, request, view, obj):
        # obj can be a Student or related object with .student.teacher
        if hasattr(obj, 'teacher'):
            return obj.teacher == request.user
        if hasattr(obj, 'student'):
            return obj.student.teacher == request.user
        return False
