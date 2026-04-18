import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import Teacher
from apps.students.models import Student


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def teacher(db):
    return Teacher.objects.create_user(
        email='teacher@test.com',
        username='teacher1',
        first_name='Jane',
        last_name='Smith',
        password='pass123',
    )


@pytest.fixture
def other_teacher(db):
    return Teacher.objects.create_user(
        email='other@test.com',
        username='teacher2',
        first_name='Bob',
        last_name='Jones',
        password='pass123',
    )


@pytest.fixture
def student(teacher):
    return Student.objects.create(
        teacher=teacher,
        first_name='Alice',
        last_name='Doe',
        grade_level='5',
    )


@pytest.mark.django_db
class TestStudentCRUD:
    def test_list_students(self, api_client, teacher, student):
        api_client.force_authenticate(user=teacher)
        url = reverse('student-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_list_excludes_other_teacher_students(self, api_client, teacher, other_teacher, student):
        other_student = Student.objects.create(
            teacher=other_teacher,
            first_name='Bob',
            last_name='Other',
        )
        api_client.force_authenticate(user=teacher)
        url = reverse('student-list')
        response = api_client.get(url)
        ids = [s['id'] for s in response.data['results']]
        assert str(student.id) in ids
        assert str(other_student.id) not in ids

    def test_create_student(self, api_client, teacher):
        api_client.force_authenticate(user=teacher)
        url = reverse('student-list')
        payload = {'first_name': 'New', 'last_name': 'Student', 'grade_level': '3'}
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'New'
        assert Student.objects.filter(teacher=teacher, first_name='New').exists()

    def test_retrieve_student(self, api_client, teacher, student):
        api_client.force_authenticate(user=teacher)
        url = reverse('student-detail', args=[student.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['full_name'] == 'Alice Doe'

    def test_cannot_retrieve_other_teacher_student(self, api_client, other_teacher, student):
        api_client.force_authenticate(user=other_teacher)
        url = reverse('student-detail', args=[student.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_student(self, api_client, teacher, student):
        api_client.force_authenticate(user=teacher)
        url = reverse('student-detail', args=[student.id])
        response = api_client.patch(url, {'first_name': 'Updated'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'

    def test_delete_student(self, api_client, teacher, student):
        api_client.force_authenticate(user=teacher)
        url = reverse('student-detail', args=[student.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Student.objects.filter(id=student.id).exists()

    def test_unauthenticated_access(self, api_client):
        url = reverse('student-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
