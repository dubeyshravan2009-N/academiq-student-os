import { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  Trash2,
  Calendar,
  TrendingUp,
  Award,
  Book,
  Pencil,
  Dumbbell,
  Brain,
  Moon,
  Droplets,
  Apple,
} from 'lucide-react';
import { MockHabit } from '@/lib/mockData';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Feedback';

interface HabitManagerProps {
  habits: MockHabit[];
  onAddHabit: (habit: Omit<MockHabit, 'id'>) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const emojiOptions = [
  { label: 'Book', icon: Book },
  { label: 'Pencil', icon: Pencil },
  { label: 'Dumbbell', icon: Dumbbell },
  { label: 'Brain', icon: Brain },
  { label: 'Moon', icon: Moon },
  { label: 'Droplets', icon: Droplets },
  { label: 'Apple', icon: Apple },
];

function getIconForEmoji(emoji: string): React.ComponentType<{ className?: string }> {
  return emojiOptions.find((e) => e.label === emoji)?.icon || Check;
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export function HabitManager({ habits, onAddHabit, onToggleHabit, onDeleteHabit }: HabitManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    emoji: 'Book',
    active_days: [1, 2, 3, 4, 5] as number[],
  });

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter((d) => d !== day)
        : [...prev.active_days, day].sort(),
    }));
  }

  function save() {
    if (!form.title.trim()) return;
    onAddHabit({
      title: form.title.trim(),
      emoji: form.emoji,
      active_days: form.active_days,
      streak_count: 0,
      best_streak: 0,
      total_checkins: 0,
      check_ins: [],
      created_at: new Date().toISOString(),
    });
    setForm({ title: '', emoji: 'Book', active_days: [1, 2, 3, 4, 5] });
    setModalOpen(false);
  }

  const totalCheckIns = habits.reduce((sum, h) => sum + h.total_checkins, 0);
  const topStreak = Math.max(0, ...habits.map((h) => h.streak_count));
  const monthlyAvg = habits.length
    ? Math.round(habits.reduce((sum, h) => {
        const last30 = h.check_ins.filter((d) => {
          const date = new Date(d);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length;
        return sum + (h.active_days.length > 0 ? (last30 / (h.active_days.length * 4)) * 100 : 0);
      }, 0) / habits.length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title">Habit Manager</h3>
          <p className="text-sm text-ink-500 mt-0.5">Build consistency with daily habit tracking</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-warning-500" />
            <p className="text-xs font-medium text-ink-500 uppercase">Top Streak</p>
          </div>
          <p className="stat-num text-ink-900">{topStreak}<span className="text-base text-ink-400 ml-1">days</span></p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-brand-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Total Check-ins</p>
          </div>
          <p className="stat-num text-ink-900">{totalCheckIns}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-accent-600" />
            <p className="text-xs font-medium text-ink-500 uppercase">Monthly Avg</p>
          </div>
          <p className="stat-num text-ink-900">{monthlyAvg}<span className="text-base text-ink-400 ml-1">%</span></p>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={<Flame className="w-6 h-6" />}
            title="No habits yet"
            hint="Create your first habit to start building streaks and tracking consistency."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onToggle={() => onToggleHabit(h.id)}
              onDelete={() => onDeleteHabit(h.id)}
            />
          ))}
        </div>
      )}

      {/* Create Habit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Habit"
        subtitle="Choose a habit and pick which days it's active."
      >
        <div className="space-y-4">
          <div>
            <label className="label">Habit Name</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Read 20 minutes daily"
            />
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setForm({ ...form, emoji: opt.label })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      form.emoji === opt.label
                        ? 'bg-brand-600 text-white ring-2 ring-brand-500/20'
                        : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Active Days</label>
            <div className="flex gap-1.5">
              {dayLabels.map((day, idx) => {
                const active = form.active_days.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                    }`}
                  >
                    {dayShort[idx]}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="btn-primary w-full" onClick={save} disabled={!form.title.trim()}>
            <Plus className="w-4 h-4" /> Create Habit
          </button>
        </div>
      </Modal>
    </div>
  );
}

function HabitCard({
  habit,
  onToggle,
  onDelete,
}: {
  habit: MockHabit;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const Icon = getIconForEmoji(habit.emoji);
  const doneToday = habit.check_ins.some(isToday);

  // Build 12-week heatmap
  const weeks: { date: Date; dateStr: string; is_active_day: boolean; is_checked: boolean }[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83); // 12 weeks

  // Align to start of week (Sunday)
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const checkInSet = new Set(habit.check_ins);

  for (let w = 0; w < 12; w++) {
    const week: { date: Date; dateStr: string; is_active_day: boolean; is_checked: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = date.toISOString().slice(0, 10);
      const isFuture = date > today;
      const is_active_day = habit.active_days.includes(date.getDay()) && !isFuture;
      week.push({
        date,
        dateStr,
        is_active_day,
        is_checked: checkInSet.has(dateStr),
      });
    }
    weeks.push(week);
  }

  // Monthly completion rate
  const last30Checked = habit.check_ins.filter((d) => {
    const date = new Date(d);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }).length;
  const possibleDays = habit.active_days.length * 4; // approx 4 weeks
  const monthlyRate = possibleDays > 0 ? Math.round((last30Checked / possibleDays) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${doneToday ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink-900">{habit.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-ink-500">
                <Flame className={`w-3.5 h-3.5 ${habit.streak_count > 0 ? 'text-warning-500' : 'text-ink-300'}`} />
                {habit.streak_count} day streak
              </span>
              <span className="text-ink-300">·</span>
              <span className="flex items-center gap-1 text-xs text-ink-500">
                <Award className="w-3.5 h-3.5 text-accent-500" />
                Best: {habit.best_streak}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onDelete} className="btn-ghost p-1.5 text-error-600" aria-label="Delete habit">
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            disabled={doneToday}
            className={`btn ${doneToday ? 'bg-brand-100 text-brand-700' : 'bg-brand-600 text-white hover:bg-brand-700'} px-4`}
          >
            {doneToday ? (
              <><Check className="w-4 h-4" /> Done Today</>
            ) : (
              <><Plus className="w-4 h-4" /> Check In</>
            )}
          </button>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1 pt-4">
            {dayShort.map((d, i) => (
              <div key={i} className="w-3 h-3 text-[9px] text-ink-400 flex items-center justify-center">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                {week.map((day, di) => {
                  let bgClass = 'bg-ink-100';
                  if (day.is_checked) {
                    bgClass = 'bg-brand-500';
                  } else if (day.is_active_day) {
                    bgClass = 'bg-ink-100 hover:bg-brand-100';
                  } else if (!day.is_active_day && day.date <= today) {
                    bgClass = 'bg-ink-50';
                  }
                  return (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-sm transition-colors ${bgClass}`}
                      title={`${day.date.toDateString()}${day.is_checked ? ' ✓' : day.is_active_day ? '' : ' (inactive)'}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink-100">
        <div className="text-center">
          <p className="font-display text-xl font-extrabold text-ink-900">{habit.streak_count}</p>
          <p className="text-[10px] font-medium text-ink-400 uppercase mt-0.5">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-extrabold text-ink-900">{habit.total_checkins}</p>
          <p className="text-[10px] font-medium text-ink-400 uppercase mt-0.5">Total Check-ins</p>
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-extrabold text-brand-600">{monthlyRate}%</p>
          <p className="text-[10px] font-medium text-ink-400 uppercase mt-0.5">Monthly Rate</p>
        </div>
      </div>

      {/* Active days indicator */}
      <div className="flex items-center gap-1.5 mt-3">
        <Calendar className="w-3.5 h-3.5 text-ink-400" />
        <span className="text-xs text-ink-500">Active:</span>
        {dayShort.map((d, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
              habit.active_days.includes(i) ? 'bg-brand-100 text-brand-700' : 'bg-ink-50 text-ink-300'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
