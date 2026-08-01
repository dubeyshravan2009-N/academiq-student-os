import { useState } from 'react';
import { GraduationCap, LogIn, Lock, KeyRound, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import { Role } from '@/lib/types';
import { DevModeBar } from '@/components/DevModeBar';
import { useApp, DevDemoAccount } from '@/lib/context';

const STUDENT_ROLES: Role[] = ['student', 'parent'];

export function StudentLoginPage({ onBack }: { onBack: () => void }) {
  const { devLogin } = useApp();
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!accessCode.trim()) {
        throw new Error('School Access Code is required.');
      }

      // Verify the access code belongs to an approved school
      const { data: school, error: schoolErr } = await supabase
        .from('schools')
        .select('id, name')
        .eq('access_code', accessCode.toUpperCase())
        .eq('status', 'approved')
        .maybeSingle();
      if (schoolErr || !school) {
        throw new Error('Invalid or unapproved School Access Code.');
      }

      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error('Invalid email/username or password.');
      if (!authData.user) throw new Error('Authentication failed.');

      // Verify the user is a student or parent in the matching school
      const { data: prof } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (!prof) {
        await supabase.auth.signOut();
        throw new Error('No profile found for this account.');
      }

      const role = (prof as { role: Role }).role;
      if (!STUDENT_ROLES.includes(role)) {
        await supabase.auth.signOut();
        throw new Error('This portal is for students and parents only. Staff must use the Staff & Admin portal.');
      }

      const profSchoolId = (prof as { school_id: string }).school_id;
      if (profSchoolId !== (school as { id: string }).id) {
        await supabase.auth.signOut();
        throw new Error('Your account does not belong to the school matching this access code.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 relative overflow-hidden">
      <DevModeBar onLogin={(acc: DevDemoAccount) => devLogin(acc)} />
      <div className="flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <button onClick={onBack} className="btn-ghost text-ink-500 mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="card shadow-card p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm mb-3">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Student & Parent Portal</h1>
            <p className="text-sm text-ink-500 mt-1">For Students and Parents</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">School Access Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-10 uppercase" required value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="SCH-XXXX" />
              </div>
              <p className="text-xs text-ink-400 mt-1">Enter the code your school received upon approval.</p>
            </div>

            <div>
              <label className="label">Email or Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.edu" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input className="input pl-10" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-error-600 bg-error-50 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
              {loading ? <Spinner /> : <LogIn className="w-4 h-4" />} Sign In
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-ink-50 border border-ink-100 p-3 text-xs text-ink-500 space-y-1">
            <p className="font-semibold text-ink-600">Student/Parent demo credentials:</p>
            <p>Student: aarav.rao@student.edu / demo1234 · Code: SCH-BE53</p>
            <p>Parent: sunita.rao@example.com / demo1234 · Code: SCH-BE53</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
