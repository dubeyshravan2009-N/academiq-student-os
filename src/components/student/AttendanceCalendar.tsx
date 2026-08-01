import { Attendance } from '@/lib/types';

export function AttendanceCalendar({ records }: { records: Attendance[] }) {
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const pct = total ? Math.round(((present + late) / total) * 100) : 0;

  // Build a 7x5 grid of last 35 days
  const days: { date: Date; status: string | null }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 34);
  const map = new Map<string, string>();
  records.forEach((r) => map.set(r.date, r.status));
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: d, status: map.get(key) ?? null });
  }

  const cellColor: Record<string, string> = {
    present: 'bg-brand-500',
    late: 'bg-warning-400',
    absent: 'bg-error-400',
    '': 'bg-ink-100',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Attendance Record</h3>
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eceef2" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1fb080" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xs font-extrabold text-ink-900">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-ink-400 uppercase">{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className="aspect-square rounded-md flex items-center justify-center" title={`${day.date.toDateString()} · ${day.status || 'no record'}`}>
            <span className={`w-full h-full rounded-md ${cellColor[day.status ?? '']}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-brand-50 p-2.5">
          <p className="stat-num text-brand-700 text-xl">{present}</p>
          <p className="text-[11px] font-medium text-brand-600 mt-0.5">Present</p>
        </div>
        <div className="rounded-xl bg-warning-50 p-2.5">
          <p className="stat-num text-warning-600 text-xl">{late}</p>
          <p className="text-[11px] font-medium text-warning-600 mt-0.5">Late</p>
        </div>
        <div className="rounded-xl bg-error-50 p-2.5">
          <p className="stat-num text-error-600 text-xl">{absent}</p>
          <p className="text-[11px] font-medium text-error-600 mt-0.5">Absent</p>
        </div>
      </div>
    </div>
  );
}
