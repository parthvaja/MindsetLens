import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Teacher
from apps.students.models import Student
from apps.studyplans.models import StudyPlan


# ── fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def teacher(db):
    return Teacher.objects.create_user(
        username='teacher1',
        email='teacher@test.com',
        password='TestPass123!',
        first_name='Jane',
        last_name='Smith',
    )


@pytest.fixture
def other_teacher(db):
    return Teacher.objects.create_user(
        username='teacher2',
        email='other@test.com',
        password='TestPass123!',
        first_name='Bob',
        last_name='Jones',
    )


@pytest.fixture
def auth_client(api_client, teacher):
    refresh = RefreshToken.for_user(teacher)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def students(teacher):
    s1 = Student.objects.create(
        teacher=teacher, first_name='Alice', last_name='Doe', grade_level='5',
        latest_mindset_score=72, latest_classification='growth',
    )
    s2 = Student.objects.create(
        teacher=teacher, first_name='Bob', last_name='Lee', grade_level='5',
        latest_mindset_score=45, latest_classification='mixed',
    )
    return [s1, s2]


@pytest.fixture
def study_plan(teacher, students):
    return StudyPlan.objects.create(
        teacher=teacher,
        topic='Fractions',
        duration_minutes=45,
        student_ids=[str(s.id) for s in students],
        plan_content={'summary': 'Test plan content'},
    )


MOCK_PLAN = {
    'summary': 'A great plan',
    'sections': [{'title': 'Intro', 'activities': []}],
}


# ── model tests ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudyPlanModel:
    def test_create_study_plan(self, study_plan):
        assert study_plan.topic == 'Fractions'
        assert study_plan.duration_minutes == 45
        assert len(study_plan.student_ids) == 2

    def test_str_representation(self, study_plan):
        expected = f"Fractions ({study_plan.created_at.date()})"
        assert str(study_plan) == expected

    def test_ordering(self, teacher, students):
        p1 = StudyPlan.objects.create(
            teacher=teacher, topic='A', duration_minutes=30,
            student_ids=[str(students[0].id), str(students[1].id)],
        )
        p2 = StudyPlan.objects.create(
            teacher=teacher, topic='B', duration_minutes=30,
            student_ids=[str(students[0].id), str(students[1].id)],
        )
        plans = list(StudyPlan.objects.all())
        assert plans[0].id == p2.id  # newest first


# ── API tests ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudyPlanList:
    def test_list_plans(self, auth_client, study_plan):
        url = reverse('studyplans-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['topic'] == 'Fractions'

    def test_list_excludes_other_teacher(self, api_client, other_teacher, study_plan):
        refresh = RefreshToken.for_user(other_teacher)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        url = reverse('studyplans-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0

    def test_unauthenticated_returns_401(self, api_client):
        url = reverse('studyplans-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestStudyPlanDetail:
    def test_retrieve_plan(self, auth_client, study_plan):
        url = reverse('studyplans-detail', args=[study_plan.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['topic'] == 'Fractions'
        assert 'plan_content' in response.data

    def test_other_teacher_cannot_retrieve(self, api_client, other_teacher, study_plan):
        refresh = RefreshToken.for_user(other_teacher)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        url = reverse('studyplans-detail', args=[study_plan.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestStudyPlanGenerate:
    @patch('apps.studyplans.views.StudyPlanGenerator')
    def test_generate_success(self, MockGenerator, auth_client, students):
        MockGenerator.return_value.generate_plan.return_value = MOCK_PLAN
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s.id) for s in students],
            'topic': 'Fractions',
            'duration_minutes': 45,
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['topic'] == 'Fractions'
        assert StudyPlan.objects.count() == 1

    def test_generate_missing_topic(self, auth_client, students):
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s.id) for s in students],
            'duration_minutes': 45,
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'topic' in response.data

    def test_generate_too_few_students(self, auth_client, students):
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(students[0].id)],
            'topic': 'Fractions',
            'duration_minutes': 45,
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'student_ids' in response.data

    def test_generate_missing_duration(self, auth_client, students):
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s.id) for s in students],
            'topic': 'Fractions',
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'duration_minutes' in response.data

    def test_generate_student_not_found(self, auth_client, students):
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(students[0].id), '00000000-0000-0000-0000-000000000000'],
            'topic': 'Fractions',
            'duration_minutes': 45,
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_generate_unauthenticated(self, api_client, students):
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s.id) for s in students],
            'topic': 'Fractions',
            'duration_minutes': 45,
        }
        response = api_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestStudyPlanChat:
    @patch('apps.studyplans.views.StudyPlanGenerator')
    def test_chat_success(self, MockGenerator, auth_client, study_plan):
        MockGenerator.return_value.generate_chat_response.return_value = 'Great question!'
        url = reverse('studyplans-chat', args=[study_plan.id])
        response = auth_client.post(url, {'message': 'How should I start?'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['response'] == 'Great question!'

    def test_chat_empty_message(self, auth_client, study_plan):
        url = reverse('studyplans-chat', args=[study_plan.id])
        response = auth_client.post(url, {'message': ''}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_chat_plan_not_found(self, auth_client):
        url = reverse('studyplans-chat', args=['00000000-0000-0000-0000-000000000000'])
        response = auth_client.post(url, {'message': 'Hello'}, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND
