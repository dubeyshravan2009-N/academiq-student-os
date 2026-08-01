import { useState } from 'react';
import { GraduationCap, LogIn, Mail, Lock, KeyRound, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import { Role } from '@/lib/types';
import { DevModeBar } from '@/components/DevModeBar';
import { useApp, DevDemoAccount } from '@/lib/context';

const STAFF_ROLES: Role[] = ['super_admin', 'school_admin', 'teacher'];

export function StaffLoginPage({ onBack }: { onBack: () => void }) {
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
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error('Invalid email or password.');
      if (!authData.user) throw new Error('Authentication failed.');

      // Fetch the user's profile to check role + school
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
      if (!STAFF_ROLES.includes(role)) {
        await supabase.auth.signOut();
        throw new Error('This portal is for staff and admins only. Students and parents must use the Student & Parent portal.');
      }

      // Super admin can bypass access code (uses Master Admin Key)
      if (role !== 'super_admin') {
        if (!accessCode.trim()) {
          await supabase.auth.signOut();
          throw new Error('School Access Code is required for staff and school admin login.');
        }
        const schoolId = (prof as { school_id: string }).school_id;
        const { data: school } = await supabase
          .from('schools')
          .select('access_code, status')
          .eq('id', schoolId)
          .maybeSingle();
        if (!school || (school as { access_code: string | null }).access_code !== accessCode.toUpperCase()) {
          await supabase.auth.signOut();
          throw new Error('Invalid School Access Code for your school.');
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">
      <DevModeBar onLogin={(acc: DevDemoAccount) => devLogin(acc)} />
      <div className="flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative w-full max-w-md">
        <button onClick={onBack} className="btn-ghost text-ink-400 hover:text-white mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="card shadow-card p-7 bg-ink-900 border-ink-800">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm mb-3">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white">Staff & Admin Portal</h1>
            <p className="text-sm text-ink-400 mt-1">For Super Admins, School Admins, and Teachers</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label text-ink-300">School Access Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-10 uppercase bg-ink-800 border-ink-700 text-white placeholder-ink-500" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="SCH-XXXX" />
              </div>
              <p className="text-xs text-ink-500 mt-1">Super Admins can leave this blank (Master Admin Key not required for login).</p>
            </div>

            <div>
              <label className="label text-ink-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-10 bg-ink-800 border-ink-700 text-white placeholder-ink-500" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
              </div>
            </div>

            <div>
              <label className="label text-ink-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-10 bg-ink-800 border-ink-700 text-white placeholder-ink-500" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-error-400 bg-error-500/10 border border-error-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
              {loading ? <Spinner /> : <LogIn className="w-4 h-4" />} Sign In to Staff Portal
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-ink-800/50 border border-ink-700 p-3 text-xs text-ink-500 space-y-1">
            <p className="font-semibold text-ink-400">Staff demo credentials:</p>
            <p>Teacher: anjali@greenwood.edu / demo1234 · Code: SCH-BE53</p>
            <p>School Admin: vikram@greenwood.edu / demo1234 · Code: SCH-BE53</p>
            <p>Super Admin: dubeyshravan2009@gmail.com / super1234</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
