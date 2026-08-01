/*
# AcademiQ v2 Step 1: Add columns and new tables

Adds new columns to existing tables and creates all new tables.
Helper functions and triggers added in step 2 (after auth_id column exists).
*/

-- ===================== ADD COLUMNS FIRST =====================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);

ALTER TABLE schools ADD COLUMN IF NOT EXISTS access_code text UNIQUE;

ALTER TABLE classes ADD COLUMN IF NOT EXISTS grade_level integer NOT NULL DEFAULT 1;

ALTER TABLE marks ADD COLUMN IF NOT EXISTS academic_year text NOT NULL DEFAULT '2025-2026';
CREATE INDEX IF NOT EXISTS idx_marks_year ON marks(academic_year);

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS academic_year text NOT NULL DEFAULT '2025-2026';
CREATE INDEX IF NOT EXISTS idx_attendance_year ON attendance(academic_year);

ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_level integer NOT NULL DEFAULT 1;

-- ===================== NEW TABLES =====================

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_logs_school ON activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at);

CREATE TABLE IF NOT EXISTS enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  roll_number text,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by_teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_enrollment_school ON enrollment_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_class ON enrollment_requests(class_id);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('notebook','homework','project')),
  title text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','graded')),
  due_date date,
  academic_year text NOT NULL DEFAULT '2025-2026',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_year ON submissions(academic_year);

CREATE TABLE IF NOT EXISTS career_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}'::jsonb,
  recommended_careers text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE career_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_career_student ON career_results(student_id);

CREATE TABLE IF NOT EXISTS teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, class_id)
);
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tc_teacher ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tc_class ON teacher_classes(class_id);

CREATE TABLE IF NOT EXISTS session_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  backup_data jsonb NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE session_backups ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_backups_school ON session_backups(school_id);
