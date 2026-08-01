import { useState } from 'react';
import {
  Briefcase,
  Code2,
  BarChart3,
  Landmark,
  Palette,
  Stethoscope,
  Microscope,
  Rocket,
  GraduationCap,
  TrendingUp,
  PenLine,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { careerQuestions, careerPaths, recommendCareers, CareerPath } from '@/lib/careerData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  BarChart3,
  Landmark,
  Palette,
  Stethoscope,
  Microscope,
  Rocket,
  GraduationCap,
  TrendingUp,
  PenLine,
};

interface CareerEngineProps {
  onAdoptGoal: (title: string, description: string) => void;
  adoptedGoals: string[];
}

// Main Career Engine — lets students discover careers via a questionnaire, then adopt matching careers as long-term goals
export function CareerEngine({ onAdoptGoal, adoptedGoals }: CareerEngineProps) {
  const [step, setStep] = useState<'questionnaire' | 'results'>('questionnaire');
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);

  // Toggles a questionnaire option on/off for a given question
  function toggleSelection(qid: string, optionLabel: string, tags: string[]) {
    setSelections((prev) => {
      const current = prev[qid] || [];
      const exists = current.includes(optionLabel);
      const updated = exists
        ? current.filter((s) => s !== optionLabel)
        : [...current, optionLabel];
      return { ...prev, [qid]: updated };
    });
  }

  // Checks if a specific option is currently selected for a question
  function isOptionSelected(qid: string, optionLabel: string): boolean {
    return (selections[qid] || []).includes(optionLabel);
  }

  // Counts total selections across all questions (for the submit button)
  function getTotalSelections(): number {
    return Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);
  }

  // Moves to the results step and calculates career recommendations
  function handleSubmit() {
    setStep('results');
    setExpandedCareer(null);
  }

  // Clears all selections and returns to the questionnaire step
  function handleReset() {
    setSelections({});
    setStep('questionnaire');
    setExpandedCareer(null);
  }

  const recommendations = step === 'results' ? recommendCareers(selections) : [];

  if (step === 'results') {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="card p-5 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-ink-900">Your Career Matches</h3>
              </div>
              <p className="text-sm text-ink-600">
                Based on your interests, we found {recommendations.length} career paths that align with your profile.
              </p>
            </div>
            <button className="btn-secondary" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-500">No matches found. Try selecting more options in the questionnaire.</p>
            <button className="btn-primary mt-4" onClick={handleReset}>Retake Questionnaire</button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(({ career, matchScore }, idx) => (
              <CareerCard
                key={career.id}
                career={career}
                rank={idx + 1}
                matchScore={matchScore}
                isExpanded={expandedCareer === career.id}
                onToggle={() => setExpandedCareer(expandedCareer === career.id ? null : career.id)}
                onAdopt={() => onAdoptGoal(
                  `Pursue a career as a ${career.title}`,
                  `Long-term career goal: ${career.tagline} Focus on ${career.roadmap.skills.slice(0, 3).map(s => s.name).join(', ')}.`
                )}
                isAdopted={adoptedGoals.includes(career.title)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-5 bg-gradient-to-br from-accent-50 to-brand-50 border-accent-100">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-accent-600" />
          <h3 className="font-display text-lg font-bold text-ink-900">Career Discovery Questionnaire</h3>
        </div>
        <p className="text-sm text-ink-600">
          Select your top interests, hobbies, favorite subjects, and preferred work style. We'll match you with career paths that fit your profile.
        </p>
      </div>

      {careerQuestions.map((q, qi) => (
        <div key={q.id} className="card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-display text-sm font-bold shrink-0">
              {qi + 1}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{q.category}</p>
              <h4 className="text-sm font-bold text-ink-900">{q.question}</h4>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {q.options.map((opt) => {
              const selected = isOptionSelected(q.id, opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => toggleSelection(q.id, opt.label, opt.tags)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${selected ? 'text-brand-800' : 'text-ink-700'}`}>
                      {opt.label}
                    </span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-ink-500">
          {getTotalSelections()} selection{getTotalSelections() !== 1 ? 's' : ''} made
        </p>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={getTotalSelections() === 0}
        >
          Get Recommendations <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CareerCard({
  career,
  rank,
  matchScore,
  isExpanded,
  onToggle,
  onAdopt,
  isAdopted,
}: {
  career: CareerPath;
  rank: number;
  matchScore: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAdopt: () => void;
  isAdopted: boolean;
}) {
  const Icon = iconMap[career.icon] || Briefcase;
  const skillCategoryColors: Record<string, string> = {
    technical: 'bg-brand-50 text-brand-700 border-brand-100',
    soft: 'bg-accent-50 text-accent-700 border-accent-100',
    domain: 'bg-warning-50 text-warning-700 border-warning-100',
  };

  return (
    <div className="card overflow-hidden transition-all">
      <button onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-brand-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip bg-brand-100 text-brand-700 font-bold">#{rank} Match</span>
              <span className="chip">
                <Trophy className="w-3 h-3 text-warning-500" />
                {matchScore} pts
              </span>
            </div>
            <h4 className="font-display text-lg font-bold text-ink-900">{career.title}</h4>
            <p className="text-sm text-ink-500 mt-0.5">{career.tagline}</p>
            <div className="flex items-center gap-4 mt-2.5 text-xs text-ink-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {career.avgSalary}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> {career.growthRate}
              </span>
            </div>
          </div>
          <div className="shrink-0 pt-1">
            {isExpanded ? <ChevronUp className="w-5 h-5 text-ink-400" /> : <ChevronDown className="w-5 h-5 text-ink-400" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-ink-100 p-5 space-y-5 animate-slide-up">
          {/* Overview */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Overview</h5>
            <p className="text-sm text-ink-700 leading-relaxed">{career.roadmap.overview}</p>
          </div>

          {/* How to stand out */}
          <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4">
            <h5 className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> How to Stand Out
            </h5>
            <p className="text-sm text-ink-700 leading-relaxed">{career.roadmap.standOut}</p>
          </div>

          {/* Core Skills */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Required Core Skillsets</h5>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {career.roadmap.skills.map((skill) => (
                <div key={skill.name} className={`rounded-xl border p-3 ${skillCategoryColors[skill.category]}`}>
                  <p className="text-sm font-bold">{skill.name}</p>
                  <p className="text-xs mt-0.5 opacity-80">{skill.description}</p>
                  <span className="badge bg-white/60 mt-2 text-[10px] capitalize">{skill.category} skill</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Exam Roadmap */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Education & Exam Roadmap</h5>
            <div className="space-y-3">
              {career.roadmap.roadmap.map((phase, pi) => (
                <div key={pi} className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {pi + 1}
                  </div>
                  {pi < career.roadmap.roadmap.length - 1 && (
                    <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-ink-200" />
                  )}
                  <div className="pb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">{phase.phase}</p>
                    <p className="text-sm font-bold text-ink-900 mt-0.5">{phase.title}</p>
                    <ul className="mt-2 space-y-1.5">
                      {phase.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-sm text-ink-600">
                          <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adopt Goal Button */}
          <div className="pt-2 border-t border-ink-100">
            {isAdopted ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5" />
                Adopted as a Long-Term Goal! View it in your Goal Tracker.
              </div>
            ) : (
              <button className="btn-primary w-full" onClick={onAdopt}>
                <Target className="w-4 h-4" /> Adopt as Long-Term Goal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
