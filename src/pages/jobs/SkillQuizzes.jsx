import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Flame,
  Loader2,
  Trophy,
  Sparkles,
  ArrowLeft,
  Target,
  Zap,
  Award
} from 'lucide-react';
import api from '../../services/api';

const DIFFICULTY_STYLES = {
  beginner: {
    ring: 'ring-[#78927A]/30',
    text: 'text-[#173B32]',
    bg: 'bg-[#78927A]/20',
    bar: 'bg-[#78927A]',
    emoji: '🌱'
  },
  intermediate: {
    ring: 'ring-[#E4B84A]/40',
    text: 'text-[#173B32]',
    bg: 'bg-[#E4B84A]/25',
    bar: 'bg-[#E4B84A]',
    emoji: '🔥'
  },
  advanced: {
    ring: 'ring-[#D66A4A]/30',
    text: 'text-[#B94F35]',
    bg: 'bg-[#D66A4A]/10',
    bar: 'bg-[#D66A4A]',
    emoji: '🚀'
  }
};

const SKILL_EMOJIS = [
  ['python', '🐍'],
  ['javascript', '🟨'],
  ['react', '⚛️'],
  ['node', '🟩'],
  ['sql', '🗄️'],
  ['html', '🌐'],
  ['css', '🎨'],
  ['docker', '🐳'],
  ['kubernetes', '☸️'],
  ['aws', '☁️'],
  ['cloud', '☁️'],
  ['linux', '🐧'],
  ['git', '🔀'],
  ['excel', '📊'],
  ['statistic', '📈'],
  ['visual', '📉'],
  ['machine', '🤖'],
  ['deep', '🧬'],
  ['figma', '🎯'],
  ['design', '✏️'],
  ['api', '🔌'],
  ['communication', '💬'],
  ['problem', '🧩'],
  ['agile', '🔄'],
  ['research', '🔍']
];

const getSkillEmoji = (name = '') => {
  const lower = name.toLowerCase();
  const match = SKILL_EMOJIS.find(([key]) => lower.includes(key));
  return match ? match[1] : '🧠';
};

const getScoreEmoji = (score) => {
  if (score >= 80) return '🏆';
  if (score >= 50) return '👏';
  return '💪';
};

