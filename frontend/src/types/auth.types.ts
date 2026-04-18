export interface Teacher {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  school_name: string;
  phone: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  teacher: Teacher;
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  school_name?: string;
}
