import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/lib/context';
import { Navbar } from '@/components/Navbar';
import { WelcomePage } from '@/pages/WelcomePage';
import { StaffLoginPage } from '@/dashboards/StaffLoginPage';
import { StudentLoginPage } from '@/dashboards/StudentLoginPage';
import { RegisterSchoolModal } from '@/components/RegisterSchoolModal';
import { StudentDashboard } from '@/dashboards/StudentView';
import { TeacherDashboard } from '@/dashboards/TeacherView';
import { ParentDashboard } from '@/dashboards/ParentView';
import { SchoolAdminDashboard } from '@/dashboards/AdminView';
import { SuperAdminDashboard } from '@/dashboards/SuperAdmin';
import { Role } from '@/lib/types';
import { FullSpinner } from '@/components/ui/Feedback';
import { ShieldAlert, Zap } from 'lucide-react';

// Demo Mock Profiles for instant testing
const MOCK_PROFILES: Record<Role, { id: string; role: Role; full_name: string; email: string }> = {
  super_admin: { id: 'demo-sa', role: 'super_admin', full_name: 'Shravan Dubey (Super Admin)', email: 'sa@academiq.io' },
  school_admin: { id: 'demo-admin', role: 'school_admin', full_name: 'Principal Sharma', email: 'admin@greenwood.edu' },
  teacher: { id: 'demo-teacher', role: 'teacher', full_name: 'Mr. Verma (Class 10-A)', email: 'verma@greenwood.edu' },
  student: { id: 'demo-student', role: 'student', full_name: 'Rahul Dubey', email: 'rahul@student.edu' },
  parent: { id: 'demo-parent', role: 'parent', full_name: 'Mr. Dubey (Parent)', email: 'parent@gmail.com' },
};

// Wraps a dashboard so only the specified roles can access it
function RoleGuard({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { profile } = useApp();
  if (!profile) return <Navigate to="/" replace />;
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

// Dev-Mode Quick Bypass Bar for testing panels without database authentication issues
function DevQuickLoginBar() {
  const { setProfile, setSession, profile } = useApp();
  const navigate = useNavigate();

  const handleDevLogin = (role: Role) => {
    const mockUser = MOCK_PROFILES[role];
    
    // Inject mock session and profile into Context
    if (setProfile) setProfile(mockUser as any);
    if (setSession) setSession({ user: mockUser } as any);

    const routeMap: Record<Role, string> = {
      student: '/student',
      parent: '/parent',
      teacher: '/teacher',
      school_admin: '/admin',
      super_admin: '/super-admin',
    };

    navigate(routeMap[role]);
  };

  const roles: { key: Role; label: string }[] = [
    { key: 'super_admin', label: '⚡ Super Admin' },
    { key: 'school_admin', label: '🏫 School Admin' },
    { key: 'teacher', label: '👨‍🏫 Teacher' },
    { key: 'student', label: '🎓 Student' },
    { key: 'parent', label: '👪 Parent' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-700 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-50 sticky top-0">
      <div className="flex items-center gap-1.5 font-semibold text-amber-400">
        <Zap className="w-4 h-4 fill-amber-400" />
        <span>Dev Switcher:</span>
        <span className="text-slate-200 font-normal">
          {profile ? `${profile.full_name} (${profile.role})` : 'Logged Out'}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => handleDevLogin(r.key)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              profile?.role === r.key
                ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main app shell — renders the navbar and the active route's content
function Shell() {
  const { session, profile, loading } = useApp();
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);

  if (loading) return <div className="min-h-screen"><FullSpinner label="Loading AcademiQ…" /></div>;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Dev Switcher Bar */}
      <DevQuickLoginBar />

      <Navbar onRegisterSchool={() => setRegisterOpen(true)} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            !session || !profile ? (
              <>
                <main>
                  <WelcomePage
                    onStaffLogin={() => navigate('/staff/login')}
                    onStudentLogin={() => navigate('/student/login')}
                    onRegisterSchool={() => setRegisterOpen(true)}
                  />
                </main>
                <RegisterSchoolModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
              </>
            ) : (
              <RoleRouter />
            )
          }
        />
        <Route
          path="/student/login"
          element={
            !session || !profile ? <StudentLoginPage onBack={() => navigate('/')} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/staff/login"
          element={
            !session || !profile ? <StaffLoginPage onBack={() => navigate('/')} /> : <Navigate to="/" replace />
          }
        />
        {/* Protected dashboard routes */}
        <Route path="/student" element={<RoleGuard allowed={['student']}><StudentDashboard /></RoleGuard>} />
        <Route path="/parent" element={<RoleGuard allowed={['parent']}><ParentDashboard /></RoleGuard>} />
        <Route path="/teacher" element={<RoleGuard allowed={['teacher']}><TeacherDashboard /></RoleGuard>} />
        <Route path="/admin" element={<RoleGuard allowed={['school_admin']}><SchoolAdminDashboard /></RoleGuard>} />
        <Route path="/super-admin" element={<RoleGuard allowed={['super_admin']}><SuperAdminDashboard /></RoleGuard>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Redirects logged-in users to their role-specific dashboard
function RoleRouter() {
  const { profile } = useApp();
  if (!profile) return <Navigate to="/" replace />;
  const routeMap: Record<Role, string> = {
    student: '/student',
    parent: '/parent',
    teacher: '/teacher',
    school_admin: '/admin',
    super_admin: '/super-admin',
  };
  return <Navigate to={routeMap[profile.role]} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
