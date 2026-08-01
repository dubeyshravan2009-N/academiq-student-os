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
import { ShieldAlert } from 'lucide-react';

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

// Main app shell — renders the navbar and the active route's content
function Shell() {
  const { session, profile, loading } = useApp();
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);

  if (loading) return <div className="min-h-screen"><FullSpinner label="Loading AcademiQ…" /></div>;

  return (
    <div className="min-h-screen bg-ink-50">
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
        {/* Protected dashboard routes — redirect to / if not logged in */}
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
