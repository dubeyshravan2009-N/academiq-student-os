import { useState } from 'react';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronRight,
  Flag,
  Calendar,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { MockGoal, MockTask } from '@/lib/mockData';
import { GoalLevel, GoalStatus, TaskPriority } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Spinner, EmptyState } from '@/components/ui/Feedback';

interface GoalManagerProps {
  goals: MockGoal[];
  tasks: MockTask[];
  onAddGoal: (goal: Omit<MockGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<MockGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<MockTask, 'id'>) => void;
}

const levelMeta: Record<GoalLevel, { label: string; color: string; dot: string; ring: string; bg: string }> = {
  long_term: { label: 'Long-Term', color: 'text-accent-700', dot: 'bg-accent-500', ring: 'border-accent-200', bg: 'bg-accent-50' },
  mid_term: { label: 'Mid-Term', color: 'text-brand-700', dot: 'bg-brand-500', ring: 'border-brand-200', bg: 'bg-brand-50' },
  short_term: { label: 'Short-Term', color: 'text-warning-700', dot: 'bg-warning-500', ring: 'border-warning-200', bg: 'bg-warning-50' },
};

const statusStyles: Record<GoalStatus, string> = {
  active: 'bg-brand-50 text-brand-700',
  completed: 'bg-success-100 text-success-700',
  paused: 'bg-ink-100 text-ink-600',
};

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-error-50 text-error-700',
  medium: 'bg-warning-50 text-warning-700',
  low: 'bg-ink-100 text-ink-600',
};

