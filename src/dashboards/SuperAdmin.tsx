import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/context';
import { School, Profile, Student, Attendance } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { Sidebar } from '@/components/Sidebar';
import { FullSpinner, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Building2, Users, GraduationCap, CheckCircle2, XCircle, Clock, Activity, ShieldCheck, Crown, KeyRound, Copy, Check, RefreshCw, Lock, ShieldAlert } from 'lucide-react';

type Tab = 'overview' | 'schools' | 'security';

export function SuperAdminDashboard() {
  const { profile } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [schools, setSchools] = useState<School[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // security tab
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [editingCodeFor, setEditingCodeFor] = useState<string | null>(null);
  const [newCodeValue, setNewCodeValue] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, p, st, a] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('students').select('*'),
      supabase.from('attendance').select('*'),
    ]);
    setSchools((s.data as School[]) || []);
    setProfiles((p.data as Profile[]) || []);
    setStudents((st.data as Student[]) || []);
    setAttendance((a.data as Attendance[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function actOnSchool(school: School, status: 'approved' | 'rejected') {
    setActing(school.id);
    const { error } = await supabase.from('schools').update({ status }).eq('id', school.id);
    setActing(null);
    if (!error) load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function changePassword() {
    setPasswordMsg(null);
    if (newPassword.length < 6) { setPasswordMsg('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('Passwords do not match.'); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { setPasswordMsg(`Error: ${error.message}`); return; }
    setPasswordMsg('Password updated successfully.');
    setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 3000);
  }

  async function regenerateCode(schoolId: string) {
    setSavingCode(true);
    setCodeMsg(null);
    const code = 'SCH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const { error } = await supabase.from('schools').update({ access_code: code }).eq('id', schoolId);
    setSavingCode(false);
    if (error) { setCodeMsg(`Error: ${error.message}`); return; }
    setCodeMsg(`Access code regenerated: ${code}`);
    setEditingCodeFor(null);
    load();
    setTimeout(() => setCodeMsg(null), 3000);
  }

  async function saveCustomCode(schoolId: string) {
    if (!newCodeValue.trim()) return;
    setSavingCode(true);
    setCodeMsg(null);
    const { error } = await supabase.from('schools').update({ access_code: newCodeValue.toUpperCase().trim() }).eq('id', schoolId);
    setSavingCode(false);
    if (error) { setCodeMsg(`Error: ${error.message}`); return; }
    setCodeMsg('Access code updated.');
    setEditingCodeFor(null);
    setNewCodeValue('');
    load();
    setTimeout(() => setCodeMsg(null), 3000);
  }

  async function revokeCode(schoolId: string) {
    if (!confirm('Revoking this code will prevent all new logins for this school. Continue?')) return;
    setSavingCode(true);
    const { error } = await supabase.from('schools').update({ access_code: null }).eq('id', schoolId);
    setSavingCode(false);
    if (error) { setCodeMsg(`Error: ${error.message}`); return; }
    setCodeMsg('Access code revoked.');
    load();
  }

  if (loading) return <FullSpinner label="Loading platform analytics…" />;

  const pending = schools.filter((s) => s.status === 'pending');
  const approved = schools.filter((s) => s.status === 'approved');
  const teachers = profiles.filter((p) => p.role === 'teacher');
  const studentProfiles = profiles.filter((p) => p.role === 'student');
  const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attPct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'schools', label: 'Schools', icon: <Building2 className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Credentials', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 flex items-center gap-2">
            Super Admin Panel <Crown className="w-6 h-6 text-warning-500" />
          </h1>
          <p className="text-sm text-ink-500">Welcome, {profile?.full_name}. Platform-wide control center.</p>
        </div>
        <span className="badge bg-warning-50 text-warning-700"><ShieldCheck className="w-3.5 h-3.5" /> Founder Access</span>
      </div>

      <Sidebar tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)} />

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Active Schools" value={approved.length} icon={<Building2 className="w-5 h-5" />} tone="brand" hint={`${pending.length} pending`} />
            <StatCard label="Total Users" value={profiles.length} icon={<Users className="w-5 h-5" />} tone="accent" hint={`${teachers.length} teachers`} />
            <StatCard label="Students" value={studentProfiles.length} icon={<GraduationCap className="w-5 h-5" />} tone="warning" />
            <StatCard label="Attendance" value={`${attPct}%`} icon={<Activity className="w-5 h-5" />} tone="neutral" />
          </div>

          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-brand-600" /> System Health</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Database', status: 'Operational' },
                { label: 'Auth Service', status: 'Operational' },
                { label: 'Edge Functions', status: 'Operational' },
                { label: 'Storage', status: 'Operational' },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-ink-100 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-800">{m.label}</p>
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft" />
                  </div>
                  <p className="text-xs font-medium mt-1 text-brand-700">{m.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title flex items-center gap-2"><Clock className="w-5 h-5 text-warning-500" /> School Registrations Queue</h3>
              <span className="chip">{pending.length} pending</span>
            </div>
            {pending.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="w-6 h-6" />} title="No pending applications" />
            ) : (
              <div className="space-y-2.5">
                {pending.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900">{s.name}</p>
                      <p className="text-xs text-ink-500">{s.principal_email} · {s.phone || 'no phone'} · {s.address || 'no address'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="btn-primary" disabled={acting === s.id} onClick={() => actOnSchool(s, 'approved')}>
                        {acting === s.id ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />} Approve
                      </button>
                      <button className="btn-danger" disabled={acting === s.id} onClick={() => actOnSchool(s, 'rejected')}>
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'schools' && (
        <div className="card p-5">
          <h3 className="section-title mb-4">All Schools</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ink-400 border-b border-ink-100">
                  <th className="py-2.5 font-semibold">School</th>
                  <th className="py-2.5 font-semibold">Principal</th>
                  <th className="py-2.5 font-semibold">Plan</th>
                  <th className="py-2.5 font-semibold">Access Code</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 font-semibold text-ink-800">{s.name}</td>
                    <td className="py-3 text-ink-600">{s.principal_email || '—'}</td>
                    <td className="py-3"><span className="chip capitalize">{s.subscription_plan}</span></td>
                    <td className="py-3">
                      {s.access_code ? (
                        <button onClick={() => copyCode(s.access_code!)} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-mono font-bold text-ink-700 hover:bg-ink-200 transition-colors">
                          <KeyRound className="w-3 h-3" /> {s.access_code}
                          {copiedCode === s.access_code ? <Check className="w-3 h-3 text-brand-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${s.status === 'approved' ? 'bg-brand-50 text-brand-700' : s.status === 'pending' ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-5">
          {/* Change password */}
          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-brand-600" /> Change My Password</h3>
            <p className="text-sm text-ink-500 mb-4">Update your Super Admin account password. Passwords are handled securely via Supabase Auth and never stored in plaintext.</p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="label">New password</label>
                <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
            </div>
            <button className="btn-primary mt-4" onClick={changePassword} disabled={changingPassword}>
              {changingPassword ? <Spinner /> : <Lock className="w-4 h-4" />} Update Password
            </button>
            {passwordMsg && <p className={`text-sm font-medium mt-3 ${passwordMsg.startsWith('Error') ? 'text-error-600' : 'text-brand-700'}`}>{passwordMsg}</p>}
          </div>

          {/* School access code management */}
          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><KeyRound className="w-5 h-5 text-accent-600" /> School Access Code Management</h3>
            <p className="text-sm text-ink-500 mb-4">Edit, regenerate, or revoke the unique School Access Code for any approved school.</p>
            {codeMsg && <p className={`text-sm font-medium mb-3 ${codeMsg.startsWith('Error') ? 'text-error-600' : 'text-brand-700'}`}>{codeMsg}</p>}
            <div className="space-y-2.5">
              {approved.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                  <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center shrink-0"><Building2 className="w-4.5 h-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">{s.name}</p>
                    {editingCodeFor === s.id ? (
                      <div className="flex items-center gap-2 mt-1.5">
                        <input className="input w-32 text-sm font-mono" value={newCodeValue} onChange={(e) => setNewCodeValue(e.target.value)} placeholder={s.access_code || 'SCH-XXXX'} />
                        <button className="btn-primary py-1.5 px-3" disabled={savingCode} onClick={() => saveCustomCode(s.id)}><Check className="w-4 h-4" /></button>
                        <button className="btn-ghost py-1.5 px-3" onClick={() => { setEditingCodeFor(null); setNewCodeValue(''); }}><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-400 font-mono">{s.access_code || 'No code assigned'}</p>
                    )}
                  </div>
                  {editingCodeFor !== s.id && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="btn-secondary py-1.5 px-2.5" onClick={() => { setEditingCodeFor(s.id); setNewCodeValue(''); }} title="Edit code"><KeyRound className="w-4 h-4" /></button>
                      <button className="btn-secondary py-1.5 px-2.5" disabled={savingCode} onClick={() => regenerateCode(s.id)} title="Regenerate"><RefreshCw className="w-4 h-4" /></button>
                      {s.access_code && (
                        <button className="btn-danger py-1.5 px-2.5" disabled={savingCode} onClick={() => revokeCode(s.id)} title="Revoke"><ShieldAlert className="w-4 h-4" /></button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {approved.length === 0 && <p className="text-sm text-ink-400 italic">No approved schools yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
