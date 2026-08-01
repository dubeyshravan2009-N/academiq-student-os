import { useState } from 'react';
import { Zap, X, ShieldCheck, GraduationCap, User, BookOpen, Users } from 'lucide-react';
import { DEV_ACCOUNTS, DevDemoAccount } from '@/lib/context';

interface DevModeBarProps {
  onLogin: (account: DevDemoAccount) => void;
}

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <ShieldCheck className="w-4 h-4" />,
  school_admin: <ShieldCheck className="w-4 h-4" />,
  teacher: <BookOpen className="w-4 h-4" />,
  student: <GraduationCap className="w-4 h-4" />,
  parent: <Users className="w-4 h-4" />,
};

export function DevModeBar({ onLogin }: DevModeBarProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full bg-warning-500 text-white px-3 py-1.5 text-xs font-bold shadow-lg hover:bg-warning-600 transition-colors"
      >
        <Zap className="w-3.5 h-3.5" /> Dev Mode
      </button>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-lg animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Zap className="w-4 h-4 fill-white" />
            <span className="text-sm font-bold">Dev-Mode Quick Login (For Testing)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DEV_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => onLogin(acc)}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
              >
                {roleIcons[acc.role]}
                Demo {acc.label}
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-white/10 hover:bg-white/20 p-1.5 transition-colors"
              aria-label="Hide dev bar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
