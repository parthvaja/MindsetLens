"""Integration tests for survey submission API endpoint."""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Teacher
from apps.students.models import Student
from apps.surveys.models import SurveyResponse
from apps.analytics.models import MindsetTrend


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
def auth_client(api_client, teacher):
    refresh = RefreshToken.for_user(teacher)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def student(db, teacher):
    return Student.objects.create(
        teacher=teacher,
        first_name='Alex',
        last_name='Jones',
        grade_level='5',
    )


def _valid_survey_payload():
    """Build a complete 12-question survey payload."""
    responses = []
    for i in range(1, 11):
        responses.append({
            'question_id': f'q{i}',
            'question_text': f'Question {i}',
            'answer_value': 4,
        })
    responses.append({
        'question_id': 'q11',
        'question_text': 'Describe a struggle',
        'answer_text': 'I tried again and practiced hard until I finally improved and learned.',
    })
    responses.append({
        'question_id': 'q12',
        'question_text': 'What makes someone successful?',
        'answer_text': 'Effort and perseverance make someone successful; growth comes from hard work.',
    })
    return {'survey_type': 'initial', 'responses': responses}


# ── auth guard ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSurveyAuthGuard:
    def test_unauthenticated_request_returns_401(self, api_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        response = api_client.post(url, _valid_survey_payload(), format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_wrong_teacher_gets_404(self, db, student):
        other = Teacher.objects.create_user(
            username='other', email='other@test.com', password='Pass123!'
        )
        client = APIClient()
        refresh = RefreshToken.for_user(other)
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        url = f'/api/surveys/submit/{student.id}/'
        response = client.post(url, _valid_survey_payload(), format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ── happy path ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSurveySubmission:
    def test_valid_submission_returns_201(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        response = auth_client.post(url, _valid_survey_payload(), format='json')
        assert response.status_code == status.HTTP_201_CREATED

    def test_response_contains_required_fields(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        data = auth_client.post(url, _valid_survey_payload(), format='json').data
        assert 'survey_id' in data
        assert 'growth_mindset_score' in data
        assert 'classification' in data
        assert 'processing_time_ms' in data

    def test_score_in_valid_range(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        data = auth_client.post(url, _valid_survey_payload(), format='json').data
        assert 0 <= float(data['growth_mindset_score']) <= 100

    def test_classification_is_valid(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        data = auth_client.post(url, _valid_survey_payload(), format='json').data
        assert data['classification'] in ('growth', 'mixed', 'fixed')

    def test_survey_response_saved_to_db(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        auth_client.post(url, _valid_survey_payload(), format='json')
        assert SurveyResponse.objects.filter(student=student).count() == 1

    def test_trend_data_point_created(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        auth_client.post(url, _valid_survey_payload(), format='json')
        assert MindsetTrend.objects.filter(student=student).count() == 1

    def test_student_cached_score_updated(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        auth_client.post(url, _valid_survey_payload(), format='json')
        student.refresh_from_db()
        assert student.latest_mindset_score is not None
        assert student.latest_classification is not None
        assert student.last_assessed is not None


# ── validation ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSurveyValidation:
    def test_missing_responses_returns_400(self, auth_client, student):
        url = f'/api/surveys/submit/{student.id}/'
        response = auth_client.post(url, {'survey_type': 'initial', 'responses': []}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_incomplete_survey_returns_400(self, auth_client, student):
        payload = _valid_survey_payload()
        payload['responses'] = payload['responses'][:5]  # only 5 of 12
        url = f'/api/surveys/submit/{student.id}/'
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_short_open_ended_returns_400(self, auth_client, student):
        payload = _valid_survey_payload()
        # Replace q11 with a too-short answer
        for r in payload['responses']:
            if r['question_id'] == 'q11':
                r['answer_text'] = 'short'
        url = f'/api/surveys/submit/{student.id}/'
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_likert_value_returns_400(self, auth_client, student):
        payload = _valid_survey_payload()
        payload['responses'][0]['answer_value'] = 6  # out of 1-5 range
        url = f'/api/surveys/submit/{student.id}/'
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── student CRUD ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudentEndpoints:
    def test_list_students(self, auth_client, student):
        response = auth_client.get('/api/students/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_create_student(self, auth_client):
        payload = {'first_name': 'Sam', 'last_name': 'Lee', 'grade_level': '3'}
        response = auth_client.post('/api/students/', payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'Sam'

    def test_search_students(self, auth_client, student):
        response = auth_client.get('/api/students/?search=Alex')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_search_no_match(self, auth_client, student):
        response = auth_client.get('/api/students/?search=zzznomatch')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0

    def test_delete_student(self, auth_client, student):
        response = auth_client.delete(f'/api/students/{student.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
