import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Flame,
  Loader2,
  Trophy,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

const DIFFICULTY_STYLES = {
  beginner: {
    ring: 'ring-emerald-400/30',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    bar: 'from-emerald-400 to-emerald-500'
  },
  intermediate: {
    ring: 'ring-amber-400/30',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    bar: 'from-amber-400 to-orange-500'
  },
  advanced: {
    ring: 'ring-rose-400/30',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    bar: 'from-rose-400 to-pink-500'
  }
};

const SkillQuizzes = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getQuizSkills();
      if (response?.success) {
        setSkills(response.data || []);
      }
    } catch (err) {
      console.error('Load skills error:', err);
      setError(err.message || 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (skillName) => {
    try {
      setGenerating(true);
      setError('');
      setResult(null);
      setSelectedAnswers({});
      setCurrentQ(0);

      const response = await api.generateQuiz(skillName);

      if (response?.success && response?.data) {
        setActiveQuiz(response.data);
      } else {
        throw new Error('Invalid response from quiz API');
      }
    } catch (err) {
      console.error('Generate quiz error:', err);
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const selectAnswer = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    const answers = activeQuiz.questions.map((_, index) =>
      selectedAnswers[index] !== undefined ? selectedAnswers[index] : -1
    );

    try {
      setSubmitting(true);
      setError('');

      const response = await api.submitQuiz({
        quiz_session_id: activeQuiz.quiz_session_id,
        answers
      });

      if (response?.success && response?.data) {
        setResult(response.data);
      } else {
        throw new Error('Invalid response from submit API');
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const backToSkills = () => {
    setActiveQuiz(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentQ(0);
    loadSkills();
  };

  // ============================================================
  // RESULT VIEW — score ring + review timeline
  // ============================================================
  if (result) {
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (result.score / 100) * circumference;

    return (
      <div className="min-h-full p-4 md:p-10 bg-[#05060f]">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-40 h-40 -rotate-90">
                <circle cx="80" cy="80" r="54" stroke="#1e2749" strokeWidth="10" fill="none" />
                <circle
                  cx="80" cy="80" r="54"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{result.score}%</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">score</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{result.skill_name}</h2>
            <p className="text-sm text-white/40 capitalize mb-3">{result.difficulty} level · {result.correct_count}/{result.total_questions} correct</p>

            {result.leveled_up && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-400/30">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-white">Level unlocked for next attempt!</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-10">
            {result.review.map((item, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-5 ${
                  item.is_correct
                    ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                    : 'border-rose-500/20 bg-rose-500/[0.04]'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    item.is_correct ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                    {item.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white/90 pt-0.5">{item.question}</p>
                </div>

                <div className="ml-9 space-y-1.5 mb-3">
                  {item.options.map((opt, optIndex) => {
                    let cls = 'text-white/30';
                    if (optIndex === item.correct_index) cls = 'text-emerald-400 font-medium';
                    else if (optIndex === item.selected_index) cls = 'text-rose-400 line-through';
                    return (
                      <p key={optIndex} className={`text-xs ${cls}`}>{opt}</p>
                    );
                  })}
                </div>

                <p className="ml-9 text-xs text-white/35 italic border-l-2 border-white/10 pl-3">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={backToSkills}
            className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90 text-white py-3.5 rounded-2xl font-semibold transition-all"
          >
            Back to Skills
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE QUIZ VIEW — one question at a time, progress bar
  // ============================================================
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQ];
    const total = activeQuiz.questions.length;
    const isLast = currentQ === total - 1;
    const style = DIFFICULTY_STYLES[activeQuiz.difficulty] || DIFFICULTY_STYLES.beginner;
    const answered = selectedAnswers[currentQ] !== undefined;
    const allAnswered = activeQuiz.questions.every((_, i) => selectedAnswers[i] !== undefined);

    return (
      <div className="min-h-full p-4 md:p-10 bg-[#05060f]">
        <div className="max-w-2xl mx-auto">

          <button
            onClick={backToSkills}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit quiz
          </button>

          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
              {activeQuiz.difficulty}
            </span>
            <span className="text-xs text-white/40 font-medium">
              {currentQ + 1} / {total}
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-8">
            <div
              className={`h-full bg-gradient-to-r ${style.bar} rounded-full transition-all duration-300`}
              style={{ width: `${((currentQ + 1) / total) * 100}%` }}
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">{activeQuiz.skill_name}</h2>
            <p className="text-lg text-white/70 mt-6 leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-3 mb-10">
            {q.options.map((opt, optIndex) => {
              const isSelected = selectedAnswers[currentQ] === optIndex;
              return (
                <button
                  key={optIndex}
                  onClick={() => selectAnswer(currentQ, optIndex)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-violet-400 bg-violet-500/10 text-white'
                      : 'border-white/[0.08] text-white/60 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'border-violet-400 bg-violet-400 text-black' : 'border-white/20 text-white/40'
                  }`}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ((c) => c - 1)}
                className="px-6 py-3.5 rounded-2xl border border-white/10 text-white/60 font-semibold hover:bg-white/[0.03] transition-all"
              >
                Back
              </button>
            )}

            {isLast ? (
              <button
                onClick={submitQuiz}
                disabled={!allAnswered || submitting}
                className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Finish Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ((c) => c + 1)}
                disabled={!answered}
                className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white py-3.5 rounded-2xl font-semibold transition-all"
              >
                Next
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // SKILL LIST VIEW — game-tile grid
  // ============================================================
  return (
    <div className="min-h-full p-4 md:p-10 bg-[#05060f]">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Skill Quizzes</h1>
        </div>
        <p className="text-white/40 mb-10 ml-[52px]">
          Score 80%+ to level up — beginner → intermediate → advanced.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">
              No roadmap found. Complete career discovery first to unlock skill quizzes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => {
              const style = DIFFICULTY_STYLES[skill.next_difficulty] || DIFFICULTY_STYLES.beginner;
              return (
                <div
                  key={skill.skill_name}
                  className={`group relative rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-6 ring-1 ${style.ring} hover:border-white/20 transition-all`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${style.bg}`}>
                      <Brain className={`w-5 h-5 ${style.text}`} />
                    </div>
                    {skill.attempts > 0 && (
                      <div className="flex items-center gap-1 text-white/30 text-xs">
                        <Flame className="w-3.5 h-3.5" />
                        {skill.attempts}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{skill.skill_name}</h3>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${style.text}`}>
                    {skill.next_difficulty}
                  </p>

                  {skill.best_score !== null ? (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                        <span>Best score</span>
                        <span className="text-white/70 font-semibold">{skill.best_score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full bg-gradient-to-r ${style.bar} rounded-full`}
                          style={{ width: `${skill.best_score}%` }}
                        />
                      </div>
                      {skill.recent_attempted_at && (
                        <div className="flex items-center justify-between text-[11px] text-white/30">
                          <span>
                            Last attempt: {new Date(skill.recent_attempted_at).toLocaleDateString()}
                          </span>
                          <span className="text-white/50 font-medium capitalize">
                            {skill.recent_score}% · {skill.recent_difficulty}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 mb-5">Not attempted yet</p>
                  )}

                  <button
                    onClick={() => startQuiz(skill.skill_name)}
                    disabled={generating}
                    className="w-full bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-cyan-500 disabled:opacity-40 text-white py-2.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    {generating ? 'Generating...' : skill.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && skills.length > 0 && (
          <div className="mt-10 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent p-7">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
                Tips to score 80%+
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Read each question fully before picking an option — some answers look right but miss a key detail.',
                'Focus on core concepts first; beginner questions test definitions and basic usage.',
                'Retake a quiz if you score below 80% — it stays at the same difficulty so you can practice more.',
                'Once you clear 80%, the next attempt automatically steps up in difficulty.'
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl bg-white/[0.02] p-4">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-xs text-white/50 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SkillQuizzes;