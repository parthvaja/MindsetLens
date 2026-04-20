import { apiClient } from './client';
import { PaginatedResponse } from '@/types/api.types';
import {
  StudyPlan,
  StudyPlanSummary,
  GeneratePlanPayload,
  ChatMessage,
} from '@/types/studyplan.types';

export async function getStudyPlans(): Promise<PaginatedResponse<StudyPlanSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<StudyPlanSummary>>('/studyplans/');
  return data;
}

export async function getStudyPlan(id: string): Promise<StudyPlan> {
  const { data } = await apiClient.get<StudyPlan>(`/studyplans/${id}/`);
  return data;
}

export async function generateStudyPlan(payload: GeneratePlanPayload): Promise<StudyPlan> {
  const { data } = await apiClient.post<StudyPlan>('/studyplans/generate/', payload);
  return data;
}

export async function chatWithStudyPlan(
  planId: string,
  message: string,
  conversationHistory: ChatMessage[],
): Promise<{ response: string }> {
  const { data } = await apiClient.post<{ response: string }>(
    `/studyplans/${planId}/chat/`,
    { message, conversation_history: conversationHistory },
  );
  return data;
}
