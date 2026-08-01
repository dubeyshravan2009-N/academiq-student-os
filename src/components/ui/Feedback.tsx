import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />;
}

export function FullSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-400 gap-3">
      <Spinner className="w-6 h-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400 mb-3">{icon}</div>}
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {hint && <p className="text-xs text-ink-400 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">
      {message}
    </div>
  );
}
