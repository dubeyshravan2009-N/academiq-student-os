// =============================================================================
// MOCK DATA — Edit this file to change demo student marks, habits, goals, etc.
// Each create* function returns a fresh copy so components can mutate state freely.
// To update default values (marks, habit defaults, teacher info), just edit the
// objects returned by these functions — no other code changes needed.
// =============================================================================

import {
  GoalLevel,
  GoalStatus,
  TaskPriority,
  AttendanceStatus,
  SubmissionType,
  SubmissionStatus,
} from '@/lib/types';

export interface MockGoal {
  id: string;
  title: string;
  description: string;
  level: GoalLevel;
  status: GoalStatus;
  target_date: string;
  priority: TaskPriority;
  parent_id: string | null;
}

export interface MockTask {
  id: string;
  goal_id: string | null;
  title: string;
  is_completed: boolean;
  priority: TaskPriority;
  deadline: string | null;
  is_daily: boolean;
}

export interface MockHabit {
  id: string;
  title: string;
  emoji: string;
  active_days: number[];
  streak_count: number;
  best_streak: number;
  total_checkins: number;
  check_ins: string[];
  created_at: string;
}

export interface MockMark {
  id: string;
  subject: string;
  exam_name: string;
  exam_type: 'unit_test' | 'mid_term' | 'final';
  score_obtained: number;
  max_score: number;
  date: string;
}

export interface MockAttendance {
  id: string;
  date: string;
  status: AttendanceStatus;
}

export interface MockSubmission {
  id: string;
  type: SubmissionType;
  title: string;
  subject: string;
  status: SubmissionStatus;
  due_date: string;
}

// Generates a unique ID with a descriptive prefix (e.g. "t_1", "g_2")
let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

// Returns a date string N days from today (negative = past)
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Returns a date string N days ago
function daysAgo(n: number): string {
  return daysFromNow(-n);
}

// Returns the initial set of 3-tier goals (long-term → mid-term → short-term)
export function createMockGoals(): MockGoal[] {
  return [
    {
      id: 'g_long_1',
      title: 'Become a Software Engineer',
      description: 'Master full-stack development and crack a top tech internship by graduation.',
      level: 'long_term',
      status: 'active',
      target_date: daysFromNow(365),
      priority: 'high',
      parent_id: null,
    },
    {
      id: 'g_long_2',
      title: 'Score 90+ in Class X Board Exams',
      description: 'Consistent study plan targeting 90%+ across all subjects.',
      level: 'long_term',
      status: 'active',
      target_date: daysFromNow(180),
      priority: 'high',
      parent_id: null,
    },
    {
      id: 'g_mid_1',
      title: 'Complete Python Mastery Course',
      description: 'Finish the online Python course with all projects submitted.',
      level: 'mid_term',
      status: 'active',
      target_date: daysFromNow(45),
      priority: 'high',
      parent_id: 'g_long_1',
    },
    {
      id: 'g_mid_2',
      title: 'Improve Math Score to 85+',
      description: 'Daily practice + weekly mock tests to boost math average.',
      level: 'mid_term',
      status: 'active',
      target_date: daysFromNow(60),
      priority: 'medium',
      parent_id: 'g_long_2',
    },
    {
      id: 'g_short_1',
      title: 'Finish Python OOP Module',
      description: 'Complete the OOP chapter and submit the mini-project.',
      level: 'short_term',
      status: 'active',
      target_date: daysFromNow(7),
      priority: 'high',
      parent_id: 'g_mid_1',
    },
    {
      id: 'g_short_2',
      title: 'Solve 50 Math Practice Problems',
      description: 'Cover algebra and geometry problem sets.',
      level: 'short_term',
      status: 'active',
      target_date: daysFromNow(10),
      priority: 'medium',
      parent_id: 'g_mid_2',
    },
  ];
}

// Returns tasks linked to short-term goals, plus standalone daily tasks
export function createMockTasks(): MockTask[] {
  return [
    { id: uid('t'), goal_id: 'g_short_1', title: 'Watch OOP inheritance video lecture', is_completed: true, priority: 'high', deadline: daysFromNow(1), is_daily: false },
    { id: uid('t'), goal_id: 'g_short_1', title: 'Build the bank account class exercise', is_completed: false, priority: 'high', deadline: daysFromNow(2), is_daily: false },
    { id: uid('t'), goal_id: 'g_short_1', title: 'Submit OOP mini-project on GitHub', is_completed: false, priority: 'medium', deadline: daysFromNow(5), is_daily: false },
    { id: uid('t'), goal_id: 'g_short_2', title: 'Solve 10 algebra problems (Set 1)', is_completed: true, priority: 'medium', deadline: daysFromNow(1), is_daily: false },
    { id: uid('t'), goal_id: 'g_short_2', title: 'Solve 10 geometry problems (Set 1)', is_completed: false, priority: 'medium', deadline: daysFromNow(3), is_daily: false },
    { id: uid('t'), goal_id: null, title: 'Review yesterday\'s class notes', is_completed: false, priority: 'low', deadline: daysFromNow(0), is_daily: true },
    { id: uid('t'), goal_id: null, title: '20 minutes of reading practice', is_completed: false, priority: 'low', deadline: daysFromNow(0), is_daily: true },
  ];
}

