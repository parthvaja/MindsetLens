import { MindsetClassification } from './student.types';

export type SurveyType = 'initial' | 'followup' | 'quarterly';
export type QuestionType = 'likert' | 'text';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  reversed?: boolean;
  maxLength?: number;
}

export interface LikertResponse {
  question_id: string;
  question_text: string;
  answer_value: number;
}

export interface TextResponse {
  question_id: string;
  question_text: string;
  answer_text: string;
}

export type SurveyResponseItem = LikertResponse | TextResponse;

export interface SurveySubmission {
  survey_type: SurveyType;
  responses: SurveyResponseItem[];
}

export interface SurveyResult {
  survey_id: string;
  growth_mindset_score: number;
  likert_component: number;
  text_adjustment: number;
  classification: MindsetClassification;
  processing_time_ms: number;
  message: string;
}

export interface SurveyResponse {
  id: string;
  student: string;
  student_name: string;
  survey_type: SurveyType;
  responses: SurveyResponseItem[];
  growth_mindset_score: number;
  likert_component: number;
  text_adjustment: number;
  mindset_classification: MindsetClassification;
  ai_analysis_summary: string;
  processing_time_ms: number;
  created_at: string;
}
