import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/context';
import { Attendance, Habit, Mark, Message, Profile, Student, Submission, CURRENT_ACADEMIC_YEAR } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { FullSpinner, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Calendar, TrendingUp, Flame, MessageSquare, Send, User, Users, BookOpen, Notebook, FileText, FolderKanban, CheckCircle2 } from 'lucide-react';

export function ParentDashboard() {
  const { profile, student } = useApp();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(true);

  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!student || !profile) return;
    const sid = student.id;
    const [a, m, h, sub] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', sid).eq('academic_year', CURRENT_ACADEMIC_YEAR).order('date'),
      supabase.from('marks').select('*').eq('student_id', sid).eq('academic_year', CURRENT_ACADEMIC_YEAR).order('created_at'),
      supabase.from('habits').select('*').eq('student_id', sid).order('created_at'),
      supabase.from('submissions').select('*').eq('student_id', sid).eq('academic_year', CURRENT_ACADEMIC_YEAR).order('due_date'),
    ]);
    setAttendance((a.data as Attendance[]) || []);
    setMarks((m.data as Mark[]) || []);
    setHabits((h.data as Habit[]) || []);
    setSubmissions((sub.data as Submission[]) || []);

    if (student.user_id) {
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('user_id', student.user_id).maybeSingle();
      if (prof) setChildName((prof as Profile).full_name);
    }

    const { data: tch } = await supabase.from('profiles').select('*').eq('role', 'teacher').eq('school_id', profile.school_id);
    const tList = (tch as Profile[]) || [];
    setTeachers(tList);
    if (tList[0]) setSelectedTeacher(tList[0].id);
    setLoading(false);
  }, [student, profile]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!profile || !selectedTeacher) return;
    (async () => {
      const { data } = await supabase.from('messages').select('*').eq('parent_id', profile.id).eq('teacher_id', selectedTeacher).order('created_at', { ascending: true });
      setMessages((data as Message[]) || []);
    })();
  }, [profile, selectedTeacher]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!profile || !selectedTeacher || !msgInput.trim()) return;
    setSending(true);
    const body = msgInput.trim();
    setMsgInput('');
    const { data } = await supabase.from('messages').insert({ parent_id: profile.id, teacher_id: selectedTeacher, sender_role: 'parent', body }).select('*').single();
    setSending(false);
    if (data) setMessages((m) => [...m, data as Message]);
  }

  if (loading) return <FullSpinner label="Loading your child's progress…" />;
  if (!student) return <EmptyState icon={<Users className="w-6 h-6" />} title="No child linked" hint="Contact your school admin." />;

  const total = attendance.length;
  const present = attendance.filter((r) => r.status === 'present').length;
  const late = attendance.filter((r) => r.status === 'late').length;
  const absent = attendance.filter((r) => r.status === 'absent').length;
  const attPct = total ? Math.round(((present + late) / total) * 100) : 0;
  const avgScore = marks.length ? Math.round((marks.reduce((s, m) => s + (m.score_obtained / m.max_score) * 100, 0) / marks.length)) : 0;
  const topStreak = Math.max(0, ...habits.map((h) => h.streak_count));
  const pendingSubs = submissions.filter((s) => s.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Parent Dashboard</h1>
        <p className="text-sm text-ink-500">Tracking <span className="font-semibold text-ink-700">{childName || 'your child'}</span> · Session {CURRENT_ACADEMIC_YEAR}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Attendance" value={`${attPct}%`} icon={<Calendar className="w-5 h-5" />} tone="brand" hint={`${present + late} of ${total} days`} />
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={<TrendingUp className="w-5 h-5" />} tone="accent" hint={`${marks.length} exams`} />
        <StatCard label="Top Streak" value={`${topStreak}d`} icon={<Flame className="w-5 h-5" />} tone="warning" />
        <StatCard label="Pending" value={pendingSubs.length} icon={<BookOpen className="w-5 h-5" />} tone="error" hint="Submissions" />
      </div>

      {/* Attendance history */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Attendance History (Current Year)</h3>
        <div className="flex items-end gap-1 h-32">
          {attendance.slice(-20).map((a) => (
            <div key={a.id} className="flex-1 flex flex-col justify-end">
              <div className={`w-full rounded-t-md ${a.status === 'present' ? 'bg-brand-500' : a.status === 'late' ? 'bg-warning-400' : 'bg-error-400'}`} style={{ height: `${a.status === 'present' ? 100 : a.status === 'late' ? 60 : 40}%` }} title={`${a.date} · ${a.status}`} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500" /> Present ({present})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-warning-400" /> Late ({late})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-error-400" /> Absent ({absent})</span>
        </div>
      </div>

      {/* Marks + Submissions */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-4">Current Year Marks</h3>
          <div className="space-y-2.5">
            {marks.length === 0 && <p className="text-sm text-ink-400 italic">No marks recorded this year.</p>}
            {marks.map((m) => {
              const pct = Math.round((m.score_obtained / m.max_score) * 100);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-800 w-28 truncate">{m.subject}</span>
                  <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? 'bg-brand-500' : pct >= 60 ? 'bg-warning-400' : 'bg-error-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-ink-900 w-14 text-right">{m.score_obtained}/{m.max_score}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2 mb-4"><BookOpen className="w-5 h-5 text-brand-600" /> Pending Submissions</h3>
          {pendingSubs.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="w-6 h-6" />} title="No pending submissions" />
          ) : (
            <div className="space-y-2">
              {pendingSubs.map((s) => {
                const icon = s.type === 'notebook' ? <Notebook className="w-4.5 h-4.5" /> : s.type === 'homework' ? <FileText className="w-4.5 h-4.5" /> : <FolderKanban className="w-4.5 h-4.5" />;
                const overdue = s.due_date && new Date(s.due_date) < new Date();
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${overdue ? 'bg-error-50 text-error-600' : 'bg-warning-50 text-warning-600'}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800">{s.title}</p>
                      <p className="text-xs text-ink-400 capitalize">{s.type} · {s.subject || 'General'}</p>
                    </div>
                    <span className={`text-xs font-semibold ${overdue ? 'text-error-600' : 'text-ink-500'}`}>{s.due_date ? new Date(s.due_date).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : '—'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Habits */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Habit Streaks</h3>
        <div className="space-y-2">
          {habits.length === 0 && <p className="text-sm text-ink-400 italic">No habits tracked.</p>}
          {habits.map((h) => (
            <div key={h.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
              <Flame className={`w-4.5 h-4.5 ${h.streak_count > 0 ? 'text-warning-500' : 'text-ink-300'}`} />
              <span className="text-sm font-semibold text-ink-800 flex-1">{h.title}</span>
              <span className="font-display font-extrabold text-ink-900">{h.streak_count}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messaging */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2"><MessageSquare className="w-5 h-5 text-accent-600" /> Message Teacher</h3>
          {teachers.length > 0 && (
            <select className="input max-w-[200px]" value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(e.target.value || null)}>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          )}
        </div>
        {teachers.length === 0 ? (
          <EmptyState icon={<MessageSquare className="w-6 h-6" />} title="No teachers available" />
        ) : (
          <>
            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 h-64 overflow-y-auto space-y-3">
              {messages.length === 0 && <p className="text-sm text-ink-400 text-center py-8">No messages yet.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2.5 ${m.sender_role === 'parent' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.sender_role === 'parent' ? 'bg-accent-100 text-accent-700' : 'bg-brand-100 text-brand-700'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${m.sender_role === 'parent' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-100 text-ink-800'}`}>
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input className="input flex-1" placeholder="Type a message…" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
              <button className="btn-primary p-2.5" onClick={sendMessage} disabled={sending} aria-label="Send">
                {sending ? <Spinner /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
