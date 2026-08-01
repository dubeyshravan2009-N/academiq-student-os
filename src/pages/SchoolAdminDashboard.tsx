import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/context';
import { ClassRow, Profile, Student, Attendance, ActivityLog, TeacherClass, CURRENT_ACADEMIC_YEAR } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { FullSpinner, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Users, GraduationCap, Building2, BarChart3, Plus, UserPlus, Calendar, ScrollText, Layers, Download, Upload, RotateCw, Check, X } from 'lucide-react';

type Tab = 'overview' | 'teachers' | 'students' | 'classes' | 'session' | 'audit';

type StudentRow = Student & { full_name?: string; class_name?: string };
type TeacherRow = Profile & { class_names?: string[] };

export function SchoolAdminDashboard() {
  const { profile, schoolId } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // add teacher modal
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [savingTeacher, setSavingTeacher] = useState(false);

  // add student modal
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);

  // allocate classes modal
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateTeacher, setAllocateTeacher] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [savingAllocation, setSavingAllocation] = useState(false);

  // session management
  const [backups, setBackups] = useState<{ id: string; academic_year: string; created_at: string }[]>([]);
  const [backingUp, setBackingUp] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    const [c, t] = await Promise.all([
      supabase.from('classes').select('*').eq('school_id', schoolId).order('name'),
      supabase.from('profiles').select('*').eq('role', 'teacher').eq('school_id', schoolId).order('full_name'),
    ]);
    const classList = (c.data as ClassRow[]) || [];
    setClasses(classList);
    const classMap = new Map(classList.map((cl) => [cl.id, cl.name]));

    // Load teacher_classes
    const { data: tcData } = await supabase.from('teacher_classes').select('*').eq('school_id', schoolId);
    const tcByTeacher: Record<string, string[]> = {};
    (tcData as TeacherClass[] | null)?.forEach((tc) => {
      if (!tcByTeacher[tc.teacher_id]) tcByTeacher[tc.teacher_id] = [];
      tcByTeacher[tc.teacher_id].push(classMap.get(tc.class_id) || tc.class_id);
    });
    const teacherList = (t.data as Profile[]) || [];
    setTeachers(teacherList.map((tch) => ({ ...tch, class_names: tcByTeacher[tch.id] || [] })));

    // students
    const { data: sData } = await supabase.from('students').select('*').order('roll_number');
    const allStudents = (sData as Student[]) || [];
    const schoolClassIds = new Set(classList.map((cl) => cl.id));
    const filtered = allStudents.filter((st) => st.class_id && schoolClassIds.has(st.class_id));
    const uids = filtered.map((st) => st.user_id).filter(Boolean) as string[];
    let nameMap: Record<string, string> = {};
    if (uids.length) {
      const { data: profs } = await supabase.from('profiles').select('full_name, user_id, id').in('user_id', uids);
      (profs as (Profile & { user_id: string })[] | null)?.forEach((p) => {
        if (p.user_id) nameMap[p.user_id] = p.full_name;
        nameMap[p.id] = p.full_name;
      });
    }
    setStudents(filtered.map((st) => ({
      ...st,
      full_name: st.user_id ? nameMap[st.user_id] : nameMap[st.id],
      class_name: st.class_id ? classMap.get(st.class_id) : undefined,
    })));

    // attendance
    const { data: att } = await supabase.from('attendance').select('*').in('student_id', filtered.map((st) => st.id));
    setAttendance((att as Attendance[]) || []);

    // logs
    const { data: lg } = await supabase.from('activity_logs').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(50);
    setLogs((lg as ActivityLog[]) || []);

    // backups
    const { data: bk } = await supabase.from('session_backups').select('id, academic_year, created_at').eq('school_id', schoolId).order('created_at', { ascending: false });
    setBackups((bk as { id: string; academic_year: string; created_at: string }[]) || []);

    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  async function addTeacher() {
    if (!schoolId || !newTeacherName.trim() || !newTeacherEmail.trim()) return;
    setSavingTeacher(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-parent`;
      const { data: { session } } = await supabase.auth.getSession();
      // Reuse manage-parent edge function (it creates auth users for any role)
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'create', email: newTeacherEmail.trim(), password: newTeacherPassword || 'demo1234', full_name: newTeacherName.trim(), school_id: schoolId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed');
      // Update the created profile to have role=teacher (manage-parent creates as parent)
      await supabase.from('profiles').update({ role: 'teacher' }).eq('auth_id', json.auth_id);
      setAddTeacherOpen(false);
      setNewTeacherName(''); setNewTeacherEmail(''); setNewTeacherPassword('');
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingTeacher(false);
    }
  }

  async function addStudent() {
    if (!schoolId || !newStudentName.trim() || !newStudentClass) return;
    setSavingStudent(true);
    const { data: prof, error: profErr } = await supabase.from('profiles').insert({
      full_name: newStudentName.trim(),
      role: 'student',
      school_id: schoolId,
      class_id: newStudentClass,
    }).select('*').single();
    if (profErr) { setSavingStudent(false); return; }
    await supabase.from('students').insert({
      user_id: (prof as Profile).user_id || (prof as Profile).id,
      roll_number: newStudentRoll.trim() || null,
      class_id: newStudentClass,
      grade_level: classes.find((c) => c.id === newStudentClass)?.grade_level || 1,
    });
    setSavingStudent(false);
    setAddStudentOpen(false);
    setNewStudentName(''); setNewStudentRoll(''); setNewStudentClass('');
    load();
  }

  async function saveAllocation() {
    if (!allocateTeacher || !schoolId) return;
    setSavingAllocation(true);
    // Remove existing allocations for this teacher
    await supabase.from('teacher_classes').delete().eq('teacher_id', allocateTeacher).eq('school_id', schoolId);
    // Insert new
    if (selectedClasses.length > 0) {
      await supabase.from('teacher_classes').insert(selectedClasses.map((cid) => ({
        teacher_id: allocateTeacher,
        class_id: cid,
        school_id: schoolId,
      })));
    }
    setSavingAllocation(false);
    setAllocateOpen(false);
    setAllocateTeacher('');
    setSelectedClasses([]);
    load();
  }

  function openAllocate(teacherId: string, currentClasses: string[]) {
    setAllocateTeacher(teacherId);
    setSelectedClasses(currentClasses);
    setAllocateOpen(true);
  }

  async function backupSession() {
    if (!schoolId || !profile) return;
    setBackingUp(true);
    setSessionMsg(null);
    try {
      // Gather all current-year data
      const studentIds = students.map((s) => s.id);
      const [marks, att, subs] = await Promise.all([
        supabase.from('marks').select('*').in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR),
        supabase.from('attendance').select('*').in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR),
        supabase.from('submissions').select('*').in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR),
      ]);
      const backupData = {
        marks: marks.data,
        attendance: att.data,
        submissions: subs.data,
        students: students,
      };
      const { error } = await supabase.from('session_backups').insert({
        school_id: schoolId,
        academic_year: CURRENT_ACADEMIC_YEAR,
        backup_data: backupData as unknown as Record<string, unknown>,
        created_by: profile.id,
      });
      if (error) throw error;
      setSessionMsg('Backup created successfully.');
      load();
    } catch (err) {
      setSessionMsg(`Error: ${(err as Error).message}`);
    } finally {
      setBackingUp(false);
    }
  }

  async function downloadBackup(backupId: string) {
    const { data } = await supabase.from('session_backups').select('*').eq('id', backupId).maybeSingle();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academiq-backup-${(data as { academic_year: string }).academic_year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function promoteAndReset() {
    if (!schoolId || !confirm('This will promote all students to the next grade and WIPE current-year marks, attendance, and submissions. A backup is strongly recommended first. Continue?')) return;
    setPromoting(true);
    setSessionMsg(null);
    try {
      const studentIds = students.map((s) => s.id);
      // Delete current-year data
      if (studentIds.length) {
        await supabase.from('marks').delete().in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR);
        await supabase.from('attendance').delete().in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR);
        await supabase.from('submissions').delete().in('student_id', studentIds).eq('academic_year', CURRENT_ACADEMIC_YEAR);
      }
      // Promote students: increment grade_level
      for (const s of students) {
        await supabase.from('students').update({ grade_level: s.grade_level + 1 }).eq('id', s.id);
      }
      setSessionMsg('Session reset complete. All students promoted to the next grade.');
      load();
    } catch (err) {
      setSessionMsg(`Error: ${(err as Error).message}`);
    } finally {
      setPromoting(false);
    }
  }

  if (loading) return <FullSpinner label="Loading school overview…" />;
  if (!schoolId) return <EmptyState icon={<Building2 className="w-6 h-6" />} title="No school assigned" />;

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attPct = total ? Math.round((present / total) * 100) : 0;
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAtt = attendance.filter((a) => new Date(a.date) >= weekAgo);
  const weekPct = weekAtt.length ? Math.round((weekAtt.filter((a) => a.status === 'present' || a.status === 'late').length / weekAtt.length) * 100) : 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'teachers', label: 'Teachers', icon: <Users className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'classes', label: 'Classes', icon: <Building2 className="w-4 h-4" /> },
    { id: 'session', label: 'Session Mgmt', icon: <Layers className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">School Admin Dashboard</h1>
        <p className="text-sm text-ink-500">Managing {profile?.full_name ? profile.full_name + "'s school" : 'your school'}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Teachers" value={teachers.length} icon={<Users className="w-5 h-5" />} tone="accent" />
        <StatCard label="Students" value={students.length} icon={<GraduationCap className="w-5 h-5" />} tone="brand" />
        <StatCard label="Classes" value={classes.length} icon={<Building2 className="w-5 h-5" />} tone="neutral" />
        <StatCard label="Attendance" value={`${attPct}%`} icon={<Calendar className="w-5 h-5" />} tone="warning" />
      </div>

      <div className="flex gap-1 rounded-xl bg-ink-100 p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-brand-600" /> Attendance Analytics</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-brand-50 p-4 text-center">
              <p className="font-display text-3xl font-extrabold text-brand-700">{weekPct}%</p>
              <p className="text-xs font-medium text-brand-600 mt-1">This Week</p>
            </div>
            <div className="rounded-xl bg-accent-50 p-4 text-center">
              <p className="font-display text-3xl font-extrabold text-accent-700">{attPct}%</p>
              <p className="text-xs font-medium text-accent-600 mt-1">All-Time</p>
            </div>
            <div className="rounded-xl bg-ink-100 p-4 text-center">
              <p className="font-display text-3xl font-extrabold text-ink-700">{total}</p>
              <p className="text-xs font-medium text-ink-500 mt-1">Records</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'teachers' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2"><Users className="w-5 h-5 text-accent-600" /> Teachers</h3>
            <button className="btn-primary" onClick={() => setAddTeacherOpen(true)}><UserPlus className="w-4 h-4" /> Add Teacher</button>
          </div>
          {teachers.length === 0 ? (
            <EmptyState icon={<Users className="w-6 h-6" />} title="No teachers yet" />
          ) : (
            <div className="space-y-2">
              {teachers.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                  <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center"><Users className="w-4.5 h-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">{t.full_name}</p>
                    <p className="text-xs text-ink-400">{t.class_names?.length ? t.class_names.join(', ') : 'No classes allocated'}</p>
                  </div>
                  <button className="btn-secondary py-1.5 px-3" onClick={() => openAllocate(t.id, t.class_names || [])}>
                    <Layers className="w-4 h-4" /> Allocate Classes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2"><GraduationCap className="w-5 h-5 text-brand-600" /> Students</h3>
            <button className="btn-primary" onClick={() => setAddStudentOpen(true)}><UserPlus className="w-4 h-4" /> Add Student</button>
          </div>
          {students.length === 0 ? (
            <EmptyState icon={<GraduationCap className="w-6 h-6" />} title="No students yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-ink-400 border-b border-ink-100">
                    <th className="py-2.5 font-semibold">Name</th>
                    <th className="py-2.5 font-semibold">Roll No.</th>
                    <th className="py-2.5 font-semibold">Class</th>
                    <th className="py-2.5 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                      <td className="py-3 font-semibold text-ink-800">{s.full_name || s.roll_number || s.id.slice(0, 8)}</td>
                      <td className="py-3 text-ink-600">{s.roll_number || '—'}</td>
                      <td className="py-3 text-ink-600">{s.class_name || '—'}</td>
                      <td className="py-3 text-ink-600">{s.grade_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'classes' && (
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2 mb-4"><Building2 className="w-5 h-5 text-brand-600" /> Classes</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((c) => {
              const count = students.filter((s) => s.class_id === c.id).length;
              const teacherCount = teachers.filter((t) => t.class_names?.some((cn) => cn === c.name)).length;
              return (
                <div key={c.id} className="rounded-xl border border-ink-100 p-4">
                  <p className="font-display font-bold text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-400 mt-1">Grade {c.grade_level}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="chip"><GraduationCap className="w-3.5 h-3.5" /> {count} students</span>
                    <span className="chip"><Users className="w-3.5 h-3.5" /> {teacherCount} teachers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'session' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><Layers className="w-5 h-5 text-brand-600" /> Academic Session Management</h3>
            <p className="text-sm text-ink-600 mb-4">Current Academic Year: <span className="font-bold text-ink-900">{CURRENT_ACADEMIC_YEAR}</span></p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Backup */}
              <div className="rounded-xl border border-ink-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-accent-600" />
                  <p className="font-semibold text-ink-800">Backup Session Data</p>
                </div>
                <p className="text-xs text-ink-500 mb-3">Download a snapshot of marks, attendance, and submissions before wiping.</p>
                <button className="btn-secondary w-full" onClick={backupSession} disabled={backingUp}>
                  {backingUp ? <Spinner /> : <Download className="w-4 h-4" />} Create Backup
                </button>
              </div>

              {/* Promote & Reset */}
              <div className="rounded-xl border border-error-200 bg-error-50/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCw className="w-5 h-5 text-error-600" />
                  <p className="font-semibold text-ink-800">Promote & Reset Session</p>
                </div>
                <p className="text-xs text-error-600 mb-3">Upgrades all students to next grade and WIPES current-year marks, attendance, and submissions.</p>
                <button className="btn-danger w-full" onClick={promoteAndReset} disabled={promoting}>
                  {promoting ? <Spinner /> : <RotateCw className="w-4 h-4" />} Promote & Reset
                </button>
              </div>
            </div>

            {sessionMsg && <p className="text-sm font-medium text-brand-700 mt-3">{sessionMsg}</p>}
          </div>

          {/* Backups list */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Session Backups</h3>
            {backups.length === 0 ? (
              <p className="text-sm text-ink-400 italic">No backups yet.</p>
            ) : (
              <div className="space-y-2">
                {backups.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                    <Upload className="w-4.5 h-4.5 text-accent-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800">Session {b.academic_year}</p>
                      <p className="text-xs text-ink-400">{new Date(b.created_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <button className="btn-secondary py-1.5 px-3" onClick={() => downloadBackup(b.id)}>
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {/* Add Teacher Modal */}
      <Modal open={addTeacherOpen} onClose={() => setAddTeacherOpen(false)} title="Add Teacher" subtitle="Create a teacher account with login credentials.">
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} placeholder="e.g. Anjali Sharma" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} placeholder="teacher@school.edu" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="text" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} placeholder="Leave blank for demo1234" />
          </div>
          <button className="btn-primary w-full" onClick={addTeacher} disabled={savingTeacher}>
            {savingTeacher ? <Spinner /> : <Plus className="w-4 h-4" />} Add Teacher
          </button>
        </div>
      </Modal>

      {/* Add Student Modal */}
      <Modal open={addStudentOpen} onClose={() => setAddStudentOpen(false)} title="Add Student" subtitle="Create a student profile and enroll in a class.">
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="e.g. Aarav Rao" />
          </div>
          <div>
            <label className="label">Roll number</label>
            <input className="input" value={newStudentRoll} onChange={(e) => setNewStudentRoll(e.target.value)} placeholder="e.g. GWH-08A-05" />
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" value={newStudentClass} onChange={(e) => setNewStudentClass(e.target.value)}>
              <option value="">Select class…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="btn-primary w-full" onClick={addStudent} disabled={savingStudent}>
            {savingStudent ? <Spinner /> : <Plus className="w-4 h-4" />} Add Student
          </button>
        </div>
      </Modal>

      {/* Allocate Classes Modal */}
      <Modal open={allocateOpen} onClose={() => setAllocateOpen(false)} title="Allocate Classes" subtitle="Select which classes this teacher can access.">
        <div className="space-y-3">
          {classes.map((c) => (
            <label key={c.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 cursor-pointer hover:bg-ink-50/50">
              <input type="checkbox" checked={selectedClasses.includes(c.id)} onChange={(e) => {
                if (e.target.checked) setSelectedClasses((p) => [...p, c.id]);
                else setSelectedClasses((p) => p.filter((id) => id !== c.id));
              }} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
              <div>
                <p className="text-sm font-semibold text-ink-800">{c.name}</p>
                <p className="text-xs text-ink-400">Grade {c.grade_level}</p>
              </div>
            </label>
          ))}
          <button className="btn-primary w-full" onClick={saveAllocation} disabled={savingAllocation}>
            {savingAllocation ? <Spinner /> : <Check className="w-4 h-4" />} Save Allocation
          </button>
        </div>
      </Modal>
    </div>
  );
}
