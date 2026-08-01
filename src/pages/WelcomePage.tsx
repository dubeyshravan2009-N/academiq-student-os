import { GraduationCap, Users, Presentation, Building2, Sparkles, Target, TrendingUp, Brain, ArrowRight, CheckCircle2, Mail, ShieldCheck, Building } from 'lucide-react';

const pillars = [
  { icon: <Building2 className="w-5 h-5" />, label: 'Schools', desc: 'Manage teachers, students & classes.' },
  { icon: <Presentation className="w-5 h-5" />, label: 'Teachers', desc: 'Track attendance & enter marks.' },
  { icon: <Users className="w-5 h-5" />, label: 'Parents', desc: 'Real-time visibility into progress.' },
  { icon: <Brain className="w-5 h-5" />, label: 'AI Mentor', desc: 'Guides students toward their goals.' },
];

const features = [
  { icon: <Target className="w-5 h-5" />, title: 'Goal Cascade', desc: 'Long-term dreams break down into mid-term milestones, short-term goals, and daily tasks — so students always know their next step.' },
  { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Habit System', desc: 'Interactive habit checklists build streaks and log completion automatically, turning consistency into a game students win.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Attendance Intelligence', desc: 'Visual calendars show present/absent ratios at a glance — for students, parents, teachers, and school admins.' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'AI Mentor Drawer', desc: 'A floating AI mentor offers study guidance and progress nudges, right where the student works.' },
];

interface WelcomePageProps {
  onStaffLogin: () => void;
  onStudentLogin: () => void;
  onRegisterSchool: () => void;
}

export function WelcomePage({ onStaffLogin, onStudentLogin, onRegisterSchool }: WelcomePageProps) {
  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent-200/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 animate-slide-up">
              <Sparkles className="w-3.5 h-3.5" />
              The Student Development Operating System
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink-900 text-balance leading-[1.05] animate-slide-up">
              One OS for every{' '}
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">student's growth</span>.
            </h1>
            <p className="mt-6 text-lg text-ink-600 max-w-2xl leading-relaxed animate-slide-up">
              AcademiQ connects <span className="font-semibold text-ink-800">Schools, Teachers, Parents, and AI</span> into a single
              platform that turns goals into daily action, attendance into insight, and progress into a shared conversation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-slide-up">
              <button className="btn-primary text-base px-5 py-3" onClick={onStudentLogin}>
                Student & Parent Login <ArrowRight className="w-4 h-4" />
              </button>
              <button className="btn-secondary text-base px-5 py-3" onClick={onStaffLogin}>
                <ShieldCheck className="w-4 h-4" /> Staff & Admin Login
              </button>
              <button className="btn-ghost text-base px-5 py-3" onClick={onRegisterSchool}>
                <Building className="w-4 h-4" /> Register School
              </button>
            </div>
          </div>

          {/* Pillars */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {pillars.map((p, i) => (
              <div key={p.label} className="card-hover p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">{p.icon}</div>
                <p className="font-display font-bold text-ink-900">{p.label}</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="mission" className="relative py-20 sm:py-24 bg-white border-y border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Our Mission</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900 text-balance">
              Make holistic student development measurable and collaborative.
            </h2>
            <p className="mt-4 text-ink-600 leading-relaxed">
              Every student deserves more than a report card. AcademiQ gives schools a structured way to track goals, habits,
              attendance, and marks — while keeping parents in the loop and AI as a always-on mentor.
            </p>
            <div className="mt-6 space-y-2.5">
              {['Goal-driven daily tasks', 'Streak-based habit building', 'Real-time parent visibility'].map((t) => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-brand-600 shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600">Our Vision</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900 text-balance">
              A connected ecosystem where no student's potential goes unseen.
            </h2>
            <p className="mt-4 text-ink-600 leading-relaxed">
              We envision a world where teachers, parents, and AI work in concert — each playing their part — so that a
              student in any classroom, anywhere, has the support network they need to grow into their full potential.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {pillars.map((p) => (
                <div key={p.label} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
                  <div className="flex items-center gap-2 text-brand-700">{p.icon}<span className="text-sm font-semibold text-ink-800">{p.label}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">What's inside</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-900 text-balance">
              Five role-based dashboards. One connected OS.
            </h2>
            <p className="mt-3 text-ink-600">Five role-based dashboards. One connected OS — secured by password authentication and school access codes.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className="card-hover p-5 animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center mb-4 shadow-sm">{f.icon}</div>
                <h3 className="font-display font-bold text-ink-900">{f.title}</h3>
                <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section id="founder" className="relative py-20 sm:py-24 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-glow animate-float">
                  <GraduationCap className="w-20 h-20 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 badge bg-white text-ink-800 shadow-card">
                  <Sparkles className="w-3 h-3 text-brand-600" /> Founder
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Founder & Visionary</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold text-white">Shravan Dubey</h2>
              <p className="mt-3 text-ink-300 leading-relaxed max-w-xl">
                Shravan founded AcademiQ with a single belief: student development should be an operating system, not a
                pile of disconnected reports. His vision connects schools, teachers, parents, and AI into one living
                platform that grows with every student.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a href="mailto:dubeyshravan2009@gmail.com" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
                  <Mail className="w-4 h-4" /> dubeyshravan2009@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="font-display font-extrabold text-ink-900">AcademiQ</p>
              <p className="text-xs text-ink-400">Student Development OS</p>
            </div>
          </div>
          <p className="text-xs text-ink-400">Founded by Shravan Dubey · Built for holistic student growth.</p>
        </div>
      </footer>

    </div>
  );
}
