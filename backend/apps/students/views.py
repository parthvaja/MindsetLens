from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student
from .serializers import StudentSerializer, StudentCreateSerializer, StudentListSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for students owned by the authenticated teacher.

    list:   GET  /api/students/
    create: POST /api/students/
    retrieve: GET /api/students/{id}/
    update: PUT  /api/students/{id}/
    partial_update: PATCH /api/students/{id}/
    destroy: DELETE /api/students/{id}/
    """

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name']
    ordering_fields = ['last_name', 'first_name', 'latest_mindset_score', 'last_assessed', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_queryset(self):
        # Strict teacher scoping — teachers only see their own students
        return Student.objects.filter(teacher=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return StudentCreateSerializer
        return StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(StudentSerializer(student).data)
