'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Teacher } from '@/types/auth.types';

interface AuthState {
  teacher: Teacher | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (teacher: Teacher, access: string, refresh: string) => void;
  clearAuth: () => void;
  setTeacher: (teacher: Teacher) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      teacher: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (teacher, access, refresh) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
        }
        set({ teacher, accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({ teacher: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setTeacher: (teacher) => set({ teacher }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        teacher: state.teacher,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
