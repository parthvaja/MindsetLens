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
        Generate a structured, observation-driven study plan for multiple students.

        students_data is a list of dicts:
          {
            "name": str,
            "mindset_score": float,
            "classification": str,          # 'growth' | 'mixed' | 'fixed'
            "observations": [               # ALL teacher notes, newest first
                {"date": "YYYY-MM-DD", "text": str},
                ...
            ],
          }

        Returns a structured dict (see _fallback_plan for the schema).
        """
        if self._client is None:
            return self._fallback_plan(topic, duration_minutes, students_data)

        prompt = self._build_plan_prompt(
            topic, duration_minutes, students_data, context_notes
        )
        try:
            raw = self._call(prompt, max_tokens=4000)
            # Strip accidental markdown fences
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

        students_data must include the full 'observations' list so the chatbot
        can suggest interest-based alternatives and flag sensitivities.

        conversation_history is a list of {"role": "user"|"assistant", "content": str}.
        """
        if self._client is None:
            return self._fallback_chat_response(message)

        system_prompt = self._build_chat_system_prompt(plan_content, students_data)
        messages = [*conversation_history, {'role': 'user', 'content': message}]

        try:
            msg = self._client.messages.create(
                model=self.MODEL,
                max_tokens=900,
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
            self._format_student_profile(s)
            for s in students_data
        )
        context_section = (
            f'\n**Additional context from teacher:**\n{context_notes}\n'
            if context_notes else ''
        )
        main_minutes = max(10, duration_minutes - 10)
        student_names = [s['name'] for s in students_data]
        names_list = ', '.join(student_names)

        # Build a concrete worked-example block showing exactly what
        # "observation-driven personalisation" looks like, so Claude
        # has no ambiguity about the standard expected.
        example_block = self._build_personalisation_example(topic, students_data)

        return f"""You are an expert educational consultant specialising in differentiated instruction and growth mindset pedagogy (Carol Dweck).

═══════════════════════════════════════════════
SESSION PARAMETERS
═══════════════════════════════════════════════
Topic:            {topic}
Total Duration:   {duration_minutes} minutes
Students:         {names_list}
{context_section}
═══════════════════════════════════════════════
STUDENT PROFILES  (read every observation carefully)
═══════════════════════════════════════════════
{student_profiles}

═══════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════
Generate a detailed, DEEPLY PERSONALISED study plan for this session.

PERSONALISATION RULES — you MUST follow all of these:

1. MINE THE OBSERVATIONS.
   Before writing a single line of the plan, identify from each student's
   observations:
   • Their interests, hobbies, passions, or fandoms (e.g. Marvel, Taylor Swift,
     football, gaming, cooking).
   • Their demonstrated strengths you can build on (e.g. "good at multiplication",
     "strong reader").
   • Their known weaknesses or anxieties to work around.
   • Any personal details that make a real-world context resonate for them.
   If a student has no observations, use their mindset classification to guide tone.

2. EVERY EXAMPLE MUST BE STUDENT-SPECIFIC.
   For each concept chunk in Main Content, write a separate, named example
   for EACH student that uses their actual interests. Do NOT write generic
   examples and then add "adjust for student X". The example text itself must
   reference the student's world.

   Example of what GOOD looks like (for topic "Fractions"):
{example_block}

3. PRACTICE PROBLEMS reference each student's interests.
   E.g. if a student likes gaming: "Your character has 3/4 health remaining..."
   if a student likes baking: "A recipe needs 2/3 cup of flour..."

4. CLOSING TAKEAWAY is personalised.
   The homework or reflection task for each student should connect to something
   they care about — not a generic "do 5 problems".

5. TEACHER NOTES = intelligence brief.
   For each student, flag:
   • The specific sensitivities or triggers visible in the observations.
   • The strengths the teacher can lean on.
   • A concrete intervention phrase to use if that student struggles.

═══════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════
Output ONLY a single valid JSON object — no markdown fences, no preamble.

{{
  "topic": "{topic}",
  "duration_minutes": {duration_minutes},
  "sections": [
    {{
      "id": "opening",
      "title": "Opening & Warm-up",
      "duration": "2-3 minutes",
      "content": "<Warm-up that references something at least one student cares about, to hook the group immediately>",
      "student_callouts": []
    }},
    {{
      "id": "mindset_checkin",
      "title": "Mindset Check-in",
      "duration": "2-3 minutes",
      "content": "<Growth mindset framing tailored to this group's specific pattern of strengths and anxieties>",
      "student_callouts": []
    }},
    {{
      "id": "main_content",
      "title": "Main Content",
      "duration": "{main_minutes - 10}-{main_minutes} minutes",
      "content": "<One-sentence overview of the teaching arc for {topic}>",
      "chunks": [
        {{
          "title": "<Concept chunk title>",
          "explanation": "<Core explanation of the concept — clear, jargon-free>",
          "student_callouts": [
            {{
              "student_name": "<exact name>",
              "type": "approach",
              "content": "<INTEREST-DRIVEN example for this specific student. Must reference their hobby/strength from observations. Start with their name.>"
            }},
            {{
              "student_name": "<exact name>",
              "type": "questioning",
              "content": "<A question phrased in terms of this student's world — e.g. if they like sport, frame it as a sport scenario>"
            }}
          ]
        }}
      ]
    }},
    {{
      "id": "practice",
      "title": "Practice Activity",
      "duration": "10-15 minutes",
      "content": "<General structure of the practice activity>",
      "student_callouts": [
        {{
          "student_name": "<exact name>",
          "type": "task",
          "content": "<Practice problem or task written around this student's interest. Must be concrete and immediately usable.>"
        }}
      ]
    }},
    {{
      "id": "closing",
      "title": "Closing & Takeaways",
      "duration": "3-5 minutes",
      "content": "<Wrap-up approach for the group>",
      "student_callouts": [
        {{
          "student_name": "<exact name>",
          "type": "reinforcement",
          "content": "<Praise that references something specific the teacher knows about this student from the observations>"
        }},
        {{
          "student_name": "<exact name>",
          "type": "takeaway",
          "content": "<Personalised homework or reflection that connects to this student's interests — not generic>"
        }}
      ]
    }},
    {{
      "id": "teacher_notes",
      "title": "Teacher Notes",
      "duration": "",
      "content": "<Cross-student patterns to watch; general pacing notes>",
      "student_callouts": [
        {{
          "student_name": "<exact name>",
          "type": "watch_for",
          "content": "<Specific behaviour or emotional cue from this student's observation history that may surface during {topic}>"
        }},
        {{
          "student_name": "<exact name>",
          "type": "trigger",
          "content": "<Known trigger from observations + exact phrase to de-escalate or re-engage this student>"
        }}
      ]
    }}
  ]
}}

Additional rules:
- Include EVERY student in EVERY section's student_callouts (where applicable).
- For main_content, include 2-3 concept chunks appropriate for {duration_minutes} minutes.
- If a student has no observations, base personalisation on mindset classification alone — say so explicitly in the callout so the teacher knows.
- Output ONLY the JSON. No text before or after."""

    def _build_personalisation_example(self, topic: str, students_data: List[Dict]) -> str:
        """
        Build a short worked example block that demonstrates interest-driven
        personalisation for this specific group, injected into the prompt so
        Claude has a concrete model to follow.
        """
        # Extract the first hint of an interest from each student's observations.
        lines = []
        for s in students_data:
            name = s['name']
            obs_texts = [o['text'] for o in s.get('observations', [])]
            hint = self._extract_interest_hint(obs_texts)
            if hint:
                lines.append(
                    f'   • {name} ({hint}): write an example about {topic} '
                    f'using "{hint}" as the real-world context'
                )
            else:
                lines.append(
                    f'   • {name} ({s["classification"]} mindset, no observations): '
                    f'use mindset-appropriate framing for {topic}'
                )
        return '\n'.join(lines) if lines else '   (no observation data available)'

    @staticmethod
    def _extract_interest_hint(obs_texts: List[str]) -> str:
        """
        Very lightweight heuristic: look for common interest keywords in the
        combined observation text and return the first match found.
        This is used only to seed the in-prompt example — Claude will do the
        full extraction itself.
        """
        combined = ' '.join(obs_texts).lower()
        INTEREST_KEYWORDS = [
            'marvel', 'avengers', 'spider-man', 'batman', 'dc comics',
            'taylor swift', 'beyoncé', 'pop music', 'k-pop', 'bts',
            'football', 'soccer', 'basketball', 'tennis', 'cricket', 'rugby',
            'minecraft', 'roblox', 'fortnite', 'gaming', 'video games',
            'baking', 'cooking', 'art', 'drawing', 'painting',
            'reading', 'books', 'harry potter', 'percy jackson',
            'animals', 'dogs', 'cats', 'horses',
            'space', 'astronomy', 'science',
            'music', 'guitar', 'piano', 'singing', 'dance',
            'lego', 'puzzles',
        ]
        for kw in INTEREST_KEYWORDS:
            if kw in combined:
                return kw
        return ''

    def _format_student_profile(self, student: Dict) -> str:
        """
        Render a student profile block for the prompt.
        Format:
            Student: [Name]
            Mindset Score: [score]/100 ([classification])
            Observations:
            - [date]: [text]
        """
        observations = student.get('observations', [])
        if observations:
            obs_lines = '\n'.join(
                f'  - {o["date"]}: {o["text"]}'
                for o in observations
            )
        else:
            obs_lines = '  (no observations recorded yet)'

        return (
            f"Student: {student['name']}\n"
            f"Mindset Score: {student['mindset_score']}/100 "
            f"({student['classification']})\n"
            f"Observations:\n{obs_lines}"
        )

    def _build_chat_system_prompt(
        self,
        plan_content: Dict,
        students_data: List[Dict],
    ) -> str:
        """
        System prompt for the study-plan chatbot.
        Includes the full plan JSON AND the complete observation history for
        every student so the assistant can suggest interest-based alternatives
        and flag sensitivities from the record.
        """
        student_profiles = '\n\n'.join(
            self._format_student_profile(s) for s in students_data
        )
        plan_json = json.dumps(plan_content, indent=2)

        return f"""You are a practical, encouraging teaching assistant helping a classroom teacher during or after a study session.

You have complete knowledge of the students' interests, strengths, and past observations. When the teacher asks for an alternative example, ALWAYS draw on a student's documented interests (e.g. if the notes say "likes Marvel", suggest a Marvel-themed problem). When asked about a student's likely reaction, reference specific observations.

═══════════════════════════════
FULL STUDENT PROFILES & OBSERVATIONS
═══════════════════════════════
{student_profiles}

═══════════════════════════════
FULL STUDY PLAN
═══════════════════════════════
{plan_json}

Respond in 3-8 sentences or a short bullet list. Be specific and actionable. Address students by name. Reference their documented interests when suggesting alternatives. Keep responses concise — the teacher may be mid-lesson."""

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
        """
        Observation-aware fallback plan returned when the API key is absent.
        Pulls the first interest hint from each student's observations so even
        the fallback has some personalisation.
        """
        student_names = [s['name'] for s in students_data]
        names_str = ', '.join(student_names)
        main_minutes = max(10, duration_minutes - 10)

        main_callouts: List[Dict] = []
        practice_callouts: List[Dict] = []
        closing_callouts: List[Dict] = []
        notes_callouts: List[Dict] = []

        for s in students_data:
            name = s['name']
            cls = s.get('classification', 'mixed')
            score = s.get('mindset_score', 50)
            obs_texts = [o['text'] for o in s.get('observations', [])]
            interest = StudyPlanGenerator._extract_interest_hint(obs_texts)
            interest_note = (
                f" (based on your observation that they like {interest})"
                if interest else ""
            )

            if cls == 'growth':
                approach = (
                    f"Challenge {name} with open-ended extensions{interest_note}. "
                    f"Their score of {score}/100 shows they thrive when stretched."
                )
                task = (
                    f"Give {name} an extension problem framed around {interest or topic}"
                    f"{interest_note}."
                )
                reinforcement = (
                    f"Acknowledge {name}'s persistence and creative strategies today."
                )
            elif cls == 'fixed':
                approach = (
                    f"Use low-stakes, scaffolded examples with {name}{interest_note}. "
                    f"Their score of {score}/100 suggests confidence-building is key."
                )
                task = (
                    f"Provide {name} with a structured step-by-step problem"
                    f"{f' set in a {interest} context' if interest else ''}."
                )
                reinforcement = (
                    f"Highlight one specific effort {name} made today, regardless of outcome."
                )
            else:
                approach = (
                    f"Alternate support and challenge for {name} (score {score}/100)"
                    f"{interest_note}. Celebrate small wins visibly."
                )
                task = (
                    f"Give {name} a mixed set — some routine problems and one"
                    f"{f' {interest}-themed' if interest else ''} stretch question."
                )
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
                    f"{'Frame it as a ' + interest + ' scenario if possible.' if interest else ''}"
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
                    f"Ask {name} to write one thing they learned about {topic}"
                    f"{f' using a {interest} example' if interest else ''} "
                    f"and one thing they want to try next time."
                ),
            })
            notes_callouts.append({
                'student_name': name,
                'type': 'watch_for',
                'content': (
                    f"Notice if {name} disengages during difficult parts of {topic}."
                    + (f" They respond well to {interest}-based framing." if interest else "")
                ),
            })
            if obs_texts:
                notes_callouts.append({
                    'student_name': name,
                    'type': 'trigger',
                    'content': (
                        f"Review observations for {name} — "
                        f"the most recent note reads: \"{obs_texts[0][:120]}...\""
                        if len(obs_texts[0]) > 120
                        else f"Review observations for {name}: \"{obs_texts[0]}\""
                    ),
                })

        return {
            'topic': topic,
            'duration_minutes': duration_minutes,
            'sections': [
                {
                    'id': 'opening',
                    'title': 'Opening & Warm-up',
                    'duration': '2-3 minutes',
                    'content': (
                        f"Open with: 'Think of something you found really hard to learn "
                        f"but eventually cracked — what changed?' This primes a growth "
                        f"mindset frame for {names_str} before diving into {topic}."
                    ),
                    'student_callouts': [],
                },
                {
                    'id': 'mindset_checkin',
                    'title': 'Mindset Check-in',
                    'duration': '2-3 minutes',
                    'content': (
                        f"Remind the group: 'Today's goal is to practice, not to be "
                        f"perfect. Mistakes with {topic} are data — they tell us exactly "
                        f"what to work on next.'"
                    ),
                    'student_callouts': [],
                },
                {
                    'id': 'main_content',
                    'title': 'Main Content',
                    'duration': f"{main_minutes - 10}-{main_minutes} minutes",
                    'content': (
                        f"Teach {topic} using worked examples, then guided practice. "
                        "Use differentiated questioning and interest-based contexts "
                        "to keep all students engaged."
                    ),
                    'chunks': [
                        {
                            'title': f"Introduction to {topic}",
                            'explanation': (
                                f"Introduce the core concepts of {topic} using concrete, "
                                "relatable real-world examples. Connect to each student's "
                                "prior knowledge and documented interests."
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
                        "Problems are tailored to each student's interests where possible. "
                        "Circulate and give process-focused feedback."
                    ),
                    'student_callouts': practice_callouts,
                },
                {
                    'id': 'closing',
                    'title': 'Closing & Takeaways',
                    'duration': '3-5 minutes',
                    'content': (
                        f"Wrap up by summarising the key ideas from {topic}. "
                        "Each student shares one takeaway and receives a personalised "
                        "positive acknowledgement."
                    ),
                    'student_callouts': closing_callouts,
                },
                {
                    'id': 'teacher_notes',
                    'title': 'Teacher Notes',
                    'duration': '',
                    'content': (
                        "Monitor engagement throughout. Be ready to adjust difficulty "
                        "up or down. Use each student's interest context to re-engage "
                        "them if they drift."
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
            "• \"Give me an alternative Marvel-themed example for [student]\"\n"
            "• \"What should I do if a student gets frustrated?\"\n"
            "• \"How should I handle it if we finish the activity early?\"\n\n"
            "_(Note: the AI assistant is unavailable right now — "
            "please check that ANTHROPIC_API_KEY is set in your .env file.)_"
        )
