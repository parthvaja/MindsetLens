"""
Claude API integration for multi-student personalised study plan generation.
"""
import json
import logging
from typing import Dict, List, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


def _get_client():
    """Return an Anthropic client, or None if the API key is not configured."""
    import os

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


class StudyPlanGenerator:
    """Generate personalised multi-student study plans using Claude."""

    MODEL = 'claude-haiku-4-5-20251001'

    def __init__(self):
        self._client = _get_client()
        if self._client is None:
            logger.warning(
                'ANTHROPIC_API_KEY is not set or invalid — '
                'study plans will use built-in fallbacks.'
            )

    # ── public API ────────────────────────────────────────────────────────────

    def generate_plan(
        self,
        topic: str,
        duration_minutes: int,
        students_data: List[Dict],
        context_notes: str = '',
    ) -> Dict:
        """
        Generate a structured study plan for multiple students.

        students_data is a list of dicts:
          {
            "name": str,
            "mindset_score": float,
            "classification": str,        # 'growth' | 'mixed' | 'fixed'
            "recent_notes": [str, ...],   # last 3 teacher notes
            "survey_summary": str,        # optional brief text summary
          }

        Returns a structured dict (see _fallback_plan for the schema).
        """
        if self._client is None:
            return self._fallback_plan(topic, duration_minutes, students_data)

        prompt = self._build_plan_prompt(
            topic, duration_minutes, students_data, context_notes
        )
        try:
            raw = self._call(prompt, max_tokens=3500)
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]
            plan = json.loads(raw.strip())
            if not isinstance(plan, dict):
                raise ValueError('Expected a JSON object')
            logger.info('Claude returned study plan for topic=%s', topic)
            return plan
        except Exception as exc:
            logger.error('generate_plan failed (%s): %s', type(exc).__name__, exc)
            return self._fallback_plan(topic, duration_minutes, students_data)

    def generate_chat_response(
        self,
        message: str,
        plan_content: Dict,
        students_data: List[Dict],
        conversation_history: List[Dict],
    ) -> str:
        """
        Answer a follow-up question about the study plan.

        conversation_history is a list of {"role": "user"|"assistant", "content": str}.
        """
        if self._client is None:
            return self._fallback_chat_response(message)

        system_prompt = self._build_chat_system_prompt(plan_content, students_data)
        messages = [*conversation_history, {'role': 'user', 'content': message}]

        try:
            msg = self._client.messages.create(
                model=self.MODEL,
                max_tokens=800,
                system=system_prompt,
                messages=messages,
            )
            response = msg.content[0].text
            logger.info('Claude study-plan chat response received (%d chars)', len(response))
            return response
        except Exception as exc:
            logger.error('generate_chat_response failed (%s): %s', type(exc).__name__, exc)
            return self._fallback_chat_response(message)

    # ── prompt builders ───────────────────────────────────────────────────────

    def _build_plan_prompt(
        self,
        topic: str,
        duration_minutes: int,
        students_data: List[Dict],
        context_notes: str,
    ) -> str:
        student_profiles = '\n\n'.join(
            self._format_student_profile(i + 1, s)
            for i, s in enumerate(students_data)
        )
        context_section = (
            f'\n**Additional context from teacher:**\n{context_notes}\n'
            if context_notes else ''
        )

        # Allocate time roughly: 3 min opening, 3 min mindset check-in,
        # 4 min closing, rest for main content + practice.
        main_minutes = max(10, duration_minutes - 10)

        return f"""You are an expert educational consultant specialising in differentiated instruction and growth mindset pedagogy (Carol Dweck).

**Session Parameters:**
- Topic: {topic}
- Total Duration: {duration_minutes} minutes
- Number of Students: {len(students_data)}
{context_section}
**Student Profiles:**
{student_profiles}

**Your Task:**
Generate a detailed, highly personalised study plan for this session. The plan MUST be output as a single valid JSON object — no markdown, no extra text.

The JSON must match this exact schema:

{{
  "topic": "{topic}",
  "duration_minutes": {duration_minutes},
  "sections": [
    {{
      "id": "opening",
      "title": "Opening & Warm-up",
      "duration": "2-3 minutes",
      "content": "<2-3 sentence description of the warm-up activity tailored to this specific group>",
      "student_callouts": []
    }},
    {{
      "id": "mindset_checkin",
      "title": "Mindset Check-in",
      "duration": "2-3 minutes",
      "content": "<Brief growth mindset framing activity for this session — personalised to the group dynamic>",
      "student_callouts": []
    }},
    {{
      "id": "main_content",
      "title": "Main Content",
      "duration": "{main_minutes - 10}-{main_minutes} minutes",
      "content": "<Overview of the teaching approach for {topic}>",
      "chunks": [
        {{
          "title": "<Concept chunk title>",
          "explanation": "<Core explanation of this concept>",
          "student_callouts": [
            {{
              "student_name": "<name>",
              "type": "approach",
              "content": "<Personalised instruction approach for this student based on their mindset — be specific and mention their name>"
            }},
            {{
              "student_name": "<name>",
              "type": "questioning",
              "content": "<Differentiated questioning strategy for this student>"
            }}
          ]
        }}
      ]
    }},
    {{
      "id": "practice",
      "title": "Practice Activity",
      "duration": "10-15 minutes",
      "content": "<Group or individual practice activity description>",
      "student_callouts": [
        {{
          "student_name": "<name>",
          "type": "task",
          "content": "<Specific adapted task or difficulty level for this student>"
        }}
      ]
    }},
    {{
      "id": "closing",
      "title": "Closing & Takeaways",
      "duration": "3-5 minutes",
      "content": "<Session summary and wrap-up approach>",
      "student_callouts": [
        {{
          "student_name": "<name>",
          "type": "reinforcement",
          "content": "<Personalised positive reinforcement message for this student — mention specific growth or effort>"
        }},
        {{
          "student_name": "<name>",
          "type": "takeaway",
          "content": "<Personalised takeaway task or reflection prompt for this student>"
        }}
      ]
    }},
    {{
      "id": "teacher_notes",
      "title": "Teacher Notes",
      "duration": "",
      "content": "<General observations and things to monitor during the session>",
      "student_callouts": [
        {{
          "student_name": "<name>",
          "type": "watch_for",
          "content": "<Specific behaviour or reaction to watch for with this student during this topic>"
        }},
        {{
          "student_name": "<name>",
          "type": "trigger",
          "content": "<Potential mindset trigger for this student and how to respond>"
        }}
      ]
    }}
  ]
}}

Rules:
- Include every student in EVERY section's student_callouts (where applicable).
- For "main_content", include 2-3 concept chunks appropriate for {duration_minutes} minutes.
- All callout content must reference the student by name and be tailored to their mindset.
- Output ONLY the JSON object. No preamble, no markdown fences."""

    def _format_student_profile(self, num: int, student: Dict) -> str:
        notes_text = (
            '\n'.join(f'  - {n}' for n in student.get('recent_notes', []))
            or '  (no recent notes)'
        )
        return (
            f"Student {num}: {student['name']}\n"
            f"  Mindset Score: {student['mindset_score']}/100\n"
            f"  Classification: {student['classification']}\n"
            f"  Recent Teacher Notes:\n{notes_text}"
        )

    def _build_chat_system_prompt(
        self,
        plan_content: Dict,
        students_data: List[Dict],
    ) -> str:
        student_summary = '\n'.join(
            f"- {s['name']}: {s['classification']} mindset ({s['mindset_score']}/100)"
            for s in students_data
        )
        plan_json = json.dumps(plan_content, indent=2)
        return f"""You are a practical, encouraging teaching assistant helping a classroom teacher during or after a study session.

**Student Profiles:**
{student_summary}

**Full Study Plan (JSON):**
{plan_json}

Answer the teacher's questions conversationally in 3-8 sentences or a short bullet list. Be specific, actionable, and reference the study plan content where relevant. Address students by name when giving personalised advice. Keep responses concise — the teacher may be in the middle of a lesson."""

    # ── internal helpers ──────────────────────────────────────────────────────

    def _call(self, prompt: str, max_tokens: int) -> str:
        msg = self._client.messages.create(
            model=self.MODEL,
            max_tokens=max_tokens,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return msg.content[0].text

    @staticmethod
    def _fallback_plan(
        topic: str,
        duration_minutes: int,
        students_data: List[Dict],
    ) -> Dict:
        """Minimal valid plan returned when the API key is absent."""
        student_names = [s['name'] for s in students_data]
        names_str = ', '.join(student_names)

        opening_callouts = []
        main_callouts = []
        practice_callouts = []
        closing_callouts = []
        notes_callouts = []

        for s in students_data:
            name = s['name']
            cls = s.get('classification', 'mixed')
            score = s.get('mindset_score', 50)

            if cls == 'growth':
                approach = (
                    f"Challenge {name} with open-ended extensions — "
                    f"their score of {score}/100 shows they thrive when stretched."
                )
                task = f"Assign {name} the extension problem set to deepen understanding."
                reinforcement = (
                    f"Acknowledge {name}'s persistence and creative strategies today."
                )
            elif cls == 'fixed':
                approach = (
                    f"Use low-stakes, scaffolded examples with {name}. "
                    f"Their score of {score}/100 suggests confidence-building is a priority."
                )
                task = f"Provide {name} with a structured worksheet with clear steps."
                reinforcement = (
                    f"Highlight one specific effort {name} made, regardless of the outcome."
                )
            else:
                approach = (
                    f"Alternate between challenge and support for {name} (score {score}/100). "
                    "Celebrate small wins visibly."
                )
                task = f"Give {name} a mix of routine and slightly challenging problems."
                reinforcement = (
                    f"Point out a moment where {name} showed a growth mindset today."
                )

            main_callouts.append({
                'student_name': name,
                'type': 'approach',
                'content': approach,
            })
            main_callouts.append({
                'student_name': name,
                'type': 'questioning',
                'content': (
                    f"Ask {name}: 'What strategy are you using?' "
                    "to prime effort-based thinking."
                ),
            })
            practice_callouts.append({
                'student_name': name,
                'type': 'task',
                'content': task,
            })
            closing_callouts.append({
                'student_name': name,
                'type': 'reinforcement',
                'content': reinforcement,
            })
            closing_callouts.append({
                'student_name': name,
                'type': 'takeaway',
                'content': (
                    f"Ask {name} to write down one thing they learned and one thing "
                    f"they want to try next time with {topic}."
                ),
            })
            notes_callouts.append({
                'student_name': name,
                'type': 'watch_for',
                'content': (
                    f"Notice if {name} disengages during difficult parts of {topic}."
                ),
            })

        main_minutes = max(10, duration_minutes - 10)

        return {
            'topic': topic,
            'duration_minutes': duration_minutes,
            'sections': [
                {
                    'id': 'opening',
                    'title': 'Opening & Warm-up',
                    'duration': '2-3 minutes',
                    'content': (
                        f"Begin with a quick question: 'Can you think of something you "
                        f"found really hard to learn but eventually got better at?' "
                        f"This primes a growth mindset frame for {names_str} before "
                        f"diving into {topic}."
                    ),
                    'student_callouts': [],
                },
                {
                    'id': 'mindset_checkin',
                    'title': 'Mindset Check-in',
                    'duration': '2-3 minutes',
                    'content': (
                        f"Remind the group that today's goal is to practice, not to "
                        f"be perfect. Say: 'Mistakes with {topic} are data — they tell "
                        f"us exactly what to work on next.'"
                    ),
                    'student_callouts': [],
                },
                {
                    'id': 'main_content',
                    'title': 'Main Content',
                    'duration': f"{main_minutes - 10}-{main_minutes} minutes",
                    'content': (
                        f"Teach {topic} using worked examples, then guided practice. "
                        "Use differentiated questioning to keep all students engaged."
                    ),
                    'chunks': [
                        {
                            'title': f"Introduction to {topic}",
                            'explanation': (
                                f"Introduce the core concepts of {topic} using concrete, "
                                "relatable examples. Connect to prior knowledge."
                            ),
                            'student_callouts': main_callouts,
                        }
                    ],
                },
                {
                    'id': 'practice',
                    'title': 'Practice Activity',
                    'duration': '10-15 minutes',
                    'content': (
                        f"Independent or paired practice on {topic} problems. "
                        "Circulate and provide targeted feedback."
                    ),
                    'student_callouts': practice_callouts,
                },
                {
                    'id': 'closing',
                    'title': 'Closing & Takeaways',
                    'duration': '3-5 minutes',
                    'content': (
                        f"Wrap up by summarising the key ideas from {topic}. "
                        "Ask each student to share one thing they will take away."
                    ),
                    'student_callouts': closing_callouts,
                },
                {
                    'id': 'teacher_notes',
                    'title': 'Teacher Notes',
                    'duration': '',
                    'content': (
                        "Monitor engagement levels throughout. "
                        "Be ready to adjust difficulty up or down based on responses."
                    ),
                    'student_callouts': notes_callouts,
                },
            ],
        }

    @staticmethod
    def _fallback_chat_response(message: str) -> str:
        return (
            "I'm ready to help you navigate this session. "
            "You can ask me things like:\n\n"
            "• \"What should I do if a student gets frustrated?\"\n"
            "• \"Give me an alternative example for the struggling student\"\n"
            "• \"How should I handle it if we finish the activity early?\"\n\n"
            "_(Note: the AI assistant is unavailable right now — "
            "please check that ANTHROPIC_API_KEY is set in your .env file.)_"
        )
