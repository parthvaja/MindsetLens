"""Unit tests for the MindsetScorer algorithm."""
import pytest
from decimal import Decimal

from apps.surveys.scoring import MindsetScorer


def _make_likert(values: dict) -> list:
    """Build a list of Likert response dicts from {question_number: answer_value}."""
    return [
        {
            'question_id': f'q{n}',
            'question_text': f'Question {n}',
            'answer_value': v,
        }
        for n, v in values.items()
    ]


def _make_text(q11: str = '', q12: str = '') -> list:
    responses = []
    if q11:
        responses.append({'question_id': 'q11', 'question_text': 'Q11', 'answer_text': q11})
    if q12:
        responses.append({'question_id': 'q12', 'question_text': 'Q12', 'answer_text': q12})
    return responses


def _full_survey(likert_values: dict, q11: str = '', q12: str = '') -> list:
    return _make_likert(likert_values) + _make_text(q11, q12)


# ── Likert component ──────────────────────────────────────────────────────────

class TestLikertScore:
    def test_all_fives_non_reversed(self):
        """All Strongly Agree on non-reversed questions → max score."""
        values = {1: 5, 3: 5, 4: 5, 6: 5, 8: 5, 9: 5, 10: 5}
        responses = _make_likert(values)
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('100')

    def test_all_ones_non_reversed(self):
        """All Strongly Disagree on non-reversed → min score."""
        values = {1: 1, 3: 1, 4: 1, 6: 1, 8: 1, 9: 1, 10: 1}
        responses = _make_likert(values)
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('0')

    def test_reverse_scoring_q2(self):
        """Q2 is reverse scored: answer=5 should become score=1."""
        responses = [{'question_id': 'q2', 'question_text': 'Q2', 'answer_value': 5}]
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('0')

    def test_reverse_scoring_q5(self):
        """Q5 reverse: answer=1 → score=5 (max)."""
        responses = [{'question_id': 'q5', 'question_text': 'Q5', 'answer_value': 1}]
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('100')

    def test_reverse_scoring_q7(self):
        """Q7 reverse: answer=3 → score=3 (neutral)."""
        responses = [{'question_id': 'q7', 'question_text': 'Q7', 'answer_value': 3}]
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('50')

    def test_midpoint_answer(self):
        """All answers=3 (neutral) → 50%."""
        values = {1: 3, 2: 3, 3: 3}
        responses = _make_likert(values)
        score = MindsetScorer._calculate_likert_score(responses)
        assert score == Decimal('50')

    def test_empty_responses(self):
        """Empty Likert list returns default 50."""
        score = MindsetScorer._calculate_likert_score([])
        assert score == Decimal('50')


# ── Text adjustment ───────────────────────────────────────────────────────────

class TestTextAdjustment:
    def test_growth_keywords_positive(self):
        adj = MindsetScorer._analyze_text_responses(
            'I tried again and practiced until I improved.',
            'Effort and perseverance matter most.',
        )
        assert adj > Decimal('0')

    def test_fixed_keywords_negative(self):
        adj = MindsetScorer._analyze_text_responses(
            'I just gave up because it was too hard.',
            'I think I am not good at this.',
        )
        assert adj < Decimal('0')

    def test_empty_text_returns_zero(self):
        adj = MindsetScorer._analyze_text_responses('', '')
        assert adj == Decimal('0')

    def test_neutral_text(self):
        adj = MindsetScorer._analyze_text_responses('I went to school today.', 'It was okay.')
        # Neutral text should produce a small adjustment close to 0
        assert Decimal('-5') <= adj <= Decimal('5')

    def test_adjustment_capped(self):
        """Keyword adjustment is capped at ±10 (plus ±5 sentiment = ±15 max)."""
        many_growth = ' '.join(['tried again practiced effort learn grow'] * 10)
        adj = MindsetScorer._analyze_text_responses(many_growth, many_growth)
        assert adj <= Decimal('15')


# ── Classification ────────────────────────────────────────────────────────────

class TestClassification:
    @pytest.mark.parametrize('score,expected', [
        (100, 'growth'),
        (70,  'growth'),
        (69.9, 'mixed'),
        (40,  'mixed'),
        (39.9, 'fixed'),
        (0,   'fixed'),
    ])
    def test_boundaries(self, score, expected):
        assert MindsetScorer._classify_mindset(score) == expected


# ── calculate_score (integration) ────────────────────────────────────────────

class TestCalculateScore:
    def _all_5_survey(self):
        """Survey where all Likert answers indicate strong growth mindset."""
        likert = {1: 5, 2: 1, 3: 5, 4: 5, 5: 1, 6: 5, 7: 1, 8: 5, 9: 5, 10: 5}
        texts = {
            'q11': 'I tried again and kept trying, practicing until I improved and learned.',
            'q12': 'Effort and hard work lead to growth; mistakes help us learn and progress.',
        }
        return [
            {'question_id': f'q{n}', 'question_text': f'Q{n}', 'answer_value': v}
            for n, v in likert.items()
        ] + [
            {'question_id': qid, 'question_text': qid, 'answer_text': text}
            for qid, text in texts.items()
        ]

    def test_growth_mindset_survey_scores_high(self):
        result = MindsetScorer.calculate_score(self._all_5_survey())
        assert result['growth_mindset_score'] >= 70
        assert result['classification'] == 'growth'

    def test_result_keys_present(self):
        result = MindsetScorer.calculate_score(self._all_5_survey())
        assert set(result.keys()) == {
            'growth_mindset_score', 'likert_component',
            'text_adjustment', 'classification',
        }

    def test_score_clamped_to_0_100(self):
        # Worst-case fixed mindset
        likert = {1: 1, 2: 5, 3: 1, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 1, 10: 1}
        texts = {
            'q11': 'I gave up because it was too hard and I am not good at this at all.',
            'q12': 'Talent is born with, I always fail and will never improve ever.',
        }
        responses = (
            [{'question_id': f'q{n}', 'question_text': f'Q{n}', 'answer_value': v}
             for n, v in likert.items()]
            + [{'question_id': qid, 'question_text': qid, 'answer_text': text}
               for qid, text in texts.items()]
        )
        result = MindsetScorer.calculate_score(responses)
        assert 0 <= result['growth_mindset_score'] <= 100
        assert result['classification'] == 'fixed'

    def test_processing_returns_float_not_decimal(self):
        result = MindsetScorer.calculate_score(self._all_5_survey())
        assert isinstance(result['growth_mindset_score'], float)
        assert isinstance(result['likert_component'], float)
