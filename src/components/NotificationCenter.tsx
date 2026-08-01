import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, TrendingUp, BookOpen, Clock, X } from 'lucide-react';
import { Role } from '@/lib/types';

export interface AppNotification {
  id: string;
  role: Role;
  type: 'submission' | 'attendance' | 'marks' | 'goal' | 'general';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export function generateNotifications(role: Role): AppNotification[] {
  const now = new Date();
  const timeAgo = (mins: number) => {
    const d = new Date(now.getTime() - mins * 60000);
    return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
  };

  if (role === 'student') {
    return [
      { id: 'n1', role, type: 'submission', title: 'Submission Due Tomorrow', body: 'Notebook Submission pending for Science (Due Tomorrow)', time: timeAgo(15), read: false },
      { id: 'n2', role, type: 'general', title: 'Goal Reminder', body: 'Your short-term goal "Finish Python OOP Module" is due in 5 days.', time: timeAgo(120), read: false },
      { id: 'n3', role, type: 'attendance', title: 'Attendance Marked', body: 'You were marked Present today at 8:30 AM.', time: timeAgo(480), read: true },
    ];
  }
  if (role === 'parent') {
    return [
      { id: 'p1', role, type: 'attendance', title: 'Attendance Alert', body: 'Rahul was marked Present today at 8:30 AM.', time: timeAgo(480), read: false },
      { id: 'p2', role, type: 'marks', title: 'New Marks Added', body: 'Math Unit Test result: 88/100. Great job!', time: timeAgo(60), read: false },
      { id: 'p3', role, type: 'submission', title: 'Submission Reminder', body: 'Rahul has a Science Notebook due tomorrow.', time: timeAgo(30), read: false },
    ];
  }
  if (role === 'teacher') {
    return [
      { id: 't1', role, type: 'goal', title: 'Goal Approvals Pending', body: '3 New Goal completion requests pending approval.', time: timeAgo(20), read: false },
      { id: 't2', role, type: 'submission', title: 'Submissions to Review', body: '5 students submitted the Math Problem Set 5.', time: timeAgo(90), read: false },
      { id: 't3', role, type: 'attendance', title: 'Attendance Incomplete', body: 'Attendance for Class 10-A not yet marked today.', time: timeAgo(180), read: true },
    ];
  }
  return [];
}

const typeIcons: Record<string, React.ReactNode> = {
  submission: <BookOpen className="w-4 h-4 text-accent-600" />,
  attendance: <CheckCircle2 className="w-4 h-4 text-brand-600" />,
  marks: <TrendingUp className="w-4 h-4 text-brand-600" />,
  goal: <AlertCircle className="w-4 h-4 text-warning-600" />,
  general: <Clock className="w-4 h-4 text-ink-500" />,
};

export function NotificationCenter({ role }: { role: Role }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => generateNotifications(role));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-ink-200 bg-white hover:border-ink-300 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-ink-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] card shadow-card animate-scale-in z-50">
          <div className="flex items-center justify-between p-3.5 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-ink-600" />
              <h3 className="text-sm font-bold text-ink-900">Notifications</h3>
              {unread > 0 && <span className="badge bg-error-50 text-error-700 text-[10px]">{unread} new</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink-700">All caught up!</p>
                <p className="text-xs text-ink-400 mt-1">No new notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 border-b border-ink-50 last:border-0 transition-colors hover:bg-ink-50/50 ${!n.read ? 'bg-brand-50/30' : ''}`}
                >
                  <div className="shrink-0 mt-0.5">{typeIcons[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-ink-400 mt-1">{n.time}</p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="shrink-0 p-1 rounded text-ink-300 hover:text-ink-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
