import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { MockTask, MockHabit } from '@/data/mockData';

interface Msg { role: 'ai' | 'user'; text: string; }

function generateReply(input: string, ctx: { tasks: MockTask[]; habits: MockHabit[] }): string {
  const lower = input.toLowerCase();
  const pending = ctx.tasks.filter((t) => !t.is_completed);
  const topStreak = [...ctx.habits].sort((a, b) => b.streak_count - a.streak_count)[0];

  if (lower.includes('progress') || lower.includes('how am i')) {
    return `You have ${pending.length} task${pending.length === 1 ? '' : 's'} pending${
      topStreak ? ` and your top habit streak is "${topStreak.title}" at ${topStreak.streak_count} days` : ''
    }. Keep the momentum going!`;
  }
  if (lower.includes('study') || lower.includes('help')) {
    return `Here's a plan: pick your highest-priority pending task, set a 25-minute focus timer, and knock it out. ${
      pending[0] ? `I suggest starting with "${pending[0].title}".` : "You're all caught up — great work!"
    }`;
  }
  if (lower.includes('habit')) {
    return topStreak
      ? `Your strongest habit is "${topStreak.title}" with a ${topStreak.streak_count}-day streak. Consistency compounds — protect that streak today!`
      : `Start with one small habit you can do daily. Even 5 minutes counts. Build the streak first, expand later.`;
  }
  if (lower.includes('goal')) {
    return `Break your long-term goal into this week's short-term goal, then into today's tasks. Small daily wins compound into big outcomes.`;
  }
  return `I'm your AI mentor. I can help with study planning, progress reviews, and habit coaching. Ask me "how am I doing?" or "help me study".`;
}

export function AIMentorDrawer({ tasks, habits }: { tasks: MockTask[]; habits: MockHabit[] }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', text: "Hey! I'm your AI Mentor. Ask me about your progress, study plans, or habits." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }]);
    setTyping(true);
    setTimeout(() => {
      const reply = generateReply(text, { tasks, habits });
      setMsgs((m) => [...m, { role: 'ai', text: reply }]);
      setTyping(false);
    }, 700);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 text-white px-4 py-3 shadow-card font-semibold text-sm transition-all hover:scale-105 ${open ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="w-5 h-5" />
        AI Mentor
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm h-full bg-white shadow-card flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-ink-100 bg-gradient-to-r from-brand-600 to-accent-600">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold">AI Mentor</p>
                  <p className="text-[11px] text-white/80">Study guidance & progress</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/90 hover:bg-white/15" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50/50">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'}`}>
                    {m.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'ai' ? 'bg-white border border-ink-100 text-ink-800' : 'bg-brand-600 text-white'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                  <div className="rounded-2xl px-4 py-3 bg-white border border-ink-100">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse-soft" />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-ink-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Ask your mentor…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <button className="btn-primary p-2.5" onClick={send} aria-label="Send">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['How am I doing?', 'Help me study', 'My habits'].map((q) => (
                  <button key={q} onClick={() => { setInput(q); }} className="chip hover:bg-brand-50 hover:text-brand-700 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
