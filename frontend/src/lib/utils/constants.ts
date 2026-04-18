import { SurveyQuestion } from '@/types/survey.types';

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    text: 'When I face a difficult problem, I see it as a chance to learn something new.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q2',
    text: "If I don't understand something right away, I usually give up.",
    type: 'likert',
    reversed: true,
  },
  {
    id: 'q3',
    text: 'I believe my abilities can improve with practice and effort.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q4',
    text: 'Making mistakes is an important part of learning.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q5',
    text: "I prefer easy tasks where I know I'll do well.",
    type: 'likert',
    reversed: true,
  },
  {
    id: 'q6',
    text: 'When I receive criticism, I try to learn from it.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q7',
    text: "I think intelligence is something you're born with and can't change much.",
    type: 'likert',
    reversed: true,
  },
  {
    id: 'q8',
    text: 'I enjoy challenging tasks even if I might fail.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q9',
    text: 'When classmates do better than me, I feel inspired to improve.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q10',
    text: 'I believe effort is more important than natural talent.',
    type: 'likert',
    reversed: false,
  },
  {
    id: 'q11',
    text: 'Describe a time when you struggled with something in school. What did you do?',
    type: 'text',
    maxLength: 500,
  },
  {
    id: 'q12',
    text: 'What do you think makes someone successful in learning?',
    type: 'text',
    maxLength: 500,
  },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const GRADE_CHOICES = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
];

export const GENDER_CHOICES = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'NB', label: 'Non-binary' },
  { value: 'O', label: 'Other' },
  { value: 'P', label: 'Prefer not to say' },
];
