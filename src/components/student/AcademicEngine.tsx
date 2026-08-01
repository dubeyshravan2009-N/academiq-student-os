import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Notebook,
  FileText,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';
import { MockMark, MockAttendance, MockSubmission } from '@/data/mockData';
import { AttendanceStatus, SubmissionType, SubmissionStatus } from '@/lib/types';

interface AcademicEngineProps {
  marks: MockMark[];
  attendance: MockAttendance[];
  submissions: MockSubmission[];
  onUpdateSubmission: (id: string, status: SubmissionStatus) => void;
}

const examTypeLabels: Record<string, string> = {
  unit_test: 'Unit Test',
  mid_term: 'Mid-Term',
  final: 'Final',
};

const examTypeColors: Record<string, string> = {
  unit_test: 'bg-accent-50 text-accent-700 border-accent-100',
  mid_term: 'bg-warning-50 text-warning-700 border-warning-100',
  final: 'bg-brand-50 text-brand-700 border-brand-100',
};

export function AcademicEngine({ marks, attendance, submissions, onUpdateSubmission }: AcademicEngineProps) {
  const [view, setView] = useState<'marks' | 'attendance' | 'submissions'>('marks');

  const tabs = [
    { id: 'marks' as const, label: 'Exam Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'attendance' as const, label: 'Attendance', icon: <Calendar className="w-4 h-4" /> },
    { id: 'submissions' as const, label: 'Submissions', icon: <Notebook className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="section-title">Academic & Attendance Engine</h3>
        <p className="text-sm text-ink-500 mt-0.5">Current academic year performance overview</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-ink-100 p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              view === t.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {view === 'marks' && <MarksView marks={marks} />}
      {view === 'attendance' && <AttendanceView attendance={attendance} />}
      {view === 'submissions' && <SubmissionsView submissions={submissions} onUpdate={onUpdateSubmission} />}
    </div>
  );
}

function MarksView({ marks }: { marks: MockMark[] }) {
  const subjects = [...new Set(marks.map((m) => m.subject))];
  const examTypes = ['unit_test', 'mid_term', 'final'];

  const subjectAverages = subjects.map((subject) => {
    const subjectMarks = marks.filter((m) => m.subject === subject);
    const avg = subjectMarks.length
      ? Math.round((subjectMarks.reduce((s, m) => s + (m.score_obtained / m.max_score) * 100, 0) / subjectMarks.length))
      : 0;
    return { subject, avg, count: subjectMarks.length };
  });

  const overallAvg = marks.length
    ? Math.round((marks.reduce((s, m) => s + (m.score_obtained / m.max_score) * 100, 0) / marks.length))
    : 0;

  const bestSubject = [...subjectAverages].sort((a, b) => b.avg - a.avg)[0];
  const worstSubject = [...subjectAverages].sort((a, b) => a.avg - b.avg)[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-brand-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Overall Avg</p>
          </div>
          <p className="stat-num text-ink-900">{overallAvg}<span className="text-base text-ink-400 ml-1">%</span></p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Best Subject</p>
          </div>
          <p className="font-display text-lg font-bold text-ink-900 truncate">{bestSubject?.subject || '—'}</p>
          <p className="text-xs text-brand-600 font-semibold">{bestSubject?.avg || 0}%</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-warning-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Needs Work</p>
          </div>
          <p className="font-display text-lg font-bold text-ink-900 truncate">{worstSubject?.subject || '—'}</p>
          <p className="text-xs text-warning-600 font-semibold">{worstSubject?.avg || 0}%</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-accent-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Exams Taken</p>
          </div>
          <p className="stat-num text-ink-900">{marks.length}</p>
        </div>
      </div>

      {/* Subject-wise breakdown */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-ink-900 mb-4">Subject Performance</h4>
        <div className="space-y-4">
          {subjectAverages.map((s) => (
            <div key={s.subject}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-ink-800">{s.subject}</span>
                <span className="text-sm font-bold text-ink-900">{s.avg}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.avg >= 80 ? 'bg-brand-500' : s.avg >= 60 ? 'bg-warning-400' : 'bg-error-400'
                  }`}
                  style={{ width: `${s.avg}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed marks table */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-ink-900 mb-4">Exam-wise Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left font-semibold text-ink-500 py-2 px-2">Subject</th>
                {examTypes.map((et) => (
                  <th key={et} className="text-center font-semibold text-ink-500 py-2 px-2">{examTypeLabels[et]}</th>
                ))}
                <th className="text-right font-semibold text-ink-500 py-2 px-2">Average</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const subjectMarks = marks.filter((m) => m.subject === subject);
                const avg = Math.round(
                  subjectMarks.reduce((s, m) => s + (m.score_obtained / m.max_score) * 100, 0) / subjectMarks.length
                );
                return (
                  <tr key={subject} className="border-b border-ink-50 last:border-0">
                    <td className="py-2.5 px-2 font-semibold text-ink-800">{subject}</td>
                    {examTypes.map((et) => {
                      const mark = subjectMarks.find((m) => m.exam_type === et);
                      if (!mark) return <td key={et} className="text-center py-2.5 px-2 text-ink-300">—</td>;
                      const pct = Math.round((mark.score_obtained / mark.max_score) * 100);
                      return (
                        <td key={et} className="text-center py-2.5 px-2">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-ink-900">{mark.score_obtained}<span className="text-ink-400">/{mark.max_score}</span></span>
                            <span className={`badge ${pct >= 80 ? 'bg-brand-50 text-brand-700' : pct >= 60 ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'} text-[10px]`}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-right py-2.5 px-2">
                      <span className={`font-bold ${avg >= 80 ? 'text-brand-600' : avg >= 60 ? 'text-warning-600' : 'text-error-600'}`}>{avg}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AttendanceView({ attendance }: { attendance: MockAttendance[] }) {
  const total = attendance.length;
  const present = attendance.filter((r) => r.status === 'present').length;
  const late = attendance.filter((r) => r.status === 'late').length;
  const absent = attendance.filter((r) => r.status === 'absent').length;
  const pct = total ? Math.round(((present + late) / total) * 100) : 0;

  // Build calendar grid (last 45 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 44);

  const map = new Map<string, AttendanceStatus>();
  attendance.forEach((r) => map.set(r.date, r.status));

  const days: { date: Date; status: AttendanceStatus | null }[] = [];
  for (let i = 0; i < 45; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: d, status: map.get(key) || null });
  }

  const cellColor: Record<string, string> = {
    present: 'bg-brand-500',
    late: 'bg-warning-400',
    absent: 'bg-error-400',
  };

  // Recent log (last 10)
  const recentLog = [...attendance].reverse().slice(0, 10);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Gauge + stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eceef2" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke={pct >= 85 ? '#1fb080' : pct >= 70 ? '#fbbf24' : '#ef4444'}
                strokeWidth="3.5" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold text-ink-900">{pct}%</span>
              <span className="text-[10px] text-ink-400 uppercase font-medium">Attendance</span>
            </div>
          </div>
          <p className={`text-sm font-semibold mt-2 ${pct >= 85 ? 'text-brand-600' : pct >= 70 ? 'text-warning-600' : 'text-error-600'}`}>
            {pct >= 85 ? 'Excellent' : pct >= 75 ? 'Good' : 'Needs Improvement'}
          </p>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h4 className="text-sm font-bold text-ink-900 mb-4">Breakdown</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-brand-50 p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <p className="font-display text-2xl font-extrabold text-brand-700">{present}</p>
              <p className="text-xs text-brand-600 font-medium mt-0.5">Present</p>
            </div>
            <div className="rounded-xl bg-warning-50 p-4 text-center">
              <Clock className="w-5 h-5 text-warning-600 mx-auto mb-1" />
              <p className="font-display text-2xl font-extrabold text-warning-600">{late}</p>
              <p className="text-xs text-warning-600 font-medium mt-0.5">Late</p>
            </div>
            <div className="rounded-xl bg-error-50 p-4 text-center">
              <AlertCircle className="w-5 h-5 text-error-600 mx-auto mb-1" />
              <p className="font-display text-2xl font-extrabold text-error-600">{absent}</p>
              <p className="text-xs text-error-600 font-medium mt-0.5">Absent</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Total school days logged</span>
              <span className="font-bold text-ink-900">{total} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-ink-900 mb-4">Last 45 Days</h4>
        <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-15" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
          {days.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md ${day.status ? cellColor[day.status] : 'bg-ink-100'}`}
              title={`${day.date.toDateString()}${day.status ? ` · ${day.status}` : ' · no record'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning-400" /> Late</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-error-400" /> Absent</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ink-100" /> No record</span>
        </div>
      </div>

      {/* Recent log */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-ink-900 mb-3">Recent Log</h4>
        <div className="space-y-1.5">
          {recentLog.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-ink-50 px-3 py-2">
              <span className={`w-2 h-2 rounded-full ${cellColor[r.status]}`} />
              <span className="text-sm text-ink-700 flex-1">
                {new Date(r.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className={`badge ${r.status === 'present' ? 'bg-brand-50 text-brand-700' : r.status === 'late' ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'} capitalize`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmissionsView({
  submissions,
  onUpdate,
}: {
  submissions: MockSubmission[];
  onUpdate: (id: string, status: SubmissionStatus) => void;
}) {
  const pending = submissions.filter((s) => s.status === 'pending');
  const submitted = submissions.filter((s) => s.status === 'submitted');
  const graded = submissions.filter((s) => s.status === 'graded');

  const typeIcon: Record<SubmissionType, React.ReactNode> = {
    notebook: <Notebook className="w-4.5 h-4.5" />,
    homework: <FileText className="w-4.5 h-4.5" />,
    project: <FolderKanban className="w-4.5 h-4.5" />,
  };

  const typeBg: Record<SubmissionType, string> = {
    notebook: 'bg-accent-50 text-accent-700',
    homework: 'bg-warning-50 text-warning-700',
    project: 'bg-brand-50 text-brand-700',
  };

  function isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  function daysUntil(dueDate: string): number {
    const diff = new Date(dueDate).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-warning-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Pending</p>
          </div>
          <p className="stat-num text-warning-600">{pending.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Submitted</p>
          </div>
          <p className="stat-num text-accent-600">{submitted.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-brand-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Graded</p>
          </div>
          <p className="stat-num text-brand-600">{graded.length}</p>
        </div>
      </div>

      {/* Pending list */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-ink-900 mb-4">Pending Submissions</h4>
        {pending.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink-700">All caught up!</p>
            <p className="text-xs text-ink-400 mt-1">No pending submissions right now.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pending.map((s) => {
              const overdue = isOverdue(s.due_date);
              const days = daysUntil(s.due_date);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5 hover:border-ink-200 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeBg[s.type]}`}>
                    {typeIcon[s.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{s.title}</p>
                    <p className="text-xs text-ink-400 capitalize">{s.type} · {s.subject}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${overdue ? 'text-error-600' : days <= 2 ? 'text-warning-600' : 'text-ink-500'}`}>
                      {overdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d left`}
                    </p>
                    <p className="text-[10px] text-ink-400">
                      {new Date(s.due_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={() => onUpdate(s.id, 'submitted')}
                    className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                  >
                    Mark Submitted
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submitted + Graded */}
      {(submitted.length > 0 || graded.length > 0) && (
        <div className="card p-5">
          <h4 className="text-sm font-bold text-ink-900 mb-3">Completed</h4>
          <div className="space-y-2">
            {[...submitted, ...graded].map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg[s.type]}`}>
                  {typeIcon[s.type]}
                </div>
                <p className="text-sm font-medium text-ink-700 flex-1">{s.title}</p>
                <span className={`badge capitalize ${s.status === 'graded' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
