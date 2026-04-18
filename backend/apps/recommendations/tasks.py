"""
Asynchronous Celery tasks for AI recommendation generation.
"""
import logging

from celery import shared_task
from django.apps import apps

from .ai_service import RecommendationGenerator

logger = logging.getLogger(__name__)


@shared_task
def generate_recommendations_async(survey_response_id: str) -> str:
    """
    Generate teaching recommendations after a survey is submitted.

    Args:
        survey_response_id: UUID string of the SurveyResponse

    Returns:
        Status message string
    """
    SurveyResponse = apps.get_model('surveys', 'SurveyResponse')
    TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')

    try:
        survey = SurveyResponse.objects.select_related('student').get(id=survey_response_id)
        student = survey.student

        # Deactivate previous recommendations
        TeachingRecommendation.objects.filter(student=student, is_active=True).update(
            is_active=False
        )

        generator = RecommendationGenerator()
        recommendations = generator.generate_recommendations(
            student_name=student.full_name,
            mindset_score=float(survey.growth_mindset_score),
            classification=survey.mindset_classification,
            survey_responses=survey.responses,
        )

        _save_recommendations(TeachingRecommendation, student, recommendations, 'initial_survey')
        return f'Generated {len(recommendations)} recommendations for {student.full_name}'

    except Exception as exc:
        logger.error('generate_recommendations_async failed: %s', exc)
        return f'Error: {exc}'


@shared_task
def update_recommendations_from_note(note_id: str) -> str:
    """
    Regenerate recommendations when a teacher adds an observation note.

    Args:
        note_id: UUID string of the TeacherNote

    Returns:
        Status message string
    """
    TeacherNote = apps.get_model('notes', 'TeacherNote')
    TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')
    SurveyResponse = apps.get_model('surveys', 'SurveyResponse')

    try:
        note = TeacherNote.objects.select_related('student').get(id=note_id)
        student = note.student

        latest_survey = (
            SurveyResponse.objects.filter(student=student).order_by('-created_at').first()
        )
        if not latest_survey:
            return f'No survey found for student {student.full_name} — skipping'

        all_notes = list(
            TeacherNote.objects.filter(student=student)
            .order_by('-observation_date')
            .values_list('note_text', flat=True)
        )

        # Deactivate previous recommendations
        TeachingRecommendation.objects.filter(student=student, is_active=True).update(
            is_active=False
        )

        generator = RecommendationGenerator()
        recommendations = generator.generate_recommendations(
            student_name=student.full_name,
            mindset_score=float(latest_survey.growth_mindset_score),
            classification=latest_survey.mindset_classification,
            survey_responses=latest_survey.responses,
            teacher_notes=all_notes,
        )

        _save_recommendations(TeachingRecommendation, student, recommendations, 'teacher_note')

        # Mark the note as having triggered an update
        note.triggered_update = True
        note.save(update_fields=['triggered_update'])

        return f'Updated {len(recommendations)} recommendations for {student.full_name}'

    except Exception as exc:
        logger.error('update_recommendations_from_note failed: %s', exc)
        return f'Error: {exc}'


# ── helpers ───────────────────────────────────────────────────────────────────


def _save_recommendations(model, student, recommendations: list, source: str) -> None:
    """Bulk-create recommendation rows from the AI output list."""
    valid_categories = {'communication', 'feedback', 'challenge', 'motivation', 'general'}
    objs = []
    for rec in recommendations:
        category = rec.get('category', 'general')
        if category not in valid_categories:
            category = 'general'
        confidence = float(rec.get('confidence', 0.70))
        confidence = max(0.0, min(1.0, confidence))
        objs.append(
            model(
                student=student,
                recommendation_text=rec.get('text', ''),
                category=category,
                confidence_score=confidence,
                source=source,
                is_active=True,
            )
        )
    model.objects.bulk_create(objs)
