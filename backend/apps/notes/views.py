import logging

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from textblob import TextBlob

from .models import TeacherNote
from .serializers import TeacherNoteSerializer

logger = logging.getLogger(__name__)

# Behavioural theme keywords mapped to their label
_THEME_KEYWORDS = {
    'persistence': ['tried again', 'kept trying', "didn't give up", 'persevered', 'persistence'],
    'effort': ['worked hard', 'effort', 'practice', 'practiced', 'trying'],
    'help_seeking': ['asked for help', 'sought help', 'reached out'],
    'growth': ['improved', 'progress', 'getting better', 'grew', 'learned from'],
    'challenge_avoidance': ['gave up', 'avoided', 'refused', 'too hard', 'not my thing'],
    'low_confidence': ['can\'t do', 'not smart', 'not good at', 'impossible for me'],
    'collaboration': ['helped others', 'worked with', 'team', 'partner', 'group'],
    'curiosity': ['asked why', 'wondering', 'curious', 'want to know', 'interested in'],
}


def _analyse_note(text: str) -> tuple[float, list[str]]:
    """Return (sentiment_score, detected_themes) for the given text."""
    blob = TextBlob(text.lower())
    sentiment = round(blob.sentiment.polarity, 2)

    detected = []
    for theme, keywords in _THEME_KEYWORDS.items():
        if any(kw in text.lower() for kw in keywords):
            detected.append(theme)

    return sentiment, detected


class TeacherNoteViewSet(viewsets.ModelViewSet):
    """Teacher observation notes — full CRUD with NLP analysis on create."""

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

    def perform_create(self, serializer: TeacherNoteSerializer) -> None:
        """Run NLP analysis then persist; trigger async recommendation update."""
        note_text = serializer.validated_data.get('note_text', '')
        sentiment, themes = _analyse_note(note_text)

        note = serializer.save(
            teacher=self.request.user,
            sentiment_score=sentiment,
            detected_themes=themes,
        )

        # Regenerate recommendations — sync in dev (USE_CELERY=False), async in prod.
        from apps.recommendations.dispatch import dispatch_recommendations_for_note
        dispatch_recommendations_for_note(str(note.id))

    def perform_update(self, serializer: TeacherNoteSerializer) -> None:
        """Re-run NLP analysis when a note is edited."""
        note_text = serializer.validated_data.get(
            'note_text', serializer.instance.note_text
        )
        sentiment, themes = _analyse_note(note_text)
        serializer.save(sentiment_score=sentiment, detected_themes=themes)
