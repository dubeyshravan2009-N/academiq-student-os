import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import { CheckCircle2, Building2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RegisterSchoolModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('free');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('schools').insert({
      name,
      principal_email: principalEmail,
      phone,
      address,
      status: 'pending',
      subscription_plan: plan,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  function reset() {
    setName('');
    setPrincipalEmail('');
    setPhone('');
    setAddress('');
    setPlan('free');
    setDone(false);
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Register a School" subtitle="Join the AcademiQ network. Applications are reviewed by our Super Admin.">
      {done ? (
        <div className="flex flex-col items-center text-center py-6 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-display text-lg font-bold text-ink-900">Application submitted</h4>
          <p className="text-sm text-ink-500 mt-1 max-w-sm">
            Your school application has been submitted. Upon Super Admin approval, your unique School Access Code and setup link will be generated.
          </p>
          <button className="btn-primary mt-5" onClick={close}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">School name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greenwood High" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Principal email</label>
              <input className="input" type="email" required value={principalEmail} onChange={(e) => setPrincipalEmail(e.target.value)} placeholder="principal@school.edu" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-90000…" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="School street address" />
          </div>
          <div>
            <label className="label">Subscription plan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['free', 'pro', 'enterprise'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all ${
                    plan === p
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-error-600">{error}</p>}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-ink-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Status: Pending approval
            </p>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner />} Submit application
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
