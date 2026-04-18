export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  results: T[];
}

export interface DashboardStats {
  total_students: number;
  assessed_students: number;
  growth_count: number;
  mixed_count: number;
  fixed_count: number;
  average_score: number | null;
  recent_assessments: number;
}

export interface MindsetTrend {
  id: string;
  student: string;
  student_name: string;
  score: number;
  classification: 'growth' | 'mixed' | 'fixed';
  data_source: 'survey' | 'note_analysis' | 'combined';
  recorded_at: string;
}

export interface TeacherNote {
  id: string;
  student: string;
  student_name: string;
  teacher: string;
  note_text: string;
  observation_date: string;
  sentiment_score: number | null;
  detected_themes: string[];
  created_at: string;
  updated_at: string;
}

export interface TeachingRecommendation {
  id: string;
  student: string;
  student_name: string;
  recommendation_text: string;
  category: 'communication' | 'feedback' | 'challenge' | 'motivation' | 'general';
  confidence_score: number;
  source: string;
  is_active: boolean;
  created_at: string;
}
