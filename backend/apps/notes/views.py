from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import TeacherNote
from .serializers import TeacherNoteSerializer


class TeacherNoteViewSet(viewsets.ModelViewSet):
    """Teacher observation notes — full CRUD."""

    serializer_class = TeacherNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TeacherNote.objects.filter(
            teacher=self.request.user
        ).select_related('student', 'teacher')

        student_id = self.request.query_params.get('student_id')
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs
