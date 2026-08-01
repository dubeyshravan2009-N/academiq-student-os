import { useState } from 'react';
import { Flame, Check } from 'lucide-react';
import { Habit } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';

function isSameDay(a: string | null, b: Date) {
  if (!a) return false;
  const d = new Date(a);
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}

export function HabitChecklist({ habits, onToggle }: { habits: Habit[]; onToggle: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const today = new Date();

  async function toggle(h: Habit) {
    const alreadyDone = isSameDay(h.last_completed_date, today);
    setBusy(h.id);
    const newStreak = alreadyDone ? h.streak_count : h.streak_count + 1;
    const { error } = await supabase
      .from('habits')
      .update({ streak_count: newStreak, last_completed_date: alreadyDone ? h.last_completed_date : today.toISOString().slice(0, 10) })
      .eq('id', h.id);
    setBusy(null);
    if (!error) onToggle();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Habit Checklist</h3>
        <span className="chip"><Flame className="w-3.5 h-3.5 text-warning-500" /> Streaks</span>
      </div>
      <div className="space-y-2.5">
        {habits.length === 0 && <p className="text-sm text-ink-400 italic">No habits tracked yet.</p>}
        {habits.map((h) => {
          const doneToday = isSameDay(h.last_completed_date, today);
          return (
            <div key={h.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${doneToday ? 'border-brand-200 bg-brand-50/60' : 'border-ink-100 bg-white hover:border-ink-200'}`}>
              <button
                onClick={() => toggle(h)}
                disabled={busy === h.id}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                  doneToday ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-300 hover:bg-brand-100 hover:text-brand-600'
                }`}
                aria-label={doneToday ? 'Completed today' : 'Mark complete'}
              >
                {busy === h.id ? <Spinner /> : doneToday ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4 opacity-30" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${doneToday ? 'text-brand-800' : 'text-ink-800'}`}>{h.title}</p>
                <p className="text-xs text-ink-400">{doneToday ? 'Completed today' : 'Tap to log today'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Flame className={`w-4 h-4 ${h.streak_count > 0 ? 'text-warning-500' : 'text-ink-300'}`} />
                <span className="font-display font-bold text-ink-900">{h.streak_count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
