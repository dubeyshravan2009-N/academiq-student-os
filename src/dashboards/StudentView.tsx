import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { CURRENT_ACADEMIC_YEAR, TaskPriority, SubmissionStatus } from '@/lib/types';
import {
  MockGoal,
  MockTask,
  MockHabit,
  MockMark,
  MockAttendance,
  MockSubmission,
  createMockGoals,
  createMockTasks,
  createMockHabits,
  createMockMarks,
  createMockAttendance,
  createMockSubmissions,
} from '@/data/mockData';
import { CareerEngine } from '@/modules/CareerEngine';
import { GoalManager } from '@/modules/GoalTracker';
import { HabitManager } from '@/modules/HabitManager';
import { AcademicEngine } from '@/components/student/AcademicEngine';
import { AIMentorDrawer } from '@/components/student/AIMentorDrawer';
import { StudyPlanner } from '@/components/student/StudyPlanner';
import { StatCard } from '@/components/ui/StatCard';
import { Sidebar } from '@/components/Sidebar';
import { Target, CheckCircle2, Flame, TrendingUp, Briefcase, BookOpen, Calendar, Clock } from 'lucide-react';

type Tab = 'overview' | 'goals' | 'career' | 'habits' | 'academic' | 'planner';

let idSeq = 100;
function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}_${idSeq}`;
}

export function StudentDashboard() {
  const { profile } = useApp();
  const [tab, setTab] = useState<Tab>('overview');

  const [goals, setGoals] = useState<MockGoal[]>(() => createMockGoals());
  const [tasks, setTasks] = useState<MockTask[]>(() => createMockTasks());
  const [habits, setHabits] = useState<MockHabit[]>(() => createMockHabits());
  const [marks] = useState<MockMark[]>(() => createMockMarks());
  const [attendance] = useState<MockAttendance[]>(() => createMockAttendance());
  const [submissions, setSubmissions] = useState<MockSubmission[]>(() => createMockSubmissions());

  const [adoptedCareerGoals, setAdoptedCareerGoals] = useState<string[]>([]);

  // Goal handlers
  const addGoal = useCallback((goal: Omit<MockGoal, 'id'>) => {
    const newGoal: MockGoal = { ...goal, id: nextId('g') };
    setGoals((prev) => [...prev, newGoal]);

    // Auto-generate daily tasks for short-term goals
    if (goal.level === 'short_term') {
      const autoTasks: MockTask[] = [
        {
          id: nextId('t'),
          goal_id: newGoal.id,
          title: `Daily progress: ${goal.title}`,
          is_completed: false,
          priority: goal.priority,
          deadline: goal.target_date,
          is_daily: true,
        },
      ];
      setTasks((prev) => [...prev, ...autoTasks]);
    }
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<MockGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setTasks((prev) => prev.filter((t) => t.goal_id !== id));
  }, []);

  // Task handlers
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t)));
  }, []);

  const addTask = useCallback((task: Omit<MockTask, 'id'>) => {
    setTasks((prev) => [...prev, { ...task, id: nextId('t') }]);
  }, []);

  // Habit handlers
  const addHabit = useCallback((habit: Omit<MockHabit, 'id'>) => {
    setHabits((prev) => [...prev, { ...habit, id: nextId('h') }]);
  }, []);

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const today = new Date().toISOString().slice(0, 10);
        const alreadyDone = h.check_ins.includes(today);
        if (alreadyDone) return h;

        const newCheckIns = [...h.check_ins, today];
        const newStreak = h.streak_count + 1;
        return {
          ...h,
          check_ins: newCheckIns,
          streak_count: newStreak,
          best_streak: Math.max(h.best_streak, newStreak),
          total_checkins: h.total_checkins + 1,
        };
      })
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Submission handlers
  const updateSubmission = useCallback((id: string, status: SubmissionStatus) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  // Career adopt handler
  const adoptCareerGoal = useCallback((title: string, description: string) => {
    const newGoal: MockGoal = {
      id: nextId('g'),
      title,
      description,
      level: 'long_term',
      status: 'active',
      target_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      priority: 'high' as TaskPriority,
      parent_id: null,
    };
    setGoals((prev) => [...prev, newGoal]);
    const careerTitle = title.replace('Pursue a career as a ', '');
    setAdoptedCareerGoals((prev) => [...prev, careerTitle]);
  }, []);

  // Derived stats
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const pendingTasks = tasks.filter((t) => !t.is_completed).length;
  const topStreak = Math.max(0, ...habits.map((h) => h.streak_count));
  const avgScore = marks.length
    ? Math.round((marks.reduce((s, m) => s + (m.score_obtained / m.max_score) * 100, 0) / marks.length))
    : 0;
  const pendingSubs = submissions.filter((s) => s.status === 'pending').length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals & Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'career', label: 'Career Explorer', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'habits', label: 'Habits', icon: <Flame className="w-4 h-4" /> },
    { id: 'academic', label: 'Academics', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'planner', label: 'AI Planner', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">
            Hey, {profile?.full_name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-sm text-ink-500">Academic Year: {CURRENT_ACADEMIC_YEAR}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <Sidebar tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)} />

      {tab === 'overview' && (
        <OverviewTab
          goals={goals}
          tasks={tasks}
          habits={habits}
          marks={marks}
          submissions={submissions}
          activeGoals={activeGoals}
          pendingTasks={pendingTasks}
          topStreak={topStreak}
          avgScore={avgScore}
          pendingSubs={pendingSubs}
          onToggleTask={toggleTask}
          onToggleHabit={toggleHabit}
          onGoToTab={setTab}
        />
      )}

      {tab === 'goals' && (
        <GoalManager
          goals={goals}
          tasks={tasks}
          onAddGoal={addGoal}
          onUpdateGoal={updateGoal}
          onDeleteGoal={deleteGoal}
          onToggleTask={toggleTask}
          onAddTask={addTask}
        />
      )}

      {tab === 'career' && (
        <CareerEngine onAdoptGoal={adoptCareerGoal} adoptedGoals={adoptedCareerGoals} />
      )}

      {tab === 'habits' && (
        <HabitManager
          habits={habits}
          onAddHabit={addHabit}
          onToggleHabit={toggleHabit}
          onDeleteHabit={deleteHabit}
        />
      )}

      {tab === 'academic' && (
        <AcademicEngine
          marks={marks}
          attendance={attendance}
          submissions={submissions}
          onUpdateSubmission={updateSubmission}
        />
      )}

      {tab === 'planner' && (
        <StudyPlanner tasks={tasks} habits={habits} onToggleBlock={toggleTask} />
      )}

      <AIMentorDrawer tasks={tasks} habits={habits} />
    </div>
  );
}

function OverviewTab({
  goals,
  tasks,
  habits,
  marks,
  submissions,
  activeGoals,
  pendingTasks,
  topStreak,
  avgScore,
  pendingSubs,
  onToggleTask,
  onToggleHabit,
  onGoToTab,
}: {
  goals: MockGoal[];
  tasks: MockTask[];
  habits: MockHabit[];
  marks: MockMark[];
  submissions: MockSubmission[];
  activeGoals: number;
  pendingTasks: number;
  topStreak: number;
  avgScore: number;
  pendingSubs: number;
  onToggleTask: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onGoToTab: (tab: Tab) => void;
}) {
  const todayTasks = tasks.filter((t) => t.is_daily || (t.goal_id && !t.is_completed));
  const longGoals = goals.filter((g) => g.level === 'long_term');
  const midGoals = goals.filter((g) => g.level === 'mid_term');
  const shortGoals = goals.filter((g) => g.level === 'short_term');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Active Goals" value={activeGoals} icon={<Target className="w-5 h-5" />} tone="accent" />
        <StatCard label="Pending Tasks" value={pendingTasks} icon={<CheckCircle2 className="w-5 h-5" />} tone="warning" />
        <StatCard label="Top Streak" value={`${topStreak}d`} icon={<Flame className="w-5 h-5" />} tone="brand" />
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={<TrendingUp className="w-5 h-5" />} tone="neutral" />
        <StatCard label="Pending Subs" value={pendingSubs} icon={<BookOpen className="w-5 h-5" />} tone="error" />
      </div>

      {/* Goal cascade snapshot */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Goal Cascade</h3>
          <button onClick={() => onGoToTab('goals')} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            Manage Goals →
          </button>
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          <CascadeSnapshot title="Long-Term" goals={longGoals} dot="bg-accent-500" />
          <CascadeSnapshot title="Mid-Term" goals={midGoals} dot="bg-brand-500" />
          <CascadeSnapshot title="Short-Term" goals={shortGoals} dot="bg-warning-500" />
        </div>
      </div>

      {/* Today's Tasks + Habits */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-lg">Today's Tasks</h3>
            <span className="chip">
              {tasks.filter((t) => t.is_completed).length}/{tasks.length} done
            </span>
          </div>
          <div className="space-y-2">
            {todayTasks.length === 0 && <p className="text-sm text-ink-400 italic">No tasks for today.</p>}
            {todayTasks.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => onToggleTask(t.id)}
                className="w-full flex items-center gap-3 rounded-xl border border-ink-100 p-3 text-left hover:border-ink-200 transition-colors"
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${t.is_completed ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-300'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className={`text-sm font-medium flex-1 ${t.is_completed ? 'text-ink-400 line-through' : 'text-ink-800'}`}>
                  {t.title}
                </span>
                {t.is_daily && <span className="badge bg-accent-50 text-accent-700 text-[10px]">Daily</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-lg">Habits Today</h3>
            <button onClick={() => onGoToTab('habits')} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Manage →
            </button>
          </div>
          <div className="space-y-2.5">
            {habits.length === 0 && <p className="text-sm text-ink-400 italic">No habits tracked yet.</p>}
            {habits.map((h) => {
              const doneToday = h.check_ins.includes(new Date().toISOString().slice(0, 10));
              return (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${doneToday ? 'border-brand-200 bg-brand-50/60' : 'border-ink-100'}`}
                >
                  <button
                    onClick={() => onToggleHabit(h.id)}
                    disabled={doneToday}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${doneToday ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-300 hover:bg-brand-100 hover:text-brand-600'}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${doneToday ? 'text-brand-800' : 'text-ink-800'}`}>{h.title}</p>
                    <p className="text-xs text-ink-400">{doneToday ? 'Done today' : 'Tap to check in'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Flame className={`w-4 h-4 ${h.streak_count > 0 ? 'text-warning-500' : 'text-ink-300'}`} />
                    <span className="font-display font-bold text-ink-900 text-sm">{h.streak_count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Marks snapshot */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-lg">Current Year Marks</h3>
          <button onClick={() => onGoToTab('academic')} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            View All →
          </button>
        </div>
        <div className="space-y-2.5">
          {marks.slice(0, 5).map((m) => {
            const pct = Math.round((m.score_obtained / m.max_score) * 100);
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink-800 w-28 truncate">{m.subject}</span>
                <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? 'bg-brand-500' : pct >= 60 ? 'bg-warning-400' : 'bg-error-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-ink-900 w-14 text-right">
                  {m.score_obtained}/{m.max_score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CascadeSnapshot({ title, goals, dot }: { title: string; goals: MockGoal[]; dot: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500">{title}</h4>
        <span className="ml-auto text-xs text-ink-400">{goals.length}</span>
      </div>
      <div className="space-y-1.5">
        {goals.length === 0 && <p className="text-xs text-ink-400 italic px-1 py-2">No goals yet</p>}
        {goals.slice(0, 3).map((g) => (
          <div key={g.id} className="rounded-lg bg-white border border-ink-100 px-2.5 py-2">
            <p className="text-xs font-semibold text-ink-800 truncate">{g.title}</p>
          </div>
        ))}
        {goals.length > 3 && <p className="text-[10px] text-ink-400 px-1">+{goals.length - 3} more</p>}
      </div>
    </div>
  );
}
