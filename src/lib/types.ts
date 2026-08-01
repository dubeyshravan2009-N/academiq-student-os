export type Role = 'student' | 'parent' | 'teacher' | 'school_admin' | 'super_admin';

export type SchoolStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type GoalLevel = 'long_term' | 'mid_term' | 'short_term';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type AchievementType = 'automatic' | 'school_verified' | 'external';
export type SubmissionType = 'notebook' | 'homework' | 'project';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export const CURRENT_ACADEMIC_YEAR = '2025-2026';

export interface School {
  id: string;
  name: string;
  principal_email: string | null;
  phone: string | null;
  address: string | null;
  status: SchoolStatus;
  subscription_plan: string;
  access_code: string | null;
  created_at: string;
}

export interface ClassRow {
  id: string;
  name: string;
  school_id: string | null;
  grade_level: number;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string | null;
  auth_id: string | null;
  full_name: string;
  role: Role;
  school_id: string | null;
  class_id: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string | null;
  roll_number: string | null;
  class_id: string | null;
  parent_id: string | null;
  grade_level: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by_teacher_id: string | null;
  academic_year: string;
  created_at: string;
}

export interface Goal {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  level: GoalLevel;
  status: GoalStatus;
  target_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  student_id: string;
  goal_id: string | null;
  title: string;
  priority: TaskPriority;
  is_completed: boolean;
  deadline: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  student_id: string;
  title: string;
  streak_count: number;
  last_completed_date: string | null;
  created_at: string;
}

export interface Mark {
  id: string;
  student_id: string;
  subject: string;
  exam_name: string;
  score_obtained: number;
  max_score: number;
  academic_year: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  type: AchievementType;
  verified_by_teacher_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  parent_id: string;
  teacher_id: string;
  sender_role: 'parent' | 'teacher';
  body: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  school_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EnrollmentRequest {
  id: string;
  student_name: string;
  roll_number: string | null;
  class_id: string | null;
  school_id: string | null;
  status: EnrollmentStatus;
  reviewed_by_teacher_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Submission {
  id: string;
  student_id: string;
  school_id: string | null;
  type: SubmissionType;
  title: string;
  subject: string | null;
  status: SubmissionStatus;
  due_date: string | null;
  academic_year: string;
  created_at: string;
}

export interface CareerResult {
  id: string;
  student_id: string;
  answers: Record<string, unknown> | null;
  recommended_careers: string[];
  created_at: string;
}

export interface TeacherClass {
  id: string;
  teacher_id: string;
  class_id: string;
  school_id: string | null;
  created_at: string;
}

export interface SessionBackup {
  id: string;
  school_id: string;
  academic_year: string;
  backup_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  parent: 'Parent',
  teacher: 'Teacher',
  school_admin: 'School Admin',
  super_admin: 'Super Admin',
};

export const ROLE_DASHBOARDS: Record<Role, string> = {
  student: 'student',
  parent: 'parent',
  teacher: 'teacher',
  school_admin: 'admin',
  super_admin: 'super-admin',
};
