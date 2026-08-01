import { useState } from 'react';
import { AppProvider, useApp } from '@/lib/context';
import { Header } from '@/components/Header';
import { WelcomePage } from '@/pages/WelcomePage';
import { StaffLoginPage } from '@/pages/StaffLoginPage';
import { StudentLoginPage } from '@/pages/StudentLoginPage';
import { RegisterSchoolModal } from '@/components/RegisterSchoolModal';
import { StudentDashboard } from '@/pages/StudentDashboard';
import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { ParentDashboard } from '@/pages/ParentDashboard';
import { SchoolAdminDashboard } from '@/pages/SchoolAdminDashboard';
import { SuperAdminDashboard } from '@/pages/SuperAdminDashboard';
import { Role } from '@/lib/types';
import { FullSpinner } from '@/components/ui/Feedback';
import { ShieldAlert } from 'lucide-react';

function RoleGuard({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { profile } = useApp();
  if (!profile) return null;
  if (!allowed.includes(profile.role)) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-error-50 text-error-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink-900">Access Denied</h2>
        <p className="text-sm text-ink-500 mt-2">You don't have permission to view this page. This area is restricted to {allowed.join(', ')}.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function Shell() {
  const { session, profile, loading } = useApp();
  const [portal, setPortal] = useState<'none' | 'staff' | 'student'>('none');
  const [registerOpen, setRegisterOpen] = useState(false);

  if (loading) return <div className="min-h-screen"><FullSpinner label="Loading AcademiQ…" /></div>;

  // Not logged in: show portal pages or welcome
  if (!session || !profile) {
    if (portal === 'staff') return <StaffLoginPage onBack={() => setPortal('none')} />;
    if (portal === 'student') return <StudentLoginPage onBack={() => setPortal('none')} />;

    return (
      <div className="min-h-screen bg-ink-50">
        <Header
          onStaffLogin={() => setPortal('staff')}
          onStudentLogin={() => setPortal('student')}
          onRegisterSchool={() => setRegisterOpen(true)}
        />
        <main><WelcomePage onStaffLogin={() => setPortal('staff')} onStudentLogin={() => setPortal('student')} onRegisterSchool={() => setRegisterOpen(true)} /></main>
        <RegisterSchoolModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      </div>
    );
  }

  // Logged in: route to role-based dashboard with guard
  const role = profile.role;
  return (
    <div className="min-h-screen bg-ink-50">
      <Header />
      <main>
        {role === 'student' && <RoleGuard allowed={['student']}><StudentDashboard /></RoleGuard>}
        {role === 'parent' && <RoleGuard allowed={['parent']}><ParentDashboard /></RoleGuard>}
        {role === 'teacher' && <RoleGuard allowed={['teacher']}><TeacherDashboard /></RoleGuard>}
        {role === 'school_admin' && <RoleGuard allowed={['school_admin']}><SchoolAdminDashboard /></RoleGuard>}
        {role === 'super_admin' && <RoleGuard allowed={['super_admin']}><SuperAdminDashboard /></RoleGuard>}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default App;
