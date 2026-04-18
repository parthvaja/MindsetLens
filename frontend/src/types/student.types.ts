export type MindsetClassification = 'growth' | 'mixed' | 'fixed';

export type GradeLevel =
  | 'K' | '1' | '2' | '3' | '4' | '5' | '6'
  | '7' | '8' | '9' | '10' | '11' | '12';

export type Gender = 'M' | 'F' | 'NB' | 'O' | 'P';

export interface Student {
  id: string;
  teacher: string;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number | null;
  grade_level: GradeLevel | '';
  gender: Gender | '';
  notes: string;
  latest_mindset_score: number | null;
  latest_classification: MindsetClassification | null;
  last_assessed: string | null;
  survey_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  age?: number;
  grade_level?: GradeLevel;
  gender?: Gender;
  notes?: string;
}
