import { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  BookOpen,
  Flame,
  Sun,
  Moon,
  Coffee,
  RefreshCw,
} from 'lucide-react';
import { MockTask, MockHabit } from '@/data/mockData';

interface StudyPlannerProps {
  tasks: MockTask[];
  habits: MockHabit[];
  onToggleBlock: (id: string) => void;
}

interface TimeBlock {
  id: string;
  start: string;
  end: string;
  label: string;
  type: 'school' | 'task' | 'habit' | 'break' | 'meal' | 'study';
  source_id?: string;
  completed: boolean;
}

const typeStyles: Record<string, { bg: string; border: string; text: string; dot: string; icon: React.ReactNode }> = {
  school: { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-700', dot: 'bg-accent-500', icon: <BookOpen className="w-4 h-4" /> },
  task: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', dot: 'bg-brand-500', icon: <CheckCircle2 className="w-4 h-4" /> },
  habit: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', dot: 'bg-warning-500', icon: <Flame className="w-4 h-4" /> },
  break: { bg: 'bg-ink-50', border: 'border-ink-200', text: 'text-ink-600', dot: 'bg-ink-400', icon: <Coffee className="w-4 h-4" /> },
  meal: { bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700', dot: 'bg-success-500', icon: <Coffee className="w-4 h-4" /> },
  study: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', dot: 'bg-brand-500', icon: <BookOpen className="w-4 h-4" /> },
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function StudyPlanner({ tasks, habits, onToggleBlock }: StudyPlannerProps) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);

  const generated = useMemo(() => {
    const today = new Date().getDay();
    const activeHabits = habits.filter((h) => h.active_days.includes(today));
    const pendingTasks = tasks.filter((t) => !t.is_completed);
    const taskItems = pendingTasks.slice(0, 5);

    const schedule: TimeBlock[] = [
      { id: 'sb_school', start: '08:00', end: '15:00', label: 'School Hours', type: 'school', completed: false },
      { id: 'sb_meal1', start: '15:00', end: '15:30', label: 'Snack & Rest', type: 'meal', completed: false },
    ];

    let cursor = timeToMinutes('15:30');
    const slotMinutes = 45;

    taskItems.forEach((task, i) => {
      const start = minutesToTime(cursor);
      cursor += slotMinutes;
      const end = minutesToTime(cursor);
      schedule.push({
        id: `sb_task_${task.id}`,
        start,
        end,
        label: task.title,
        type: 'task',
        source_id: task.id,
        completed: false,
      });
      if (i < taskItems.length - 1) {
        schedule.push({
          id: `sb_break_${i}`,
          start: end,
          end: minutesToTime(cursor + 10),
          label: 'Short Break',
          type: 'break',
          completed: false,
        });
        cursor += 10;
      }
    });

    activeHabits.forEach((habit) => {
      const start = minutesToTime(cursor + 5);
      cursor += 5 + 20;
      const end = minutesToTime(cursor);
      schedule.push({
        id: `sb_habit_${habit.id}`,
        start,
        end,
        label: `${habit.title} (Habit)`,
        type: 'habit',
        source_id: habit.id,
        completed: false,
      });
    });

    schedule.push({
      id: 'sb_dinner',
      start: minutesToTime(cursor + 5),
      end: minutesToTime(cursor + 35),
      label: 'Dinner',
      type: 'meal',
      completed: false,
    });
    cursor += 35;

    schedule.push({
      id: 'sb_revision',
      start: minutesToTime(cursor + 5),
      end: minutesToTime(cursor + 35),
      label: 'Daily Revision (Review notes)',
      type: 'study',
      completed: false,
    });

    return schedule;
  }, [tasks, habits]);

  // Use generated schedule on first render
  useMemo(() => {
    if (blocks.length === 0) {
      setBlocks(generated);
    }
  }, [generated]);

  function regenerate() {
    setBlocks(generated);
  }

  function toggleBlock(id: string) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b)));
    const block = blocks.find((b) => b.id === id);
    if (block?.source_id && (block.type === 'task' || block.type === 'habit')) {
      onToggleBlock(block.source_id);
    }
  }

  const completedCount = blocks.filter((b) => b.completed).length;
  const progressPct = blocks.length ? Math.round((completedCount / blocks.length) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="section-title">Daily Schedule & AI Time-Blocker</h3>
          <p className="text-sm text-ink-500 mt-0.5">
            Auto-generated from your tasks, habits, and school timetable
          </p>
        </div>
        <button className="btn-secondary" onClick={regenerate}>
          <RefreshCw className="w-4 h-4" /> Regenerate
        </button>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-bold text-ink-900">Today's Progress</span>
          </div>
          <span className="text-sm font-bold text-brand-700">
            {completedCount}/{blocks.length} blocks done
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-ink-500" />
          <h4 className="text-sm font-bold text-ink-900">
            {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
        </div>

        <div className="space-y-2">
          {blocks.map((block) => {
            const style = typeStyles[block.type];
            return (
              <button
                key={block.id}
                onClick={() => toggleBlock(block.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  block.completed
                    ? 'opacity-50 border-ink-100 bg-ink-50'
                    : `${style.border} ${style.bg} hover:shadow-soft`
                }`}
              >
                {/* Time */}
                <div className="flex flex-col items-center shrink-0 w-16">
                  <span className="text-xs font-bold text-ink-700">{block.start}</span>
                  <span className="text-[10px] text-ink-400">{block.end}</span>
                </div>

                {/* Vertical bar */}
                <div className={`w-1 h-10 rounded-full ${style.dot} shrink-0`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={style.text}>{style.icon}</span>
                    <p className={`text-sm font-semibold ${block.completed ? 'text-ink-500 line-through' : 'text-ink-900'}`}>
                      {block.label}
                    </p>
                  </div>
                  <p className={`text-xs mt-0.5 ${style.text} capitalize`}>{block.type.replace('_', ' ')}</p>
                </div>

                {/* Checkbox */}
                <div className="shrink-0">
                  {block.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-ink-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Block Types</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${style.dot}`} />
              <span className="text-xs font-medium text-ink-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