export function GoalManager({
  goals,
  tasks,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onToggleTask,
  onAddTask,
}: GoalManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MockGoal | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    level: 'short_term' as GoalLevel,
    target_date: '',
    priority: 'medium' as TaskPriority,
    parent_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [taskModalGoalId, setTaskModalGoalId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  function openNew() {
    setEditingGoal(null);
    setForm({ title: '', description: '', level: 'short_term', target_date: '', priority: 'medium', parent_id: '' });
    setModalOpen(true);
  }

  function openEdit(g: MockGoal) {
    setEditingGoal(g);
    setForm({
      title: g.title,
      description: g.description,
      level: g.level,
      target_date: g.target_date,
      priority: g.priority,
      parent_id: g.parent_id || '',
    });
    setModalOpen(true);
  }

  function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      level: form.level,
      status: 'active' as GoalStatus,
      target_date: form.target_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      priority: form.priority,
      parent_id: form.parent_id || null,
    };
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, payload);
    } else {
      onAddGoal(payload);
    }
    setSaving(false);
    setModalOpen(false);
  }

  function handleDelete(g: MockGoal) {
    if (!confirm(`Delete "${g.title}" and its tasks?`)) return;
    onDeleteGoal(g.id);
  }

  function addTaskToGoal(goalId: string) {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      goal_id: goalId,
      title: newTaskTitle.trim(),
      is_completed: false,
      priority: 'medium',
      deadline: null,
      is_daily: false,
    });
    setNewTaskTitle('');
    setTaskModalGoalId(null);
  }

  const longGoals = goals.filter((g) => g.level === 'long_term');
  const midGoals = goals.filter((g) => g.level === 'mid_term');
  const shortGoals = goals.filter((g) => g.level === 'short_term');

  const goalsByParent = (parentId: string) => goals.filter((g) => g.parent_id === parentId);
  const tasksByGoal = (goalId: string) => tasks.filter((t) => t.goal_id === goalId);

  function renderGoalCard(g: MockGoal, depth: number = 0) {
    const meta = levelMeta[g.level];
    const children = goalsByParent(g.id);
    const goalTasks = tasksByGoal(g.id);
    const isExpanded = expandedGoal === g.id;
    const completedTasks = goalTasks.filter((t) => t.is_completed).length;

    return (
      <div key={g.id} className={`rounded-xl border ${meta.ring} ${meta.bg} p-3.5 transition-all`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{meta.label}</span>
              <span className={`badge ${statusStyles[g.status]} text-[10px]`}>{g.status}</span>
            </div>
            <p className="text-sm font-bold text-ink-900">{g.title}</p>
            {g.description && <p className="text-xs text-ink-500 mt-1 leading-relaxed">{g.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-400">
              {g.target_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(g.target_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {g.priority}
              </span>
              {goalTasks.length > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedTasks}/{goalTasks.length} tasks
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => openEdit(g)} className="btn-ghost p-1.5" aria-label="Edit goal">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(g)} className="btn-ghost p-1.5 text-error-600" aria-label="Delete goal">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tasks under this goal */}
        {goalTasks.length > 0 && (
          <div className="mt-3 space-y-1.5 pl-2">
            {goalTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => onToggleTask(t.id)}
                className="w-full flex items-center gap-2 rounded-lg bg-white/70 border border-ink-100 px-2.5 py-1.5 text-left hover:bg-white transition-colors"
              >
                {t.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-ink-300 shrink-0" />
                )}
                <span className={`text-xs flex-1 ${t.is_completed ? 'text-ink-400 line-through' : 'text-ink-700'}`}>
                  {t.title}
                </span>
                <span className={`badge ${priorityStyles[t.priority]} text-[9px] px-1.5 py-0.5`}>{t.priority}</span>
              </button>
            ))}
          </div>
        )}

        {/* Add task / toggle children */}
        <div className="mt-2.5 flex items-center gap-2 pl-2">
          <button
            onClick={() => setTaskModalGoalId(g.id)}
            className="text-[11px] font-semibold text-ink-500 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Task
          </button>
          {children.length > 0 && (
            <button
              onClick={() => setExpandedGoal(isExpanded ? null : g.id)}
              className="text-[11px] font-semibold text-ink-500 hover:text-brand-700 flex items-center gap-1 transition-colors ml-auto"
            >
              {children.length} sub-goal{children.length !== 1 ? 's' : ''}
              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {/* Children */}
        {isExpanded && children.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-ink-200 space-y-2.5 animate-slide-up">
            {children.map((child) => renderGoalCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title">Goal Cascade</h3>
          <p className="text-sm text-ink-500 mt-0.5">Long-Term → Mid-Term → Short-Term → Daily Tasks</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Cascade Columns */}
      <div className="grid lg:grid-cols-3 gap-4">
        <CascadeColumn title="Long-Term Goals" subtitle="Your big vision" goals={longGoals} dot="bg-accent-500" ring="border-accent-200" bg="bg-accent-50/50">
          {longGoals.map((g) => renderGoalCard(g))}
        </CascadeColumn>
        <CascadeColumn title="Mid-Term Goals" subtitle="6-12 months" goals={midGoals} dot="bg-brand-500" ring="border-brand-200" bg="bg-brand-50/50">
          {midGoals.map((g) => renderGoalCard(g))}
        </CascadeColumn>
        <CascadeColumn title="Short-Term Goals" subtitle="Next few weeks" goals={shortGoals} dot="bg-warning-500" ring="border-warning-200" bg="bg-warning-50/50">
          {shortGoals.map((g) => renderGoalCard(g))}
        </CascadeColumn>
      </div>

      {/* Auto-generated daily tasks note */}
      <div className="card p-4 bg-gradient-to-r from-brand-50 to-accent-50 border-brand-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">Auto-Generated Daily Tasks</p>
            <p className="text-xs text-ink-600 mt-0.5">
              Short-term goals automatically generate daily actionable tasks. Complete them from the Overview tab's "Today's Tasks" list.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        subtitle="Add a goal at any tier in your cascade."
      >
        <div className="space-y-4">
          <div>
            <label className="label">Goal Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Score 90+ in Board Exams"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[70px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does success look like?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Goal Level</label>
              <select
                className="input"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as GoalLevel })}
              >
                <option value="long_term">Long-Term</option>
                <option value="mid_term">Mid-Term</option>
                <option value="short_term">Short-Term</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Date</label>
              <input
                type="date"
                className="input"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Parent Goal (optional)</label>
              <select
                className="input"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <option value="">No parent</option>
                {goals
                  .filter((g) => g.level === 'long_term' && g.id !== editingGoal?.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                {goals
                  .filter((g) => g.level === 'mid_term' && g.id !== editingGoal?.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
              </select>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={save} disabled={saving || !form.title.trim()}>
            {saving ? <Spinner /> : <Plus className="w-4 h-4" />}
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        open={taskModalGoalId !== null}
        onClose={() => { setTaskModalGoalId(null); setNewTaskTitle(''); }}
        title="Add Task to Goal"
        subtitle="Tasks help you break goals into actionable steps."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Task Title</label>
            <input
              className="input"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTaskToGoal(taskModalGoalId!)}
              placeholder="e.g. Complete Chapter 5 exercises"
              autoFocus
            />
          </div>
          <button className="btn-primary w-full" onClick={() => addTaskToGoal(taskModalGoalId!)} disabled={!newTaskTitle.trim()}>
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </Modal>
    </div>
  );
}

function CascadeColumn({
  title,
  subtitle,
  goals,
  dot,
  ring,
  bg,
  children,
}: {
  title: string;
  subtitle: string;
  goals: MockGoal[];
  dot: string;
  ring: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${ring} ${bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-ink-600">{title}</h4>
          <p className="text-[10px] text-ink-400">{subtitle}</p>
        </div>
        <span className="ml-auto chip bg-white/60 text-ink-600">{goals.length}</span>
      </div>
      <div className="space-y-2.5">
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-ink-400 italic">No goals yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
