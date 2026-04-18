import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterData, Teacher } from '@/types/auth.types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/', credentials);
  return data;
}

export async function register(payload: RegisterData): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register/', payload);
  return data;
}

export async function getMe(): Promise<Teacher> {
  const { data } = await apiClient.get<Teacher>('/auth/me/');
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout/', { refresh: refreshToken });
}
