import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: 'brand' | 'accent' | 'warning' | 'error' | 'neutral';
  hint?: string;
}

const tones: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  neutral: 'bg-ink-100 text-ink-700',
};

export function StatCard({ label, value, icon, tone = 'neutral', hint }: StatCardProps) {
  return (
    <div className="card-hover p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</p>
        <p className="stat-num text-ink-900 mt-1">{value}</p>
        {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        {icon}
      </div>
    </div>
  );
}
