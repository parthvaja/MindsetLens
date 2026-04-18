import { apiClient } from './client';
import { Student, StudentFormData } from '@/types/student.types';
import { PaginatedResponse } from '@/types/api.types';

export async function getStudents(params?: {
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<PaginatedResponse<Student>> {
  const { data } = await apiClient.get<PaginatedResponse<Student>>('/students/', { params });
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await apiClient.get<Student>(`/students/${id}/`);
  return data;
}

export async function createStudent(payload: StudentFormData): Promise<Student> {
  const { data } = await apiClient.post<Student>('/students/', payload);
  return data;
}

export async function updateStudent(id: string, payload: Partial<StudentFormData>): Promise<Student> {
  const { data } = await apiClient.patch<Student>(`/students/${id}/`, payload);
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiClient.delete(`/students/${id}/`);
}
