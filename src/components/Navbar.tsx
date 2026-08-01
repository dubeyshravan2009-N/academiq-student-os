import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, Menu, X, User, ShieldCheck, Building } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Role, ROLE_LABELS } from '@/lib/types';
import { NotificationCenter } from '@/components/NotificationCenter';

// Maps each role to its corresponding dashboard icon
const roleIcon: Record<Role, React.ReactNode> = {
  student: <GraduationCap className="w-4 h-4" />,
  parent: <User className="w-4 h-4" />,
  teacher: <User className="w-4 h-4" />,
  school_admin: <User className="w-4 h-4" />,
  super_admin: <ShieldCheck className="w-4 h-4" />,
};

interface NavbarProps {
  onRegisterSchool?: () => void;
}

// Top navigation bar — shown on every page. Shows login buttons when logged out,
// or the user's profile menu + notifications bell when logged in.
export function Navbar({ onRegisterSchool }: NavbarProps = {}) {
  const { profile, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile dropdown when clicking outside of it
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Determine which login buttons to show based on the current route
  const isWelcome = location.pathname === '/';
  const showLoginButtons = !profile && isWelcome;

  return (
    <header className="sticky top-0 z-40 glass border-b border-ink-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo — always navigates home */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">AcademiQ</span>
            <span className="text-[10px] font-medium text-ink-400 tracking-wide uppercase">Student OS</span>
          </div>
        </button>

        {profile ? (
          // Logged-in: notifications bell + profile dropdown
          <div className="flex items-center gap-2">
            <NotificationCenter role={profile.role} />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:border-ink-300 transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center">{roleIcon[profile.role]}</span>
                <span className="hidden sm:inline">{profile.full_name}</span>
                <ChevronDown className="w-4 h-4 text-ink-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 card shadow-card p-1.5 animate-scale-in z-50">
                  <div className="px-2.5 py-2 border-b border-ink-100 mb-1">
                    <p className="text-sm font-semibold text-ink-800">{profile.full_name}</p>
                    <p className="text-xs text-ink-400">{ROLE_LABELS[profile.role]}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); navigate('/'); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : showLoginButtons ? (
          // Logged-out on welcome page: show login + register buttons
          <>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate('/student/login')} className="btn-ghost text-sm">
                <User className="w-4 h-4" /> Student/Parent Login
              </button>
              <button onClick={() => navigate('/staff/login')} className="btn-secondary text-sm">
                <ShieldCheck className="w-4 h-4" /> Staff Login
              </button>
              {onRegisterSchool && (
                <button onClick={onRegisterSchool} className="btn-primary text-sm">
                  <Building className="w-4 h-4" /> Register School
                </button>
              )}
            </div>
            <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        ) : null}
      </div>

      {/* Mobile dropdown menu for logged-out users */}
      {mobileOpen && !profile && showLoginButtons && (
        <div className="md:hidden border-t border-ink-100 px-4 py-3 space-y-1 animate-slide-up glass">
          <button onClick={() => { navigate('/student/login'); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100">Student/Parent Login</button>
          <button onClick={() => { navigate('/staff/login'); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100">Staff & Admin Login</button>
          {onRegisterSchool && (
            <button onClick={() => { onRegisterSchool(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-brand-700 hover:bg-brand-50">Register School</button>
          )}
        </div>
      )}
    </header>
  );
}
