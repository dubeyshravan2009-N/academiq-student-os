/*
# AcademiQ v2 Step 2: Helper functions, trigger, and RLS policies

## Helper Functions
1. current_user_school_id() — returns school_id of authenticated user.
2. current_user_role() — returns role of authenticated user.
3. current_user_profile_id() — returns profile id of authenticated user.

## Trigger
1. on_school_approve — BEFORE UPDATE on schools: auto-generates SCH-XXXX access code
   when status changes to 'approved' and access_code is null.

## RLS Policies
- All new tables get authenticated, school-scoped policies.
- Super admin bypasses school scoping.
*/

-- ===================== HELPER FUNCTIONS =====================
CREATE OR REPLACE FUNCTION current_user_school_id() RETURNS uuid AS $$
  SELECT school_id FROM profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS $$
  SELECT role FROM profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_profile_id() RETURNS uuid AS $$
  SELECT id FROM profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================== TRIGGER: AUTO-GENERATE ACCESS CODE =====================
CREATE OR REPLACE FUNCTION generate_school_access_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.access_code IS NULL THEN
    NEW.access_code := 'SCH-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_school_approve ON schools;
CREATE TRIGGER on_school_approve
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION generate_school_access_code();

-- ===================== RLS POLICIES FOR NEW TABLES =====================

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "auth_select_activity_logs" ON activity_logs;
CREATE POLICY "auth_select_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_insert_activity_logs" ON activity_logs;
CREATE POLICY "auth_insert_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_delete_activity_logs" ON activity_logs;
CREATE POLICY "auth_delete_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING (current_user_role() = 'super_admin');

-- ENROLLMENT REQUESTS
DROP POLICY IF EXISTS "auth_select_enrollment" ON enrollment_requests;
CREATE POLICY "auth_select_enrollment" ON enrollment_requests FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_insert_enrollment" ON enrollment_requests;
CREATE POLICY "auth_insert_enrollment" ON enrollment_requests FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_update_enrollment" ON enrollment_requests;
CREATE POLICY "auth_update_enrollment" ON enrollment_requests FOR UPDATE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin')
  WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_delete_enrollment" ON enrollment_requests;
CREATE POLICY "auth_delete_enrollment" ON enrollment_requests FOR DELETE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');

-- SUBMISSIONS
DROP POLICY IF EXISTS "auth_select_submissions" ON submissions;
CREATE POLICY "auth_select_submissions" ON submissions FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_insert_submissions" ON submissions;
CREATE POLICY "auth_insert_submissions" ON submissions FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_update_submissions" ON submissions;
CREATE POLICY "auth_update_submissions" ON submissions FOR UPDATE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin')
  WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_delete_submissions" ON submissions;
CREATE POLICY "auth_delete_submissions" ON submissions FOR DELETE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');

-- CAREER RESULTS
DROP POLICY IF EXISTS "auth_select_career" ON career_results;
CREATE POLICY "auth_select_career" ON career_results FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_role() = 'super_admin'
  );
DROP POLICY IF EXISTS "auth_insert_career" ON career_results;
CREATE POLICY "auth_insert_career" ON career_results FOR INSERT
  TO authenticated WITH CHECK (current_user_role() IN ('student','super_admin'));
DROP POLICY IF EXISTS "auth_delete_career" ON career_results;
CREATE POLICY "auth_delete_career" ON career_results FOR DELETE
  TO authenticated USING (current_user_role() IN ('student','super_admin'));

-- TEACHER CLASSES
DROP POLICY IF EXISTS "auth_select_teacher_classes" ON teacher_classes;
CREATE POLICY "auth_select_teacher_classes" ON teacher_classes FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_insert_teacher_classes" ON teacher_classes;
CREATE POLICY "auth_insert_teacher_classes" ON teacher_classes FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_delete_teacher_classes" ON teacher_classes;
CREATE POLICY "auth_delete_teacher_classes" ON teacher_classes FOR DELETE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');

-- SESSION BACKUPS
DROP POLICY IF EXISTS "auth_select_backups" ON session_backups;
CREATE POLICY "auth_select_backups" ON session_backups FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_insert_backups" ON session_backups;
CREATE POLICY "auth_insert_backups" ON session_backups FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
DROP POLICY IF EXISTS "auth_delete_backups" ON session_backups;
CREATE POLICY "auth_delete_backups" ON session_backups FOR DELETE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');

