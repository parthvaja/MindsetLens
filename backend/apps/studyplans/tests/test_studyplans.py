import pytest
from unittest.mock import patch, ANY
from datetime import date, timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Teacher
from apps.notes.models import TeacherNote
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
        # Force distinct timestamps so ordering is deterministic
        StudyPlan.objects.filter(pk=p1.pk).update(created_at=timezone.now() - timedelta(minutes=5))
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


# ── personalization tests ────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudyPlanPersonalization:
    """Verify that observations, grade, and age are passed to the AI service."""

    @patch('apps.studyplans.views.StudyPlanGenerator')
    def test_observations_passed_to_ai_service(self, MockGenerator, auth_client, teacher, students):
        """Generate endpoint includes all teacher notes in students_data."""
        # Create observations for the first student
        TeacherNote.objects.create(
            student=students[0], teacher=teacher,
            note_text='Student enjoys Marvel movies and responds well to superhero analogies',
            observation_date=date(2026, 8, 15),
        )
        TeacherNote.objects.create(
            student=students[0], teacher=teacher,
            note_text='Strong at multiplication, struggles with fractions',
            observation_date=date(2026, 8, 20),
        )

        MockGenerator.return_value.generate_plan.return_value = MOCK_PLAN
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s.id) for s in students],
            'topic': 'Fractions',
            'duration_minutes': 45,
        }
        auth_client.post(url, payload, format='json')

        # Inspect what was passed to generate_plan
        call_kwargs = MockGenerator.return_value.generate_plan.call_args
        students_data = call_kwargs.kwargs.get('students_data') or call_kwargs[1].get('students_data') or call_kwargs[0][2]

        alice_data = next(s for s in students_data if s['name'] == 'Alice Doe')
        assert len(alice_data['observations']) == 2
        obs_texts = [o['text'] for o in alice_data['observations']]
        assert any('Marvel' in t for t in obs_texts)
        assert any('multiplication' in t for t in obs_texts)

    @patch('apps.studyplans.views.StudyPlanGenerator')
    def test_grade_and_age_passed_to_ai_service(self, MockGenerator, auth_client, teacher):
        """Generate endpoint includes grade_level and age in students_data."""
        s1 = Student.objects.create(
            teacher=teacher, first_name='Cara', last_name='Doe',
            grade_level='7', age=12,
            latest_mindset_score=60, latest_classification='mixed',
        )
        s2 = Student.objects.create(
            teacher=teacher, first_name='Dan', last_name='Fox',
            grade_level='7', age=13,
            latest_mindset_score=80, latest_classification='growth',
        )

        MockGenerator.return_value.generate_plan.return_value = MOCK_PLAN
        url = reverse('studyplans-generate')
        payload = {
            'student_ids': [str(s1.id), str(s2.id)],
            'topic': 'Algebra',
            'duration_minutes': 40,
        }
        auth_client.post(url, payload, format='json')

        call_kwargs = MockGenerator.return_value.generate_plan.call_args
        students_data = call_kwargs.kwargs.get('students_data') or call_kwargs[1].get('students_data') or call_kwargs[0][2]

        cara_data = next(s for s in students_data if s['name'] == 'Cara Doe')
        assert cara_data['grade_level'] == '7th Grade'
        assert cara_data['age'] == 12

    def test_profile_format_includes_observations(self):
        """_format_student_profile includes all observations with dates."""
        from apps.studyplans.ai_service import StudyPlanGenerator

        gen = StudyPlanGenerator()
        student = {
            'name': 'Test Student',
            'grade_level': '5th Grade',
            'age': 10,
            'mindset_score': 65,
            'classification': 'mixed',
            'observations': [
                {'date': '2026-08-20', 'text': 'Loves Marvel and superhero analogies'},
                {'date': '2026-08-15', 'text': 'Good at multiplication tables'},
            ],
        }
        profile = gen._format_student_profile(student)
        assert '5th Grade' in profile
        assert 'age 10' in profile
        assert '2026-08-20: Loves Marvel' in profile
        assert '2026-08-15: Good at multiplication' in profile
