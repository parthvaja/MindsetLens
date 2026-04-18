import { apiClient } from './client';
import { DashboardStats, MindsetTrend, TeachingRecommendation, TeacherNote } from '@/types/api.types';
import { PaginatedResponse } from '@/types/api.types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/analytics/dashboard/');
  return data;
}

export async function getMindsetTrends(studentId: string): Promise<PaginatedResponse<MindsetTrend>> {
  const { data } = await apiClient.get<PaginatedResponse<MindsetTrend>>('/analytics/trends/', {
    params: { student_id: studentId },
  });
  return data;
}

export async function getRecommendations(
  studentId: string
): Promise<PaginatedResponse<TeachingRecommendation>> {
  const { data } = await apiClient.get<PaginatedResponse<TeachingRecommendation>>(
    '/recommendations/',
    { params: { student_id: studentId } }
  );
  return data;
}

export async function getNotes(studentId: string): Promise<PaginatedResponse<TeacherNote>> {
  const { data } = await apiClient.get<PaginatedResponse<TeacherNote>>('/notes/', {
    params: { student_id: studentId },
  });
  return data;
}

export async function createNote(payload: {
  student: string;
  note_text: string;
  observation_date: string;
}): Promise<TeacherNote> {
  const { data } = await apiClient.post<TeacherNote>('/notes/', payload);
  return data;
}