-- ===================== TIGHTEN EXISTING TABLE POLICIES =====================
-- Replace anon-open policies with authenticated, school-scoped ones.

-- PROFILES
DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_select_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_update_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_delete_profiles" ON profiles;
CREATE POLICY "auth_select_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    auth_id = auth.uid()
    OR school_id = current_user_school_id()
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_profiles" ON profiles FOR INSERT
  TO authenticated WITH CHECK (current_user_role() IN ('school_admin','teacher','super_admin'));
CREATE POLICY "auth_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (auth_id = auth.uid() OR current_user_role() IN ('school_admin','super_admin'))
  WITH CHECK (true);
CREATE POLICY "auth_delete_profiles" ON profiles FOR DELETE
  TO authenticated USING (current_user_role() IN ('school_admin','super_admin'));

-- SCHOOLS
DROP POLICY IF EXISTS "anon_select_schools" ON schools;
DROP POLICY IF EXISTS "anon_insert_schools" ON schools;
DROP POLICY IF EXISTS "anon_update_schools" ON schools;
DROP POLICY IF EXISTS "anon_delete_schools" ON schools;
DROP POLICY IF EXISTS "auth_select_schools" ON schools;
DROP POLICY IF EXISTS "auth_insert_schools" ON schools;
DROP POLICY IF EXISTS "auth_update_schools" ON schools;
DROP POLICY IF EXISTS "auth_delete_schools" ON schools;
-- schools are readable by anyone authenticated (needed for login flow + access code lookup)
CREATE POLICY "auth_select_schools" ON schools FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_schools" ON schools FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_schools" ON schools FOR UPDATE
  TO authenticated USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');
CREATE POLICY "auth_delete_schools" ON schools FOR DELETE
  TO authenticated USING (current_user_role() = 'super_admin');

-- CLASSES
DROP POLICY IF EXISTS "anon_select_classes" ON classes;
DROP POLICY IF EXISTS "anon_insert_classes" ON classes;
DROP POLICY IF EXISTS "anon_update_classes" ON classes;
DROP POLICY IF EXISTS "anon_delete_classes" ON classes;
DROP POLICY IF EXISTS "auth_select_classes" ON classes;
DROP POLICY IF EXISTS "auth_insert_classes" ON classes;
DROP POLICY IF EXISTS "auth_update_classes" ON classes;
DROP POLICY IF EXISTS "auth_delete_classes" ON classes;
CREATE POLICY "auth_select_classes" ON classes FOR SELECT
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
CREATE POLICY "auth_insert_classes" ON classes FOR INSERT
  TO authenticated WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_classes" ON classes FOR UPDATE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin')
  WITH CHECK (school_id = current_user_school_id() OR current_user_role() = 'super_admin');
CREATE POLICY "auth_delete_classes" ON classes FOR DELETE
  TO authenticated USING (school_id = current_user_school_id() OR current_user_role() = 'super_admin');

