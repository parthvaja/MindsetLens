from celery import shared_task


@shared_task
def generate_recommendations_async(survey_response_id: str):
    """Generate recommendations asynchronously after survey submission. Implemented in Phase 3."""
    pass


@shared_task
def update_recommendations_from_note(note_id: str):
    """Regenerate recommendations when a teacher adds a note. Implemented in Phase 3."""
    pass
