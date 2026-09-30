-- Enable Row Level Security (RLS) on all user-owned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if already defined to avoid duplicate name collision
DROP POLICY IF EXISTS "profiles_owner" ON public.profiles;
DROP POLICY IF EXISTS "semesters_owner" ON public.semesters;
DROP POLICY IF EXISTS "subjects_owner" ON public.subjects;
DROP POLICY IF EXISTS "attendance_records_owner" ON public.attendance_records;
DROP POLICY IF EXISTS "timetable_owner" ON public.timetable;
DROP POLICY IF EXISTS "grades_owner" ON public.grades;
DROP POLICY IF EXISTS "notifications_owner" ON public.notifications;

-- Strict Multi-Tenant Isolation Policies (USING for read/delete/update selection, WITH CHECK for insert/update validation)
CREATE POLICY "profiles_owner" ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "semesters_owner" ON public.semesters
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subjects_owner" ON public.subjects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_records_owner" ON public.attendance_records
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "timetable_owner" ON public.timetable
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "grades_owner" ON public.grades
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_owner" ON public.notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Indexes on Foreign Keys and Query Columns
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON public.semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_semesters_is_active ON public.semesters(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_date ON public.attendance_records(subject_id, date);
CREATE INDEX IF NOT EXISTS idx_timetable_user_id ON public.timetable(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.timetable(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_grades_user_id ON public.grades(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, read);