// Returns habits with realistic streak data — edit titles/emojis/days here
export function createMockHabits(): MockHabit[] {
  const buildCheckIns = (days: number[]): string[] => {
    const result: string[] = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (days.includes(dow) && Math.random() > 0.25) {
        result.push(d.toISOString().slice(0, 10));
      }
    }
    return result;
  };

  return [
    {
      id: 'h_1',
      title: 'Read 20 minutes',
      emoji: 'book',
      active_days: [1, 2, 3, 4, 5, 6],
      streak_count: 5,
      best_streak: 12,
      total_checkins: 18,
      check_ins: buildCheckIns([1, 2, 3, 4, 5, 6]),
      created_at: daysAgo(30),
    },
    {
      id: 'h_2',
      title: 'Revise notes',
      emoji: 'pencil',
      active_days: [1, 2, 3, 4, 5],
      streak_count: 3,
      best_streak: 8,
      total_checkins: 14,
      check_ins: buildCheckIns([1, 2, 3, 4, 5]),
      created_at: daysAgo(30),
    },
    {
      id: 'h_3',
      title: 'Exercise',
      emoji: 'dumbbell',
      active_days: [0, 1, 2, 3, 4, 5, 6],
      streak_count: 2,
      best_streak: 6,
      total_checkins: 10,
      check_ins: buildCheckIns([0, 1, 2, 3, 4, 5, 6]),
      created_at: daysAgo(30),
    },
  ];
}

// Returns exam marks across 5 subjects — edit scores here to test the UI
export function createMockMarks(): MockMark[] {
  return [
    { id: uid('m'), subject: 'Mathematics', exam_name: 'Unit Test 1', exam_type: 'unit_test', score_obtained: 42, max_score: 50, date: daysAgo(40) },
    { id: uid('m'), subject: 'Mathematics', exam_name: 'Mid-Term', exam_type: 'mid_term', score_obtained: 78, max_score: 100, date: daysAgo(20) },
    { id: uid('m'), subject: 'Science', exam_name: 'Unit Test 1', exam_type: 'unit_test', score_obtained: 46, max_score: 50, date: daysAgo(38) },
    { id: uid('m'), subject: 'Science', exam_name: 'Mid-Term', exam_type: 'mid_term', score_obtained: 85, max_score: 100, date: daysAgo(18) },
    { id: uid('m'), subject: 'English', exam_name: 'Unit Test 1', exam_type: 'unit_test', score_obtained: 38, max_score: 50, date: daysAgo(35) },
    { id: uid('m'), subject: 'English', exam_name: 'Mid-Term', exam_type: 'mid_term', score_obtained: 72, max_score: 100, date: daysAgo(15) },
    { id: uid('m'), subject: 'Social Studies', exam_name: 'Unit Test 1', exam_type: 'unit_test', score_obtained: 44, max_score: 50, date: daysAgo(30) },
    { id: uid('m'), subject: 'Social Studies', exam_name: 'Mid-Term', exam_type: 'mid_term', score_obtained: 80, max_score: 100, date: daysAgo(12) },
    { id: uid('m'), subject: 'Computer Science', exam_name: 'Unit Test 1', exam_type: 'unit_test', score_obtained: 49, max_score: 50, date: daysAgo(28) },
    { id: uid('m'), subject: 'Computer Science', exam_name: 'Mid-Term', exam_type: 'mid_term', score_obtained: 92, max_score: 100, date: daysAgo(10) },
  ];
}

// Returns ~45 days of attendance history (skips Sundays)
export function createMockAttendance(): MockAttendance[] {
  const records: MockAttendance[] = [];
  const today = new Date();
  const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent'];
  for (let i = 44; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0) continue;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    records.push({ id: uid('a'), date: d.toISOString().slice(0, 10), status });
  }
  return records;
}

// Returns pending and completed submissions for the submissions tracker
export function createMockSubmissions(): MockSubmission[] {
  return [
    { id: uid('s'), type: 'homework', title: 'Math Problem Set 5', subject: 'Mathematics', status: 'pending', due_date: daysFromNow(2) },
    { id: uid('s'), type: 'notebook', title: 'Science Lab Notebook', subject: 'Science', status: 'pending', due_date: daysFromNow(4) },
    { id: uid('s'), type: 'project', title: 'History Research Presentation', subject: 'Social Studies', status: 'pending', due_date: daysFromNow(7) },
    { id: uid('s'), type: 'homework', title: 'English Essay Draft', subject: 'English', status: 'pending', due_date: daysFromNow(-1) },
    { id: uid('s'), type: 'notebook', title: 'Math Notebook Check', subject: 'Mathematics', status: 'submitted', due_date: daysAgo(3) },
    { id: uid('s'), type: 'project', title: 'Python Mini-Project', subject: 'Computer Science', status: 'graded', due_date: daysAgo(7) },
  ];
}