/* Full-page wrapper: covers the whole screen with ivory */
const Page = ({ children }) => (
  <div className="relative min-h-screen w-full bg-[#F6F1E8] text-[#173B32]">
    <div className="pointer-events-none fixed inset-0 bg-[#F6F1E8]" />
    <div className="relative z-10 min-h-screen p-4 md:p-10">{children}</div>
  </div>
);

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
      <Page>
        <div className="max-w-3xl mx-auto">

          <div className="rounded-2xl bg-[#173B32] p-8 mb-8 text-center shadow-[0_6px_20px_rgba(23,59,50,0.18)]">
            <div className="text-5xl mb-4">{getScoreEmoji(result.score)}</div>

            <div className="relative w-40 h-40 mx-auto mb-5">
              <svg className="w-40 h-40 -rotate-90">
                <circle cx="80" cy="80" r="54" stroke="#F6F1E8" strokeOpacity="0.15" strokeWidth="10" fill="none" />
                <circle
                  cx="80" cy="80" r="54"
                  stroke="#E4B84A"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#F6F1E8]">{result.score}%</span>
                <span className="text-[10px] uppercase tracking-widest text-[#F6F1E8]/60">score</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#F6F1E8] mb-1">
              {getSkillEmoji(result.skill_name)} {result.skill_name}
            </h2>
            <p className="text-sm text-[#F6F1E8]/70 capitalize mb-3">
              {result.difficulty} level · {result.correct_count}/{result.total_questions} correct
            </p>

            {result.leveled_up && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4B84A]/20 border border-[#E4B84A]/50">
                <Trophy className="w-4 h-4 text-[#E4B84A]" />
                <span className="text-xs font-semibold text-[#E4B84A]">🎉 Level unlocked for next attempt!</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A948D] mb-4">
            📝 Answer Review
          </h3>

          <div className="space-y-3 mb-10">
            {result.review.map((item, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-5 bg-[#FFFDF8] shadow-[0_1px_4px_rgba(23,59,50,0.06)] ${
                  item.is_correct
                    ? 'border-[#78927A]/50'
                    : 'border-[#D66A4A]/40'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    item.is_correct ? 'bg-[#78927A]/20' : 'bg-[#B94F35]/10'
                  }`}>
                    {item.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-[#78927A]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#B94F35]" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#173B32] pt-0.5">{item.question}</p>
                </div>

                <div className="ml-9 space-y-1.5 mb-3">
                  {item.options.map((opt, optIndex) => {
                    let cls = 'text-[#8A948D]';
                    if (optIndex === item.correct_index) cls = 'text-[#173B32] font-semibold';
                    else if (optIndex === item.selected_index) cls = 'text-[#B94F35] line-through';
                    return (
                      <p key={optIndex} className={`text-xs ${cls}`}>{opt}</p>
                    );
                  })}
                </div>

                <p className="ml-9 text-xs text-[#66736B] italic border-l-2 border-[#DED8CC] pl-3">
                  💡 {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={backToSkills}
            className="w-full bg-[#D66A4A] hover:bg-[#C45C3D] text-[#FFFDF8] py-3.5 rounded-xl font-semibold transition-colors shadow-[0_2px_8px_rgba(214,106,74,0.25)]"
          >
            Back to Skills
          </button>

        </div>
      </Page>
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
      <Page>
        <div className="max-w-2xl mx-auto">

          <button
            onClick={backToSkills}
            className="flex items-center gap-2 text-[#66736B] hover:text-[#173B32] text-xs font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit quiz
          </button>

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 md:p-8 shadow-[0_2px_10px_rgba(23,59,50,0.07)]">

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                {style.emoji} {activeQuiz.difficulty}
              </span>
              <span className="text-xs text-[#66736B] font-medium">
                Question {currentQ + 1} / {total}
              </span>
            </div>

            <div className="w-full h-2 bg-[#DED8CC] rounded-full overflow-hidden mb-8">
              <div
                className={`h-full ${style.bar} rounded-full transition-all duration-300`}
                style={{ width: `${((currentQ + 1) / total) * 100}%` }}
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-[#B94F35]/10 border border-[#B94F35]/30 rounded-xl">
                <p className="text-sm text-[#B94F35]">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getSkillEmoji(activeQuiz.skill_name)}</span>
                <h2 className="text-2xl font-bold text-[#173B32]">{activeQuiz.skill_name}</h2>
              </div>
              <p className="text-lg text-[#173B32] mt-6 leading-relaxed">{q.question}</p>
            </div>

            <div className="space-y-3 mb-10">
              {q.options.map((opt, optIndex) => {
                const isSelected = selectedAnswers[currentQ] === optIndex;
                return (
                  <button
                    key={optIndex}
                    onClick={() => selectAnswer(currentQ, optIndex)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#173B32] bg-[#173B32]/5 text-[#173B32]'
                        : 'border-[#DED8CC] bg-[#FFFDF8] text-[#66736B] hover:border-[#78927A] hover:bg-[#F6F1E8]/60'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'border-[#D66A4A] bg-[#D66A4A] text-[#FFFDF8]' : 'border-[#DED8CC] text-[#8A948D]'
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
                  className="px-6 py-3.5 rounded-xl border border-[#173B32] bg-[#FFFDF8] text-[#173B32] font-semibold hover:bg-[#173B32]/5 transition-colors"
                >
                  Back
                </button>
              )}

              {isLast ? (
                <button
                  onClick={submitQuiz}
                  disabled={!allAnswered || submitting}
                  className="flex-1 bg-[#D66A4A] hover:bg-[#C45C3D] disabled:opacity-40 text-[#FFFDF8] py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Submitting...' : '🏁 Finish Quiz'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQ((c) => c + 1)}
                  disabled={!answered}
                  className="flex-1 bg-[#D66A4A] hover:bg-[#C45C3D] disabled:opacity-40 text-[#FFFDF8] py-3.5 rounded-xl font-semibold transition-colors"
                >
                  Next →
                </button>
              )}
            </div>

          </div>

        </div>
      </Page>
    );
  }

  // ============================================================
  // SKILL LIST VIEW
  // ============================================================
  const attemptedCount = skills.filter((s) => s.attempts > 0).length;
  const scoredSkills = skills.filter((s) => s.best_score !== null && s.best_score !== undefined);
  const avgBest = scoredSkills.length
    ? Math.round(scoredSkills.reduce((sum, s) => sum + s.best_score, 0) / scoredSkills.length)
    : 0;

  return (
    <Page>
      <div className="max-w-5xl mx-auto">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-[#173B32] p-6 md:p-9 mb-8 shadow-[0_6px_20px_rgba(23,59,50,0.18)]">

          <span className="pointer-events-none absolute right-6 top-4 text-5xl opacity-20 select-none">🧠</span>
          <span className="pointer-events-none absolute right-28 bottom-3 text-3xl opacity-20 select-none">⚡</span>
          <span className="pointer-events-none absolute right-4 bottom-4 text-4xl opacity-20 select-none">🏆</span>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4B84A]/40 bg-[#E4B84A]/15 px-3 py-1.5 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-[#E4B84A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E4B84A]">
                Practice & Level Up
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-[#F6F1E8] tracking-tight">
              Skill Quizzes <span className="text-[#E4B84A]">🎯</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm md:text-base text-[#F6F1E8]/70">
              Score 80%+ to level up — 🌱 beginner → 🔥 intermediate → 🚀 advanced.
            </p>
          </div>
        </div>

        {/* STATS */}
        {!loading && skills.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-5 shadow-[0_1px_4px_rgba(23,59,50,0.06)] flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A948D] mb-1">Total Skills</p>
                <p className="text-3xl font-bold text-[#173B32]">{skills.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#D66A4A]/10 flex items-center justify-center text-xl">📚</div>
            </div>

            <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-5 shadow-[0_1px_4px_rgba(23,59,50,0.06)] flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A948D] mb-1">Attempted</p>
                <p className="text-3xl font-bold text-[#173B32]">{attemptedCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#E4B84A]/25 flex items-center justify-center text-xl">🔥</div>
            </div>

            <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-5 shadow-[0_1px_4px_rgba(23,59,50,0.06)] flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A948D] mb-1">Avg Best Score</p>
                <p className="text-3xl font-bold text-[#173B32]">{avgBest}%</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#78927A]/20 flex items-center justify-center text-xl">🏆</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-[#B94F35]/10 border border-[#B94F35]/30 rounded-xl">
            <p className="text-sm text-[#B94F35]">{error}</p>
          </div>
        )}

        {loading ? (
          <div>
            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-5xl animate-bounce mb-3">🧠</div>
              <p className="text-sm text-[#66736B]">Loading your skill quizzes...</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#DED8CC] mb-6" />
                  <div className="h-5 w-2/3 rounded bg-[#DED8CC] mb-3" />
                  <div className="h-3 w-1/3 rounded bg-[#DED8CC] mb-6" />
                  <div className="h-10 w-full rounded-xl bg-[#DED8CC]" />
                </div>
              ))}
            </div>
          </div>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#78927A] bg-[#FFFDF8] p-12 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold text-[#173B32] mb-2">No quizzes yet</h3>
            <p className="text-[#66736B] max-w-md mx-auto">
              No roadmap found. Complete career discovery first to unlock skill quizzes.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-[#D66A4A]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#D66A4A]">
                Choose a skill
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill) => {
                const style = DIFFICULTY_STYLES[skill.next_difficulty] || DIFFICULTY_STYLES.beginner;
                return (
                  <div
                    key={skill.skill_name}
                    className={`group relative overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 ring-1 ${style.ring} shadow-[0_1px_4px_rgba(23,59,50,0.06)] hover:shadow-[0_8px_22px_rgba(23,59,50,0.12)] hover:-translate-y-0.5 transition-all`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${style.bg}`}>
                        {getSkillEmoji(skill.skill_name)}
                      </div>
                      {skill.attempts > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-[#D66A4A]/10 px-2.5 py-1 text-xs font-semibold text-[#B94F35]">
                          <Flame className="w-3.5 h-3.5" />
                          {skill.attempts}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#173B32] mb-2">{skill.skill_name}</h3>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${style.bg} ${style.text}`}>
                      {style.emoji} {skill.next_difficulty}
                    </span>

                    {skill.best_score !== null ? (
                      <div className="mb-5">
                        <div className="flex items-center justify-between text-xs text-[#66736B] mb-1.5">
                          <span>Best score</span>
                          <span className="text-[#173B32] font-semibold">{skill.best_score}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#DED8CC] rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full ${style.bar} rounded-full`}
                            style={{ width: `${skill.best_score}%` }}
                          />
                        </div>
                        {skill.recent_attempted_at && (
                          <div className="flex items-center justify-between text-[11px] text-[#8A948D]">
                            <span>
                              Last attempt: {new Date(skill.recent_attempted_at).toLocaleDateString()}
                            </span>
                            <span className="text-[#66736B] font-medium capitalize">
                              {skill.recent_score}% · {skill.recent_difficulty}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A948D] mb-5">✨ Not attempted yet</p>
                    )}

                    <button
                      onClick={() => startQuiz(skill.skill_name)}
                      disabled={generating}
                      className="w-full bg-[#173B32] hover:bg-[#1F4A3F] disabled:opacity-40 text-[#FFFDF8] py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : skill.attempts > 0 ? (
                        '🔁 Retake Quiz'
                      ) : (
                        '▶️ Start Quiz'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && skills.length > 0 && (
          <div className="mt-10 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-7 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-[#E4B84A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#173B32]">
                💡 Tips to score 80%+
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { emoji: '📖', text: 'Read each question fully before picking an option — some answers look right but miss a key detail.' },
                { emoji: '🧱', text: 'Focus on core concepts first; beginner questions test definitions and basic usage.' },
                { emoji: '🔁', text: 'Retake a quiz if you score below 80% — it stays at the same difficulty so you can practice more.' },
                { emoji: '🚀', text: 'Once you clear 80%, the next attempt automatically steps up in difficulty.' }
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl bg-[#F6F1E8]/60 border border-[#DED8CC] p-4">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-[#173B32] flex items-center justify-center text-sm">
                    {tip.emoji}
                  </span>
                  <p className="text-xs text-[#66736B] leading-relaxed pt-1">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Page>
  );
};

export default SkillQuizzes;