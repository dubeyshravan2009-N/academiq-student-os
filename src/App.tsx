import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from '@/lib/context';
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
import { ShieldAlert, Zap } from 'lucide-react';

// Demo Profiles
const MOCK_PROFILES: Record<Role, { id: string; role: Role; full_name: string; email: string }> = {
  super_admin: { id: 'demo-sa', role: 'super_admin', full_name: 'Shravan Dubey (Super Admin)', email: 'sa@academiq.io' },
  school_admin: { id: 'demo-admin', role: 'school_admin', full_name: 'Principal Sharma', email: 'admin@greenwood.edu' },
  teacher: { id: 'demo-teacher', role: 'teacher', full_name: 'Mr. Verma (Class 10-A)', email: 'verma@greenwood.edu' },
  student: { id: 'demo-student', role: 'student', full_name: 'Rahul Dubey', email: 'rahul@student.edu' },
  parent: { id: 'demo-parent', role: 'parent', full_name: 'Mr. Dubey (Parent)', email: 'parent@gmail.com' },
};

function Shell() {
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);
  
  // Directly manage active role in state (Defaults to super_admin so panel shows immediately)
  const [activeRole, setActiveRole] = useState<Role | null>('super_admin');
  const activeProfile = activeRole ? MOCK_PROFILES[activeRole] : null;

  const roles: { key: Role; label: string }[] = [
    { key: 'super_admin', label: '⚡ Super Admin' },
    { key: 'school_admin', label: '🏫 School Admin' },
    { key: 'teacher', label: '👨‍🏫 Teacher' },
    { key: 'student', label: '🎓 Student' },
    { key: 'parent', label: '👪 Parent' },
  ];

  const handleRoleSwitch = (role: Role) => {
    setActiveRole(role);
    const routeMap: Record<Role, string> = {
      student: '/student',
      parent: '/parent',
      teacher: '/teacher',
      school_admin: '/admin',
      super_admin: '/super-admin',
    };
    navigate(routeMap[role]);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ⚡ TOP DEV BAR FOR INSTANT SWITCHING */}
      <div className="bg-slate-900 border-b border-slate-700 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-50 sticky top-0">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
          <Zap className="w-4 h-4 fill-amber-400" />
          <span>Active Profile:</span>
          <span className="text-slate-200 font-normal">
            {activeProfile ? `${activeProfile.full_name} (${activeProfile.role})` : 'Logged Out'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => handleRoleSwitch(r.key)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeRole === r.key
                  ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Navbar onRegisterSchool={() => setRegisterOpen(true)} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            !activeProfile ? (
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
              <Navigate to={`/${activeRole === 'school_admin' ? 'admin' : activeRole === 'super_admin' ? 'super-admin' : activeRole}`} replace />
            )
          }
        />

        {/* Dashboard Routes with direct role checks */}
        <Route path="/student" element={activeRole === 'student' ? <StudentDashboard /> : <AccessDenied allowed="student" />} />
        <Route path="/parent" element={activeRole === 'parent' ? <ParentDashboard /> : <AccessDenied allowed="parent" />} />
        <Route path="/teacher" element={activeRole === 'teacher' ? <TeacherDashboard /> : <AccessDenied allowed="teacher" />} />
        <Route path="/admin" element={activeRole === 'school_admin' ? <SchoolAdminDashboard /> : <AccessDenied allowed="school_admin" />} />
        <Route path="/super-admin" element={activeRole === 'super_admin' ? <SuperAdminDashboard /> : <AccessDenied allowed="super_admin" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </div>
  );
}

function AccessDenied({ allowed }: { allowed: string }) {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-error-50 text-error-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h2 className="font-display text-xl font-bold text-ink-900">Access Denied</h2>
      <p className="text-sm text-ink-500 mt-2">Use the Dev Bar at the top to switch your role to <strong>{allowed}</strong>.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
}

