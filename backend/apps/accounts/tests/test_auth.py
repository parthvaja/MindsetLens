import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import Teacher


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def teacher_data():
    return {
        'email': 'teacher@example.com',
        'username': 'teacher1',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'school_name': 'Springfield Elementary',
        'password': 'StrongPass123!',
        'password2': 'StrongPass123!',
    }


@pytest.fixture
def teacher(teacher_data):
    t = Teacher.objects.create_user(
        email=teacher_data['email'],
        username=teacher_data['username'],
        first_name=teacher_data['first_name'],
        last_name=teacher_data['last_name'],
        password=teacher_data['password'],
    )
    return t


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self, api_client, teacher_data):
        url = reverse('auth-register')
        response = api_client.post(url, teacher_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['teacher']['email'] == teacher_data['email']

    def test_register_password_mismatch(self, api_client, teacher_data):
        teacher_data['password2'] = 'DifferentPass!'
        url = reverse('auth-register')
        response = api_client.post(url, teacher_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client, teacher_data, teacher):
        url = reverse('auth-register')
        response = api_client.post(url, teacher_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, teacher):
        url = reverse('auth-login')
        response = api_client.post(url, {'email': teacher.email, 'password': 'StrongPass123!'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_login_wrong_password(self, api_client, teacher):
        url = reverse('auth-login')
        response = api_client.post(url, {'email': teacher.email, 'password': 'wrong'}, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, api_client):
        url = reverse('auth-login')
        response = api_client.post(url, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestMe:
    def test_me_authenticated(self, api_client, teacher):
        api_client.force_authenticate(user=teacher)
        url = reverse('auth-me')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == teacher.email

    def test_me_unauthenticated(self, api_client):
        url = reverse('auth-me')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