-- STUDENTS
DROP POLICY IF EXISTS "anon_select_students" ON students;
DROP POLICY IF EXISTS "anon_insert_students" ON students;
DROP POLICY IF EXISTS "anon_update_students" ON students;
DROP POLICY IF EXISTS "anon_delete_students" ON students;
DROP POLICY IF EXISTS "auth_select_students" ON students;
DROP POLICY IF EXISTS "auth_insert_students" ON students;
DROP POLICY IF EXISTS "auth_update_students" ON students;
DROP POLICY IF EXISTS "auth_delete_students" ON students;
CREATE POLICY "auth_select_students" ON students FOR SELECT
  TO authenticated USING (
    parent_id = current_user_profile_id()
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_students" ON students FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_students" ON students FOR DELETE
  TO authenticated USING (current_user_role() IN ('school_admin','super_admin'));

-- ATTENDANCE
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
DROP POLICY IF EXISTS "auth_select_attendance" ON attendance;
DROP POLICY IF EXISTS "auth_insert_attendance" ON attendance;
DROP POLICY IF EXISTS "auth_update_attendance" ON attendance;
DROP POLICY IF EXISTS "auth_delete_attendance" ON attendance;
CREATE POLICY "auth_select_attendance" ON attendance FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (current_user_role() IN ('school_admin','super_admin'));

-- GOALS
DROP POLICY IF EXISTS "anon_select_goals" ON goals;
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
DROP POLICY IF EXISTS "auth_select_goals" ON goals;
DROP POLICY IF EXISTS "auth_insert_goals" ON goals;
DROP POLICY IF EXISTS "auth_update_goals" ON goals;
DROP POLICY IF EXISTS "auth_delete_goals" ON goals;
CREATE POLICY "auth_select_goals" ON goals FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_goals" ON goals FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_goals" ON goals FOR DELETE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');

-- TASKS
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
DROP POLICY IF EXISTS "auth_select_tasks" ON tasks;
DROP POLICY IF EXISTS "auth_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "auth_update_tasks" ON tasks;
DROP POLICY IF EXISTS "auth_delete_tasks" ON tasks;
CREATE POLICY "auth_select_tasks" ON tasks FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_tasks" ON tasks FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_tasks" ON tasks FOR DELETE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');

-- HABITS
DROP POLICY IF EXISTS "anon_select_habits" ON habits;
DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
DROP POLICY IF EXISTS "anon_update_habits" ON habits;
DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
DROP POLICY IF EXISTS "auth_select_habits" ON habits;
DROP POLICY IF EXISTS "auth_insert_habits" ON habits;
DROP POLICY IF EXISTS "auth_update_habits" ON habits;
DROP POLICY IF EXISTS "auth_delete_habits" ON habits;
CREATE POLICY "auth_select_habits" ON habits FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_habits" ON habits FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_habits" ON habits FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_habits" ON habits FOR DELETE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');

-- MARKS
DROP POLICY IF EXISTS "anon_select_marks" ON marks;
DROP POLICY IF EXISTS "anon_insert_marks" ON marks;
DROP POLICY IF EXISTS "anon_update_marks" ON marks;
DROP POLICY IF EXISTS "anon_delete_marks" ON marks;
DROP POLICY IF EXISTS "auth_select_marks" ON marks;
DROP POLICY IF EXISTS "auth_insert_marks" ON marks;
DROP POLICY IF EXISTS "auth_update_marks" ON marks;
DROP POLICY IF EXISTS "auth_delete_marks" ON marks;
CREATE POLICY "auth_select_marks" ON marks FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_marks" ON marks FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_marks" ON marks FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_marks" ON marks FOR DELETE
  TO authenticated USING (current_user_role() IN ('school_admin','super_admin'));

-- ACHIEVEMENTS
DROP POLICY IF EXISTS "anon_select_achievements" ON achievements;
DROP POLICY IF EXISTS "anon_insert_achievements" ON achievements;
DROP POLICY IF EXISTS "anon_update_achievements" ON achievements;
DROP POLICY IF EXISTS "anon_delete_achievements" ON achievements;
DROP POLICY IF EXISTS "auth_select_achievements" ON achievements;
DROP POLICY IF EXISTS "auth_insert_achievements" ON achievements;
DROP POLICY IF EXISTS "auth_update_achievements" ON achievements;
DROP POLICY IF EXISTS "auth_delete_achievements" ON achievements;
CREATE POLICY "auth_select_achievements" ON achievements FOR SELECT
  TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE parent_id = current_user_profile_id())
    OR current_user_school_id() IS NOT NULL
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');
CREATE POLICY "auth_update_achievements" ON achievements FOR UPDATE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_achievements" ON achievements FOR DELETE
  TO authenticated USING (current_user_school_id() IS NOT NULL OR current_user_role() = 'super_admin');

-- MESSAGES
DROP POLICY IF EXISTS "anon_select_messages" ON messages;
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
DROP POLICY IF EXISTS "auth_select_messages" ON messages;
DROP POLICY IF EXISTS "auth_insert_messages" ON messages;
DROP POLICY IF EXISTS "auth_update_messages" ON messages;
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_select_messages" ON messages FOR SELECT
  TO authenticated USING (
    parent_id = current_user_profile_id()
    OR teacher_id = current_user_profile_id()
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_insert_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    parent_id = current_user_profile_id()
    OR teacher_id = current_user_profile_id()
    OR current_user_role() = 'super_admin'
  );
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE
  TO authenticated USING (current_user_role() = 'super_admin')
  WITH CHECK (true);
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE
  TO authenticated USING (current_user_role() = 'super_admin');
