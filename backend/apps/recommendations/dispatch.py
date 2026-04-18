"""
Recommendation dispatch helpers.

Both survey submission and note creation call these functions so the
routing logic lives in one place rather than being duplicated across views.

  USE_CELERY=True  → push to Celery broker (production)
  USE_CELERY=False → run synchronously in-process (local dev, no Redis)
"""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def dispatch_recommendations_for_survey(survey_id: str) -> None:
    """
    Generate recommendations after a survey is submitted.

    Args:
        survey_id: UUID string of the saved SurveyResponse
    """
    if getattr(settings, 'USE_CELERY', True):
        from .tasks import generate_recommendations_async
        try:
            generate_recommendations_async.delay(survey_id)
        except Exception:
            logger.warning(
                'Celery unavailable — falling back to sync recommendation generation '
                'for survey %s',
                survey_id,
            )
            _sync_for_survey(survey_id)
    else:
        _sync_for_survey(survey_id)


def dispatch_recommendations_for_note(note_id: str) -> None:
    """
    Regenerate recommendations after a teacher observation is saved.

    Args:
        note_id: UUID string of the saved TeacherNote
    """
    if getattr(settings, 'USE_CELERY', True):
        from .tasks import update_recommendations_from_note
        try:
            update_recommendations_from_note.delay(note_id)
        except Exception:
            logger.warning(
                'Celery unavailable — falling back to sync recommendation update '
                'for note %s',
                note_id,
            )
            _sync_for_note(note_id)
    else:
        _sync_for_note(note_id)


# ── synchronous implementations ───────────────────────────────────────────────


def _sync_for_survey(survey_id: str) -> None:
    """Run recommendation generation synchronously (no broker needed)."""
    try:
        from django.apps import apps
        from .ai_service import RecommendationGenerator
        from .tasks import _save_recommendations

        SurveyResponse = apps.get_model('surveys', 'SurveyResponse')
        TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')

        survey = SurveyResponse.objects.select_related('student').get(id=survey_id)
        student = survey.student

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
        logger.info(
            'Sync: generated %d recommendations for %s', len(recommendations), student.full_name
        )
    except Exception as exc:
        logger.error('_sync_for_survey failed for survey %s: %s', survey_id, exc)


def _sync_for_note(note_id: str) -> None:
    """Run recommendation update synchronously (no broker needed)."""
    try:
        from django.apps import apps
        from .ai_service import RecommendationGenerator
        from .tasks import _save_recommendations

        TeacherNote = apps.get_model('notes', 'TeacherNote')
        TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')
        SurveyResponse = apps.get_model('surveys', 'SurveyResponse')

        note = TeacherNote.objects.select_related('student').get(id=note_id)
        student = note.student

        latest_survey = (
            SurveyResponse.objects.filter(student=student).order_by('-created_at').first()
        )
        if not latest_survey:
            logger.info('No survey found for student %s — skipping rec update', student.full_name)
            return

        all_notes = list(
            TeacherNote.objects.filter(student=student)
            .order_by('-observation_date')
            .values_list('note_text', flat=True)
        )

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

        note.triggered_update = True
        note.save(update_fields=['triggered_update'])

        logger.info(
            'Sync: updated %d recommendations for %s', len(recommendations), student.full_name
        )
    except Exception as exc:
        logger.error('_sync_for_note failed for note %s: %s', note_id, exc)
