import { Goal } from '@/lib/types';

const levelStyles: Record<string, { dot: string; label: string; ring: string }> = {
  long_term: { dot: 'bg-accent-500', label: 'Long-Term', ring: 'border-accent-200' },
  mid_term: { dot: 'bg-brand-500', label: 'Mid-Term', ring: 'border-brand-200' },
  short_term: { dot: 'bg-warning-500', label: 'Short-Term', ring: 'border-warning-200' },
};

const statusStyles: Record<string, string> = {
  active: 'bg-brand-50 text-brand-700',
  completed: 'bg-success-100 text-success-700',
  paused: 'bg-ink-100 text-ink-600',
};

export function GoalCascade({ goals }: { goals: Goal[] }) {
  const long = goals.filter((g) => g.level === 'long_term');
  const mid = goals.filter((g) => g.level === 'mid_term');
  const short = goals.filter((g) => g.level === 'short_term');

  const Column = ({ title, items, tone }: { title: string; items: Goal[]; tone: string }) => (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${tone}`} />
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500">{title}</h4>
        <span className="ml-auto text-xs text-ink-400">{items.length}</span>
      </div>
      <div className="space-y-2.5">
        {items.length === 0 && <p className="text-xs text-ink-400 italic px-3 py-4">No goals yet</p>}
        {items.map((g) => {
          const s = levelStyles[g.level];
          return (
            <div key={g.id} className={`rounded-xl border ${s.ring} bg-white p-3.5 shadow-soft transition-all hover:shadow-card`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900 leading-snug">{g.title}</p>
                <span className={`badge ${statusStyles[g.status] || statusStyles.active} shrink-0`}>{g.status}</span>
              </div>
              {g.description && <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">{g.description}</p>}
              <div className="flex items-center gap-2 mt-2.5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-[11px] font-medium text-ink-500">{s.label}</span>
                {g.target_date && (
                  <span className="ml-auto text-[11px] text-ink-400">
                    {new Date(g.target_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Goal Cascade</h3>
        <span className="chip">Long → Mid → Short → Daily</span>
      </div>
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-3">
        <Column title="Long-Term" items={long} tone="bg-accent-500" />
        <div className="hidden lg:flex items-center"><span className="text-ink-300">→</span></div>
        <Column title="Mid-Term" items={mid} tone="bg-brand-500" />
        <div className="hidden lg:flex items-center"><span className="text-ink-300">→</span></div>
        <Column title="Short-Term" items={short} tone="bg-warning-500" />
      </div>
    </div>
  );
}
