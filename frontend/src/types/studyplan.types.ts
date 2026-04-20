export type CalloutType =
  | 'approach'
  | 'questioning'
  | 'task'
  | 'reinforcement'
  | 'takeaway'
  | 'watch_for'
  | 'trigger';

export interface StudentCallout {
  student_name: string;
  type: CalloutType;
  content: string;
}

export interface ContentChunk {
  title: string;
  explanation: string;
  student_callouts: StudentCallout[];
}

export interface PlanSection {
  id: string;
  title: string;
  duration: string;
  content: string;
  student_callouts?: StudentCallout[];
  /** Only present on the main_content section */
  chunks?: ContentChunk[];
}

export interface PlanContent {
  topic: string;
  duration_minutes: number;
  sections: PlanSection[];
}

export interface StudyPlan {
  id: string;
  topic: string;
  duration_minutes: number;
  student_ids: string[];
  context_notes: string;
  plan_content: PlanContent;
  student_count: number;
  created_at: string;
}

export interface StudyPlanSummary {
  id: string;
  topic: string;
  duration_minutes: number;
  student_count: number;
  created_at: string;
}

export interface GeneratePlanPayload {
  student_ids: string[];
  topic: string;
  duration_minutes: number;
  context_notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
