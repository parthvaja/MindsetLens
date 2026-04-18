"""
Anthropic Claude API integration for teaching recommendations and chat.
"""
import json
import logging
from typing import Dict, List, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


def _get_client():
    """Return an Anthropic client, or None if the API key is not configured."""
    import os
    # Prefer the value django-environ loaded into settings; fall back to
    # os.environ directly in case of any .env parsing edge case.
    api_key = (
        getattr(settings, 'ANTHROPIC_API_KEY', '')
        or os.environ.get('ANTHROPIC_API_KEY', '')
    ).strip()
    if not api_key:
        logger.warning(
            'ANTHROPIC_API_KEY is not set. '
            'Add it to backend/.env and restart the server.'
        )
        return None
    try:
        from anthropic import Anthropic
        return Anthropic(api_key=api_key)
    except Exception as exc:
        logger.error('Failed to create Anthropic client: %s', exc)
        return None


class RecommendationGenerator:
    """Generate personalised teaching recommendations using Claude."""

    MODEL = 'claude-sonnet-4-20250514'

    def __init__(self):
        self._client = _get_client()
        if self._client is None:
            logger.warning(
                'ANTHROPIC_API_KEY is not set or invalid — '
                'recommendations will use built-in fallbacks.'
            )

    # ── public API ────────────────────────────────────────────────────────────

    def generate_recommendations(
        self,
        student_name: str,
        mindset_score: float,
        classification: str,
        survey_responses: List[Dict],
        teacher_notes: List[str] = None,
    ) -> List[Dict]:
        """
        Generate teaching recommendations.

        Returns a list of dicts: [{"category": ..., "text": ..., "confidence": ...}]
        Falls back to built-in recommendations when the API key is absent or
        when the Claude call fails.
        """
        if self._client is None:
            return self._fallback_recommendations(classification)

        prompt = self._build_rec_prompt(
            student_name, mindset_score, classification,
            survey_responses, teacher_notes or [],
        )
        try:
            raw = self._call(prompt, max_tokens=1500)
            # Strip accidental markdown fences
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]
            recommendations = json.loads(raw.strip())
            if not isinstance(recommendations, list):
                raise ValueError('Expected a JSON array')
            return recommendations
        except Exception as exc:
            logger.error('generate_recommendations failed: %s', exc)
            return self._fallback_recommendations(classification)

    def generate_chat_response(
        self,
        student_name: str,
        classification: str,
        mindset_score: float,
        message: str,
        topic: Optional[str] = None,
    ) -> str:
        """
        Generate a free-form teaching-assistant reply.

        When topic is provided the prompt asks specifically for examples/activities
        for that topic personalised to the student.  Otherwise the message is
        answered as a general teaching question.
        """
        if self._client is None:
            return self._fallback_chat(classification, topic)

        prompt = self._build_chat_prompt(
            student_name, classification, mindset_score, message, topic
        )
        try:
            return self._call(prompt, max_tokens=800)
        except Exception as exc:
            logger.error('generate_chat_response failed: %s', exc)
            return self._fallback_chat(classification, topic)

    # ── prompt builders ───────────────────────────────────────────────────────

    def _build_rec_prompt(
        self,
        student_name: str,
        score: float,
        classification: str,
        responses: List[Dict],
        notes: List[str],
    ) -> str:
        survey_text = '\n'.join(
            f"Q{i + 1}: {r.get('question_text', '')}\n"
            f"Answer: {r.get('answer_text', r.get('answer_value', ''))}"
            for i, r in enumerate(responses)
        )
        notes_text = (
            '\n'.join(f'- {n}' for n in notes) if notes else 'No teacher observations yet.'
        )
        return f"""You are an educational psychologist specialising in growth mindset development \
based on Carol Dweck's research.

**Student Profile:**
- Name: {student_name}
- Growth Mindset Score: {score}/100
- Classification: {classification}

**Survey Responses:**
{survey_text}

**Teacher Observations:**
{notes_text}

**Task:**
Generate 4-5 specific, actionable teaching recommendations for this student. Each recommendation should:
1. Be 1-2 sentences long
2. Focus on specific communication strategies or teaching approaches
3. Be personalised to this student's mindset profile
4. Include a confidence score (0.0-1.0)
5. Be categorised as: communication, feedback, challenge, motivation, or general

**Output Format (JSON array only, no markdown):**
[
  {{"category": "communication", "text": "...", "confidence": 0.90}},
  {{"category": "feedback",      "text": "...", "confidence": 0.85}}
]

Generate the recommendations now:"""

    def _build_chat_prompt(
        self,
        student_name: str,
        classification: str,
        score: float,
        message: str,
        topic: Optional[str],
    ) -> str:
        mindset_desc = {
            'growth': 'strong growth mindset — embrace challenge, effort-focused',
            'mixed':  'mixed mindset — sometimes avoids difficulty, needs encouragement',
            'fixed':  'fixed mindset — currently avoids challenge, needs confidence-building',
        }.get(classification, classification)

        topic_line = f'\n**Requested topic:** {topic}' if topic else ''

        return f"""You are a practical, encouraging teaching assistant helping a classroom teacher.

**Student context:**
- Name: {student_name}
- Mindset: {mindset_desc} (score {score}/100){topic_line}

**Teacher's message:**
{message}

Respond conversationally in 3-6 sentences or a short bullet list. Be specific and actionable. \
If examples or activities are requested, tailor them to the student's mindset level — \
low-stakes and confidence-building for fixed/mixed mindset, \
more challenging and open-ended for growth mindset."""

    # ── internal helpers ──────────────────────────────────────────────────────

    def _call(self, prompt: str, max_tokens: int) -> str:
        msg = self._client.messages.create(
            model=self.MODEL,
            max_tokens=max_tokens,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return msg.content[0].text

    @staticmethod
    def _fallback_recommendations(classification: str) -> List[Dict]:
        """Built-in recommendations used when the API key is absent or the call fails."""
        base = {
            'growth': [
                {
                    'category': 'challenge',
                    'text': (
                        'Provide increasingly challenging tasks — this student shows strong '
                        'growth mindset and thrives when stretched beyond their comfort zone.'
                    ),
                    'confidence': 0.82,
                },
                {
                    'category': 'feedback',
                    'text': (
                        'Acknowledge specific strategies used, not just outcomes: '
                        '"I noticed you tried three different approaches — that persistence matters."'
                    ),
                    'confidence': 0.79,
                },
                {
                    'category': 'motivation',
                    'text': (
                        'Invite this student to share their problem-solving approach with peers; '
                        'it reinforces their mindset and models it for others.'
                    ),
                    'confidence': 0.71,
                },
            ],
            'fixed': [
                {
                    'category': 'communication',
                    'text': (
                        'Use "not yet" language: replace "you got it wrong" with '
                        '"you haven\'t got there yet — what\'s one thing you could try differently?"'
                    ),
                    'confidence': 0.88,
                },
                {
                    'category': 'feedback',
                    'text': (
                        'Focus feedback entirely on effort and process, '
                        'never on intelligence or natural ability.'
                    ),
                    'confidence': 0.85,
                },
                {
                    'category': 'challenge',
                    'text': (
                        'Introduce low-stakes challenges where mistakes are explicitly framed '
                        'as part of learning — celebrate errors out loud.'
                    ),
                    'confidence': 0.80,
                },
                {
                    'category': 'general',
                    'text': (
                        'Share brief stories of well-known figures who failed repeatedly before '
                        'succeeding to show that ability is built, not born.'
                    ),
                    'confidence': 0.72,
                },
            ],
            'mixed': [
                {
                    'category': 'motivation',
                    'text': (
                        'Help this student notice when they already use a growth mindset — '
                        'point it out in the moment: "That right there is a growth mindset."'
                    ),
                    'confidence': 0.80,
                },
                {
                    'category': 'communication',
                    'text': (
                        'Ask "What\'s your strategy?" before tasks rather than "Can you do this?" '
                        'to prime effort-based thinking.'
                    ),
                    'confidence': 0.77,
                },
                {
                    'category': 'general',
                    'text': (
                        'Teach explicitly about neuroplasticity: the brain grows stronger with '
                        'challenge, just like a muscle.'
                    ),
                    'confidence': 0.73,
                },
            ],
        }
        return base.get(classification, base['mixed'])

    @staticmethod
    def _fallback_chat(classification: str, topic: Optional[str]) -> str:
        if topic:
            mindset_tip = {
                'growth': 'open-ended and challenge-based',
                'mixed':  'scaffolded with clear success milestones',
                'fixed':  'low-stakes with explicit celebration of effort',
            }.get(classification, 'scaffolded')
            return (
                f'Here are some ideas for teaching **{topic}** to this student.\n\n'
                f'Since they have a {classification} mindset, keep activities {mindset_tip}:\n\n'
                f'• Start with a short, achievable warm-up task on {topic} to build confidence.\n'
                f'• Use a real-world scenario involving {topic} that connects to something they care about.\n'
                f'• After the activity, ask "What did you try that you hadn\'t tried before?" '
                f'rather than grading the outcome.'
            )
        return (
            'I\'m here to help you support this student. You can ask me things like:\n\n'
            '• "Give me examples for teaching fractions"\n'
            '• "How do I build rapport with a fixed-mindset student?"\n'
            '• "What activities would work for a student who avoids challenges?"'
        )
