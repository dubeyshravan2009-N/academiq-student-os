import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/context';
import { ClassRow, Profile, Student, Attendance, AttendanceStatus, Mark, EnrollmentRequest, ActivityLog, CURRENT_ACADEMIC_YEAR } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { FullSpinner, EmptyState, Spinner, ErrorState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { ClipboardCheck, Save, Check, Users, Calendar, Award, UserPlus, UserCog, ScrollText, CheckCircle2, XCircle, Clock, KeyRound, Mail, Activity, Heart, TrendingUp, AlertTriangle } from 'lucide-react';

type Tab = 'overview' | 'attendance' | 'marks' | 'enrollment' | 'parents' | 'audit';
type StudentWithName = Student & { full_name?: string };

export function TeacherDashboard() {
  const { profile } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [myClasses, setMyClasses] = useState<ClassRow[]>([]);
  const [allStudents, setAllStudents] = useState<StudentWithName[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [existing, setExisting] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // marks
  const [subject, setSubject] = useState('');
  const [examName, setExamName] = useState('Mid-Term');
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksMsg, setMarksMsg] = useState<string | null>(null);

  // enrollment
  const [enrollmentReqs, setEnrollmentReqs] = useState<EnrollmentRequest[]>([]);
  const [actingEnroll, setActingEnroll] = useState<string | null>(null);

  // parent management
  const [parents, setParents] = useState<Profile[]>([]);
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [savingParent, setSavingParent] = useState(false);
  const [parentMsg, setParentMsg] = useState<string | null>(null);
  const [resetParentId, setResetParentId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  // audit
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const loadClasses = useCallback(async () => {
    if (!profile) return;
    // Get teacher's allocated classes
    const { data: tc } = await supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id);
    const classIds = ((tc as { class_id: string }[]) || []).map((t) => t.class_id);
    if (classIds.length === 0) { setMyClasses([]); setLoading(false); return; }
    const { data: cls } = await supabase.from('classes').select('*').in('id', classIds).order('name');
    setMyClasses((cls as ClassRow[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  // Load students for selected class
  useEffect(() => {
    if (!selectedClass) { setAllStudents([]); return; }
    (async () => {
      const { data } = await supabase.from('students').select('*').eq('class_id', selectedClass).order('roll_number');
      const studs = (data as Student[]) || [];
      const uids = studs.map((s) => s.user_id).filter(Boolean) as string[];
      let nameMap: Record<string, string> = {};
      if (uids.length) {
        const { data: profs } = await supabase.from('profiles').select('full_name, user_id, id').in('user_id', uids);
        (profs as (Profile & { user_id: string })[] | null)?.forEach((p) => {
          if (p.user_id) nameMap[p.user_id] = p.full_name;
          nameMap[p.id] = p.full_name;
        });
      }
      setAllStudents(studs.map((s) => ({ ...s, full_name: s.user_id ? nameMap[s.user_id] : nameMap[s.id] })));
      // load existing attendance
      const { data: att } = await supabase.from('attendance').select('*').in('student_id', studs.map((s) => s.id)).eq('date', date);
      const map: Record<string, AttendanceStatus> = {};
      const ex: Record<string, string> = {};
      (att as Attendance[] | null)?.forEach((a) => { map[a.student_id] = a.status; ex[a.student_id] = a.status; });
      setAttendance(map);
      setExisting(ex);
    })();
  }, [selectedClass, date, profile]);

  // Load enrollment requests for teacher's classes
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: tc } = await supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id);
      const classIds = ((tc as { class_id: string }[]) || []).map((t) => t.class_id);
      if (classIds.length === 0) return;
      const { data: reqs } = await supabase.from('enrollment_requests').select('*').in('class_id', classIds).order('created_at', { ascending: false });
      setEnrollmentReqs((reqs as EnrollmentRequest[]) || []);
    })();
  }, [profile]);

  // Load parents of students in teacher's classes
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: tc } = await supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id);
      const classIds = ((tc as { class_id: string }[]) || []).map((t) => t.class_id);
      if (classIds.length === 0) return;
      const { data: studs } = await supabase.from('students').select('parent_id').in('class_id', classIds);
      const parentIds = ((studs as { parent_id: string }[]) || []).map((s) => s.parent_id).filter(Boolean) as string[];
      if (parentIds.length === 0) return;
      const { data: profs } = await supabase.from('profiles').select('*').in('id', parentIds);
      setParents((profs as Profile[]) || []);
    })();
  }, [profile]);

  // Load audit logs
  useEffect(() => {
    if (!profile?.school_id) return;
    (async () => {
      const { data } = await supabase.from('activity_logs').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(50);
      setLogs((data as ActivityLog[]) || []);
    })();
  }, [profile]);

  async function logAction(action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
    if (!profile) return;
    await supabase.from('activity_logs').insert({
      actor_id: profile.id,
      school_id: profile.school_id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  }

  async function submitAttendance() {
    if (!selectedClass || !profile) return;
    setSaving(true);
    setSavedMsg(null);
    const rows = allStudents.map((s) => ({
      student_id: s.id,
      date,
      status: attendance[s.id] || 'present',
      marked_by_teacher_id: profile.id,
      academic_year: CURRENT_ACADEMIC_YEAR,
    }));
    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' });
    setSaving(false);
    if (error) { setSavedMsg(`Error: ${error.message}`); return; }
    setSavedMsg('Attendance saved successfully.');
    logAction('attendance_marked', 'class', selectedClass, { date, count: rows.length });
    setTimeout(() => setSavedMsg(null), 3000);
  }

  async function submitMarks() {
    if (!selectedClass || !subject.trim() || !profile) { setMarksMsg('Select a class and enter a subject.'); return; }
    setSavingMarks(true);
    setMarksMsg(null);
    const rows = allStudents
      .filter((s) => scoreInputs[s.id] !== undefined && scoreInputs[s.id] !== '')
      .map((s) => ({
        student_id: s.id,
        subject: subject.trim(),
        exam_name: examName.trim() || 'Exam',
        score_obtained: parseFloat(scoreInputs[s.id]) || 0,
        max_score: 100,
        academic_year: CURRENT_ACADEMIC_YEAR,
      }));
    if (rows.length === 0) { setMarksMsg('Enter at least one score.'); setSavingMarks(false); return; }
    const { error } = await supabase.from('marks').insert(rows);
    setSavingMarks(false);
    if (error) { setMarksMsg(`Error: ${error.message}`); return; }
    setMarksMsg(`${rows.length} mark(s) saved.`);
    logAction('marks_entered', 'class', selectedClass, { subject: subject.trim(), count: rows.length });
    setScoreInputs({});
    setTimeout(() => setMarksMsg(null), 3000);
  }

  async function actOnEnrollment(req: EnrollmentRequest, status: 'approved' | 'rejected') {
    setActingEnroll(req.id);
    const { error } = await supabase.from('enrollment_requests').update({
      status,
      reviewed_by_teacher_id: profile?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', req.id);
    setActingEnroll(null);
    if (error) return;
    logAction(`enrollment_${status}`, 'enrollment_request', req.id, { student_name: req.student_name });
    // refresh
    if (profile) {
      const { data: tc } = await supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id);
      const classIds = ((tc as { class_id: string }[]) || []).map((t) => t.class_id);
      const { data: reqs } = await supabase.from('enrollment_requests').select('*').in('class_id', classIds).order('created_at', { ascending: false });
      setEnrollmentReqs((reqs as EnrollmentRequest[]) || []);
    }
  }

  async function createParent() {
    if (!profile?.school_id || !parentEmail.trim() || !parentName.trim()) return;
    setSavingParent(true);
    setParentMsg(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-parent`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'create',
          email: parentEmail.trim(),
          password: parentPassword || 'temp1234',
          full_name: parentName.trim(),
          school_id: profile.school_id,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to create parent');
      setParentMsg('Parent account created successfully.');
      logAction('parent_created', 'parent', parentEmail.trim(), { name: parentName.trim() });
      setParentName(''); setParentEmail(''); setParentPassword('');
      // refresh parents
      const { data: tc } = await supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id);
      const classIds = ((tc as { class_id: string }[]) || []).map((t) => t.class_id);
      const { data: studs } = await supabase.from('students').select('parent_id').in('class_id', classIds);
      const parentIds = ((studs as { parent_id: string }[]) || []).map((s) => s.parent_id).filter(Boolean) as string[];
      if (parentIds.length) {
        const { data: profs } = await supabase.from('profiles').select('*').in('id', parentIds);
        setParents((profs as Profile[]) || []);
      }
      setTimeout(() => { setParentMsg(null); setParentModalOpen(false); }, 2000);
    } catch (err) {
      setParentMsg((err as Error).message);
    } finally {
      setSavingParent(false);
    }
  }

  async function resetParentPassword(authId: string) {
    if (!resetPassword.trim()) return;
    setSavingParent(true);
    setParentMsg(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-parent`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'reset_password',
          existing_auth_id: authId,
          password: resetPassword.trim(),
          school_id: profile?.school_id,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to reset password');
      setParentMsg('Password reset successfully.');
      logAction('parent_password_reset', 'parent', authId, {});
      setResetParentId(null);
      setResetPassword('');
      setTimeout(() => setParentMsg(null), 3000);
    } catch (err) {
      setParentMsg((err as Error).message);
    } finally {
      setSavingParent(false);
    }
  }

  if (loading) return <FullSpinner label="Loading teacher tools…" />;

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const pendingEnrollments = enrollmentReqs.filter((r) => r.status === 'pending');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'marks', label: 'Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'enrollment', label: 'Enrollment', icon: <UserPlus className="w-4 h-4" />, badge: pendingEnrollments.length },
    { id: 'parents', label: 'Parent Mgmt', icon: <UserCog className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Teacher Dashboard</h1>
        <p className="text-sm text-ink-500">Welcome, {profile?.full_name}. You have access to {myClasses.length} class(es).</p>
      </div>

      {myClasses.length === 0 ? (
        <EmptyState icon={<Users className="w-6 h-6" />} title="No classes allocated" hint="Ask your School Admin to assign classes to you." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="My Classes" value={myClasses.length} icon={<Calendar className="w-5 h-5" />} tone="accent" />
            <StatCard label="Students" value={allStudents.length} icon={<Users className="w-5 h-5" />} tone="brand" />
            <StatCard label="Present Today" value={presentCount} icon={<Check className="w-5 h-5" />} tone="neutral" />
            <StatCard label="Pending Enrollments" value={pendingEnrollments.length} icon={<Clock className="w-5 h-5" />} tone="warning" />
          </div>

          <div className="flex gap-1 rounded-xl bg-ink-100 p-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>
                {t.icon} {t.label}
                {t.badge ? <span className="badge bg-error-50 text-error-700 ml-1">{t.badge}</span> : null}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <ClassHealthIndex students={allStudents} attendance={attendance} selectedClass={selectedClass} myClasses={myClasses} onSelectClass={setSelectedClass} />
          )}

          {/* Class selector shared by attendance + marks */}
          {(tab === 'attendance' || tab === 'marks') && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="label">Class</label>
                <select className="input min-w-[180px]" value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)}>
                  <option value="">Select class…</option>
                  {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {tab === 'attendance' && (
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {tab === 'attendance' && (
            <div className="card p-5">
              <h3 className="section-title flex items-center gap-2 mb-4"><ClipboardCheck className="w-5 h-5 text-brand-600" /> Daily Attendance</h3>
              {!selectedClass ? (
                <EmptyState icon={<Users className="w-6 h-6" />} title="Select a class to mark attendance" />
              ) : allStudents.length === 0 ? (
                <EmptyState icon={<Users className="w-6 h-6" />} title="No students in this class" />
              ) : (
                <div className="space-y-2">
                  {allStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{s.full_name || s.roll_number || s.id.slice(0, 8)}</p>
                        {s.roll_number && <p className="text-xs text-ink-400">{s.roll_number}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(['present', 'absent', 'late'] as AttendanceStatus[]).map((st) => {
                          const active = attendance[s.id] === st;
                          return (
                            <button key={st} onClick={() => setAttendance((prev) => ({ ...prev, [s.id]: st }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${active ? st === 'present' ? 'bg-brand-600 text-white' : st === 'absent' ? 'bg-error-500 text-white' : 'bg-warning-500 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}>
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-ink-400">{presentCount} present</p>
                    <button className="btn-primary" onClick={submitAttendance} disabled={saving}>
                      {saving ? <Spinner /> : <Save className="w-4 h-4" />} Submit Attendance
                    </button>
                  </div>
                  {savedMsg && <p className={`text-sm font-medium ${savedMsg.startsWith('Error') ? 'text-error-600' : 'text-brand-700'}`}>{savedMsg}</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'marks' && (
            <div className="card p-5">
              <h3 className="section-title flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-accent-600" /> Marks Entry</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="e.g. Physics" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="label">Exam name</label>
                  <input className="input" value={examName} onChange={(e) => setExamName(e.target.value)} />
                </div>
              </div>
              {!selectedClass ? (
                <EmptyState icon={<Award className="w-6 h-6" />} title="Select a class to enter marks" />
              ) : allStudents.length === 0 ? (
                <EmptyState icon={<Award className="w-6 h-6" />} title="No students in this class" />
              ) : (
                <div className="space-y-2">
                  {allStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{s.full_name || s.roll_number || s.id.slice(0, 8)}</p>
                      </div>
                      <input type="number" min={0} max={100} className="input w-20 text-center" placeholder="0" value={scoreInputs[s.id] || ''} onChange={(e) => setScoreInputs((p) => ({ ...p, [s.id]: e.target.value }))} />
                      <span className="text-xs text-ink-400">/ 100</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-ink-400">Average: {Object.values(scoreInputs).filter(Boolean).length ? Math.round(Object.values(scoreInputs).filter(Boolean).reduce((a, b) => a + parseFloat(b), 0) / Object.values(scoreInputs).filter(Boolean).length) : 0}%</p>
                    <button className="btn-primary" onClick={submitMarks} disabled={savingMarks}>
                      {savingMarks ? <Spinner /> : <Save className="w-4 h-4" />} Save Marks
                    </button>
                  </div>
                  {marksMsg && <p className={`text-sm font-medium ${marksMsg.startsWith('Error') || marksMsg.includes('Select') ? 'text-error-600' : 'text-brand-700'}`}>{marksMsg}</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'enrollment' && (
            <div className="card p-5">
              <h3 className="section-title flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-accent-600" /> Enrollment Requests</h3>
              {enrollmentReqs.length === 0 ? (
                <EmptyState icon={<UserPlus className="w-6 h-6" />} title="No enrollment requests" />
              ) : (
                <div className="space-y-2.5">
                  {enrollmentReqs.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800">{r.student_name}</p>
                        <p className="text-xs text-ink-400">{r.roll_number || 'No roll number'}</p>
                      </div>
                      <span className={`badge ${r.status === 'pending' ? 'bg-warning-50 text-warning-700' : r.status === 'approved' ? 'bg-brand-50 text-brand-700' : 'bg-error-50 text-error-700'}`}>{r.status}</span>
                      {r.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button className="btn-primary py-1.5 px-3" disabled={actingEnroll === r.id} onClick={() => actOnEnrollment(r, 'approved')}>
                            {actingEnroll === r.id ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />} Approve
                          </button>
                          <button className="btn-danger py-1.5 px-3" disabled={actingEnroll === r.id} onClick={() => actOnEnrollment(r, 'rejected')}>
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'parents' && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title flex items-center gap-2"><UserCog className="w-5 h-5 text-accent-600" /> Parent Management</h3>
                <button className="btn-primary" onClick={() => setParentModalOpen(true)}><UserPlus className="w-4 h-4" /> Add Parent</button>
              </div>
              {parentMsg && <p className="text-sm font-medium text-brand-700 mb-3">{parentMsg}</p>}
              {parents.length === 0 ? (
                <EmptyState icon={<UserCog className="w-6 h-6" />} title="No parents linked to your classes" hint="Create parent accounts for your students' parents." />
              ) : (
                <div className="space-y-2">
                  {parents.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                      <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center"><UserCog className="w-4.5 h-4.5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{p.full_name}</p>
                        <p className="text-xs text-ink-400">Parent</p>
                      </div>
                      {resetParentId === p.auth_id ? (
                        <div className="flex items-center gap-2">
                          <input type="password" className="input w-32 text-sm" placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                          <button className="btn-primary py-1.5 px-3" disabled={savingParent} onClick={() => p.auth_id && resetParentPassword(p.auth_id)}>
                            {savingParent ? <Spinner /> : <KeyRound className="w-4 h-4" />} Set
                          </button>
                          <button className="btn-ghost py-1.5 px-3" onClick={() => { setResetParentId(null); setResetPassword(''); }}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn-secondary py-1.5 px-3" onClick={() => setResetParentId(p.auth_id)}>
                          <KeyRound className="w-4 h-4" /> Reset Password
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'audit' && (
            <div className="card p-5">
              <h3 className="section-title flex items-center gap-2 mb-4"><ScrollText className="w-5 h-5 text-ink-600" /> Activity Audit Log</h3>
              {logs.length === 0 ? (
                <EmptyState icon={<ScrollText className="w-6 h-6" />} title="No activity logged yet" />
              ) : (
                <div className="space-y-2">
                  {logs.map((l) => (
                    <div key={l.id} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800">{l.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-ink-400 capitalize">{l.entity_type} · {new Date(l.created_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Parent Modal */}
      <Modal open={parentModalOpen} onClose={() => setParentModalOpen(false)} title="Create Parent Account" subtitle="Create login credentials for a student's parent.">
        <div className="space-y-4">
          <div>
            <label className="label">Parent name</label>
            <input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Sunita Rao" />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input className="input pl-10" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="text" value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} placeholder="Leave blank for temp1234" />
          </div>
          {parentMsg && <ErrorState message={parentMsg} />}
          <button className="btn-primary w-full" onClick={createParent} disabled={savingParent}>
            {savingParent ? <Spinner /> : <UserPlus className="w-4 h-4" />} Create Parent
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ClassHealthIndex({
  students,
  attendance,
  selectedClass,
  myClasses,
  onSelectClass,
}: {
  students: StudentWithName[];
  attendance: Record<string, AttendanceStatus>;
  selectedClass: string | null;
  myClasses: ClassRow[];
  onSelectClass: (id: string) => void;
}) {
  // Mock health data per student for demo
  const studentHealth = students.map((s, i) => {
    const present = Object.values(attendance).filter((a) => a === 'present').length;
    const total = Object.keys(attendance).length || 1;
    const attendancePct = Math.round((present / total) * 100);
    const habitRate = 60 + ((i * 37) % 40);
    const pendingAssignments = (i * 3) % 4;
    const healthScore = Math.round(attendancePct * 0.4 + habitRate * 0.35 + (100 - pendingAssignments * 20) * 0.25);
    return {
      student: s,
      attendancePct: Math.min(100, Math.max(50, attendancePct + ((i * 13) % 20) - 10)),
      habitRate,
      pendingAssignments,
      healthScore: Math.min(100, Math.max(30, healthScore)),
    };
  });

  const classAvgHealth = studentHealth.length
    ? Math.round(studentHealth.reduce((s, h) => s + h.healthScore, 0) / studentHealth.length)
    : 0;
  const classAvgAttendance = studentHealth.length
    ? Math.round(studentHealth.reduce((s, h) => s + h.attendancePct, 0) / studentHealth.length)
    : 0;
  const classAvgHabit = studentHealth.length
    ? Math.round(studentHealth.reduce((s, h) => s + h.habitRate, 0) / studentHealth.length)
    : 0;
  const totalPending = studentHealth.reduce((s, h) => s + h.pendingAssignments, 0);

  const needsSupport = studentHealth.filter((h) => h.healthScore < 60).sort((a, b) => a.healthScore - b.healthScore);

  const healthColor = (score: number) =>
    score >= 80 ? 'text-brand-600' : score >= 60 ? 'text-warning-600' : 'text-error-600';
  const healthBg = (score: number) =>
    score >= 80 ? 'bg-brand-500' : score >= 60 ? 'bg-warning-400' : 'bg-error-400';
  const healthLabel = (score: number) =>
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Support';

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="section-title">Class Health & Growth Index</h3>
        <p className="text-sm text-ink-500 mt-0.5">Auto-calculated from attendance, habit completion, and assignment status</p>
      </div>

      {/* Class selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Select Class</label>
          <select
            className="input min-w-[200px]"
            value={selectedClass || ''}
            onChange={(e) => onSelectClass(e.target.value)}
          >
            <option value="">Choose a class…</option>
            {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!selectedClass ? (
        <div className="card p-8">
          <EmptyState icon={<Heart className="w-6 h-6" />} title="Select a class to view health metrics" hint="Choose a class above to see the Class Health & Growth Index." />
        </div>
      ) : students.length === 0 ? (
        <div className="card p-8">
          <EmptyState icon={<Users className="w-6 h-6" />} title="No students enrolled" hint="No students found in this class." />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${healthColor(classAvgHealth)}`} />
                <p className="text-xs font-medium text-ink-500 uppercase">Class Health</p>
              </div>
              <p className={`stat-num ${healthColor(classAvgHealth)}`}>{classAvgHealth}<span className="text-base text-ink-400 ml-1">/100</span></p>
              <p className={`text-xs font-semibold mt-0.5 ${healthColor(classAvgHealth)}`}>{healthLabel(classAvgHealth)}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <p className="text-xs font-medium text-ink-500 uppercase">Avg Attendance</p>
              </div>
              <p className="stat-num text-ink-900">{classAvgAttendance}<span className="text-base text-ink-400 ml-1">%</span></p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-accent-600" />
                <p className="text-xs font-medium text-ink-500 uppercase">Habit Completion</p>
              </div>
              <p className="stat-num text-ink-900">{classAvgHabit}<span className="text-base text-ink-400 ml-1">%</span></p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-warning-600" />
                <p className="text-xs font-medium text-ink-500 uppercase">Pending Assignments</p>
              </div>
              <p className="stat-num text-ink-900">{totalPending}</p>
            </div>
          </div>

          {/* Needs support alert */}
          {needsSupport.length > 0 && (
            <div className="card p-4 bg-error-50/50 border-error-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-error-100 text-error-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{needsSupport.length} student(s) need extra support this week</p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {needsSupport.map((h) => h.student.full_name || h.student.roll_number || 'Unknown').join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Student breakdown table */}
          <div className="card p-5">
            <h4 className="text-sm font-bold text-ink-900 mb-4">Student Health Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100">
                    <th className="text-left font-semibold text-ink-500 py-2 px-2">Student</th>
                    <th className="text-center font-semibold text-ink-500 py-2 px-2">Attendance</th>
                    <th className="text-center font-semibold text-ink-500 py-2 px-2">Habit Rate</th>
                    <th className="text-center font-semibold text-ink-500 py-2 px-2">Pending</th>
                    <th className="text-right font-semibold text-ink-500 py-2 px-2">Health Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studentHealth.map((h, i) => (
                    <tr key={i} className="border-b border-ink-50 last:border-0">
                      <td className="py-2.5 px-2 font-semibold text-ink-800">{h.student.full_name || h.student.roll_number || 'Unknown'}</td>
                      <td className="text-center py-2.5 px-2">
                        <span className={`font-bold ${h.attendancePct >= 80 ? 'text-brand-600' : h.attendancePct >= 60 ? 'text-warning-600' : 'text-error-600'}`}>{h.attendancePct}%</span>
                      </td>
                      <td className="text-center py-2.5 px-2">
                        <span className={`font-bold ${h.habitRate >= 70 ? 'text-brand-600' : 'text-warning-600'}`}>{h.habitRate}%</span>
                      </td>
                      <td className="text-center py-2.5 px-2">
                        <span className={`badge ${h.pendingAssignments > 0 ? 'bg-warning-50 text-warning-700' : 'bg-brand-50 text-brand-700'}`}>
                          {h.pendingAssignments}
                        </span>
                      </td>
                      <td className="text-right py-2.5 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 rounded-full bg-ink-100 overflow-hidden">
                            <div className={`h-full rounded-full ${healthBg(h.healthScore)}`} style={{ width: `${h.healthScore}%` }} />
                          </div>
                          <span className={`font-bold ${healthColor(h.healthScore)} w-8 text-right`}>{h.healthScore}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
