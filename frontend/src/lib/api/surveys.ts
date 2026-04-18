import { apiClient } from './client';
import { SurveySubmission, SurveyResult, SurveyResponse } from '@/types/survey.types';
import { PaginatedResponse } from '@/types/api.types';

export async function submitSurvey(
  studentId: string,
  payload: SurveySubmission
): Promise<SurveyResult> {
  const { data } = await apiClient.post<SurveyResult>(
    `/surveys/submit/${studentId}/`,
    payload
  );
  return data;
}

export async function getSurveys(studentId?: string): Promise<PaginatedResponse<SurveyResponse>> {
  const { data } = await apiClient.get<PaginatedResponse<SurveyResponse>>('/surveys/', {
    params: studentId ? { student_id: studentId } : undefined,
  });
  return data;
}

export async function getSurvey(id: string): Promise<SurveyResponse> {
  const { data } = await apiClient.get<SurveyResponse>(`/surveys/${id}/`);
  return data;
}
