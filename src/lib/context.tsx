import { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile, Role, Student } from '@/lib/types';

export interface DevDemoAccount {
  role: Role;
  label: string;
  fullName: string;
  email: string;
  schoolId: string;
  classId: string;
  studentId?: string;
  rollNumber?: string;
  gradeLevel?: number;
  parentId?: string;
}

export const DEV_ACCOUNTS: DevDemoAccount[] = [
  { role: 'super_admin', label: 'Super Admin', fullName: 'Shravan Dubey', email: 'dubeyshravan2009@gmail.com', schoolId: '', classId: '' },
  { role: 'school_admin', label: 'School Admin', fullName: 'Vikram Sharma', email: 'vikram@greenwood.edu', schoolId: 'school-greenwood-001', classId: '' },
  { role: 'teacher', label: 'Teacher', fullName: 'Anjali Sharma', email: 'anjali@greenwood.edu', schoolId: 'school-greenwood-001', classId: 'class-10a-001' },
  { role: 'student', label: 'Student', fullName: 'Rahul Dubey', email: 'rahul.dubey@student.edu', schoolId: 'school-greenwood-001', classId: 'class-10a-001', studentId: 'student-rahul-001', rollNumber: '10A-21', gradeLevel: 10, parentId: 'parent-rahul-001' },
  { role: 'parent', label: 'Parent', fullName: 'Sunita Dubey', email: 'sunita.dubey@example.com', schoolId: 'school-greenwood-001', classId: 'class-10a-001', studentId: 'student-rahul-001' },
];

interface AppContextValue {
  session: Session | null;
  profile: Profile | null;
  student: Student | null;
  loading: boolean;
  role: Role | null;
  schoolId: string | null;
  isDevMode: boolean;
  devLogin: (account: DevDemoAccount) => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (isDevMode) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      (async () => {
        setSession(s);
        if (!s) {
          setProfile(null);
          setStudent(null);
          setLoading(false);
        }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, [isDevMode]);

  useEffect(() => {
    if (isDevMode) return;
    if (!session?.user) {
      setProfile(null);
      setStudent(null);
      if (session === null) setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error || !prof) {
        setProfile(null);
        setStudent(null);
        setLoading(false);
        return;
      }
      setProfile(prof as Profile);

      const p = prof as Profile;
      if (p.role === 'student') {
        const { data: stu } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', p.user_id || p.id)
          .maybeSingle();
        if (!cancelled) setStudent(stu as Student | null);
      } else if (p.role === 'parent') {
        const { data: stu } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', p.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!cancelled) setStudent(stu as Student | null);
      } else {
        setStudent(null);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [session]);

  const devLogin = (account: DevDemoAccount) => {
    const mockProfile: Profile = {
      id: `dev_${account.role}`,
      user_id: `dev_${account.role}`,
      auth_id: null,
      full_name: account.fullName,
      role: account.role,
      school_id: account.schoolId || null,
      class_id: account.classId || null,
      created_at: new Date().toISOString(),
    };
    let mockStudent: Student | null = null;
    if (account.role === 'student' && account.studentId) {
      mockStudent = {
        id: account.studentId,
        user_id: `dev_student`,
        roll_number: account.rollNumber || null,
        class_id: account.classId,
        parent_id: account.parentId || null,
        grade_level: account.gradeLevel || 10,
        created_at: new Date().toISOString(),
      };
    } else if (account.role === 'parent' && account.studentId) {
      mockStudent = {
        id: account.studentId,
        user_id: `dev_student`,
        roll_number: '10A-21',
        class_id: account.classId,
        parent_id: `dev_parent`,
        grade_level: 10,
        created_at: new Date().toISOString(),
      };
    }
    setIsDevMode(true);
    setSession(null);
    setProfile(mockProfile);
    setStudent(mockStudent);
    setLoading(false);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      profile,
      student,
      loading,
      role: profile?.role ?? null,
      schoolId: profile?.school_id ?? null,
      isDevMode,
      devLogin,
      signOut: async () => {
        if (isDevMode) {
          setIsDevMode(false);
          setProfile(null);
          setStudent(null);
          setSession(null);
          return;
        }
        await supabase.auth.signOut();
        setProfile(null);
        setStudent(null);
      },
    }),
    [session, profile, student, loading, isDevMode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
