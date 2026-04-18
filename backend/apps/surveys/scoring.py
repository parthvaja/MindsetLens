"""
Mindset scoring algorithm with NLP analysis.
"""
from decimal import Decimal
from typing import Dict, List

from textblob import TextBlob


class MindsetScorer:
    """Calculate growth mindset score from survey responses."""

    # Question numbers that require reverse scoring (higher value = fixed mindset)
    REVERSE_SCORED = [2, 5, 7]

    GROWTH_KEYWORDS = [
        'tried again', 'practiced', 'asked for help', 'learned from',
        'effort', 'worked hard', "didn't give up", 'persevered',
        'improved', 'got better', 'kept trying', 'challenge',
        'mistake', 'learn', 'grow', 'progress', 'practice',
    ]

    FIXED_KEYWORDS = [
        'gave up', 'too hard', 'not good at', "can't do",
        'born with', 'naturally smart', 'talent', 'not smart enough',
        'impossible', 'always fail', 'just the way i am',
    ]

    @classmethod
    def calculate_score(cls, responses: List[Dict]) -> Dict:
        """
        Calculate mindset score from survey responses.

        Args:
            responses: list of response dicts with format:
                [{"question_id": "q1", "answer_value": 4}, ...]
                [{"question_id": "q11", "answer_text": "..."}, ...]

        Returns:
            dict with growth_mindset_score, likert_component,
            text_adjustment, and classification.
        """
        # Step 1: Calculate Likert component (questions q1–q10)
        likert_responses = [
            r for r in responses
            if r.get('question_id', '').startswith('q')
            and r.get('question_id', 'q99')[1:].isdigit()
            and 1 <= int(r['question_id'][1:]) <= 10
        ]
        likert_score = cls._calculate_likert_score(likert_responses)

        # Step 2: Analyse open-ended responses (q11, q12)
        text_q11 = next(
            (r.get('answer_text', '') for r in responses if r.get('question_id') == 'q11'), ''
        )
        text_q12 = next(
            (r.get('answer_text', '') for r in responses if r.get('question_id') == 'q12'), ''
        )
        text_adjustment = cls._analyze_text_responses(text_q11, text_q12)

        # Step 3: Combine and clamp to 0–100
        final_score = min(100.0, max(0.0, float(likert_score) + float(text_adjustment)))

        # Step 4: Classify
        classification = cls._classify_mindset(final_score)

        return {
            'growth_mindset_score': round(final_score, 2),
            'likert_component': round(float(likert_score), 2),
            'text_adjustment': round(float(text_adjustment), 2),
            'classification': classification,
        }

    @classmethod
    def _calculate_likert_score(cls, likert_responses: List[Dict]) -> Decimal:
        """Convert Likert answers (1–5) to a 0–100 percentage."""
        if not likert_responses:
            return Decimal('50')

        scores = []
        for response in likert_responses:
            q_num = int(response['question_id'][1:])
            value = int(response['answer_value'])

            # Reverse-score fixed-mindset questions
            score = (6 - value) if q_num in cls.REVERSE_SCORED else value
            scores.append(score)

        avg = sum(scores) / len(scores)
        percentage = ((avg - 1) / 4) * 100
        return Decimal(str(percentage))

    @classmethod
    def _analyze_text_responses(cls, text_q11: str, text_q12: str) -> Decimal:
        """Return a score adjustment (±15 max) based on keyword and sentiment analysis."""
        combined_text = (text_q11 + ' ' + text_q12).lower().strip()
        if not combined_text:
            return Decimal('0')

        growth_count = sum(1 for phrase in cls.GROWTH_KEYWORDS if phrase in combined_text)
        fixed_count = sum(1 for phrase in cls.FIXED_KEYWORDS if phrase in combined_text)

        if growth_count > fixed_count:
            keyword_adjustment = min(10, growth_count * 3)
        elif fixed_count > growth_count:
            keyword_adjustment = -min(10, fixed_count * 3)
        else:
            keyword_adjustment = 0

        # Sentiment contributes ±5 points
        sentiment = TextBlob(combined_text).sentiment.polarity  # –1 to 1
        sentiment_adjustment = sentiment * 5

        total = keyword_adjustment + sentiment_adjustment
        return Decimal(str(round(total, 4)))

    @classmethod
    def _classify_mindset(cls, score: float) -> str:
        if score >= 70:
            return 'growth'
        elif score >= 40:
            return 'mixed'
        return 'fixed'
