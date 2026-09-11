import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Brain,
  Target,
  CircleCheck,
  RotateCcw,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const CareerDiscovery = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(null);

  const questions = [
    {
      id: 'education',
      type: 'select',
      question: 'What is your education level?',
      options: ['High School', 'Diploma', "Bachelor's", "Master's"],
    },
    {
      id: 'experience_level',
      type: 'select',
      question: 'What is your experience level?',
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      id: 'python',
      type: 'skill',
      question: 'Do you have experience with Python programming?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'sql',
      type: 'skill',
      question: 'Do you have experience with SQL / databases?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'excel',
      type: 'skill',
      question: 'Do you have experience with Excel / spreadsheets?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'statistics',
      type: 'skill',
      question: 'Do you have experience with statistics / data math?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'communication',
      type: 'skill',
      question: 'Do you consider communication one of your strengths?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'problem_solving',
      type: 'skill',
      question: 'Do you enjoy solving complex problems?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'web_development',
      type: 'skill',
      question: 'Do you have experience with web development (HTML/CSS/JS)?',
      options: ['Yes, I have experience', 'No, not yet'],
    },
    {
      id: 'data_interest',
      type: 'interest',
      question: 'Are you interested in working with data and analytics?',
      options: ['Yes, very interested', 'Not really'],
    },
    {
      id: 'ai_interest',
      type: 'interest',
      question: 'Are you interested in AI / Machine Learning?',
      options: ['Yes, very interested', 'Not really'],
    },
    {
      id: 'cloud_interest',
      type: 'interest',
      question: 'Are you interested in cloud computing / DevOps?',
      options: ['Yes, very interested', 'Not really'],
    },
    {
      id: 'design_interest',
      type: 'interest',
      question: 'Are you interested in UI/UX design?',
      options: ['Yes, very interested', 'Not really'],
    },
    {
      id: 'environment',
      type: 'bonus',
      question: 'What work environment do you prefer?',
      options: ['Remote', 'Office', 'Hybrid', 'Flexible'],
    },
    {
      id: 'priority',
      type: 'bonus',
      question: 'What is your career priority?',
      options: ['High Salary', 'Work-life Balance', 'Growth', 'Impact'],
    },
    {
      id: 'team_role',
      type: 'bonus',
      question: 'How do you prefer to work?',
      options: ['Independently', 'In a team', 'Leading a team', 'Mix of both'],
    },
    {
      id: 'learning_style',
      type: 'bonus',
      question: 'How do you prefer to learn new skills?',
      options: ['Videos', 'Reading docs', 'Hands-on projects', 'Mentorship'],
    },
  ];

  const handleOptionSelect = (option) => {
    const questionId = questions[step].id;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const getToken = () => {
    return (
      localStorage.getItem('ra_token') ||
      localStorage.getItem('ai-nexus-token') ||
      localStorage.getItem('token') ||
      ''
    );
  };

  const convertEducation = (education) => {
    switch (education) {
      case 'High School':
        return 'high_school';
      case 'Diploma':
        return 'diploma';
      case "Bachelor's":
        return 'bachelors';
      case "Master's":
        return 'masters';
      default:
        return 'bachelors';
    }
  };

  const convertExperience = (level) => {
    switch (level) {
      case 'Beginner':
        return 'beginner';
      case 'Intermediate':
        return 'intermediate';
      case 'Advanced':
        return 'advanced';
      default:
        return 'beginner';
    }
  };

  const isYes = (answer) =>
    answer === 'Yes, I have experience' ||
    answer === 'Yes, very interested';

  const buildSkills = () => {
    const skillQuestions = questions.filter((q) => q.type === 'skill');

    return skillQuestions
      .filter((q) => isYes(answers[q.id]))
      .map((q) => q.id);
  };

  const buildInterests = () => {
    const interestQuestions = questions.filter(
      (q) => q.type === 'interest'
    );

    return interestQuestions
      .filter((q) => isYes(answers[q.id]))
      .map((q) => q.id);
  };

  const predictCareers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        );
      }

      const requestBody = {
        skills: buildSkills(),
        interests: buildInterests(),
        experience_level: convertExperience(answers.experience_level),
        education: convertEducation(answers.education),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/v1/career/predict`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            'Career prediction failed'
        );
      }

      if (!result.success) {
        throw new Error(
          result?.message ||
            'Career recommendations could not be generated'
        );
      }

      setCareers(result.data || []);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const currentQuestion = questions[step];

    if (!answers[currentQuestion.id]) {
      setError('Please select an option before continuing.');
      return;
    }

    setError('');

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await predictCareers();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleTakeAgain = () => {
    setStep(0);
    setAnswers({});
    setCareers([]);
    setShowResults(false);
    setError('');
  };

  const handleSelectCareer = async (careerId) => {
    setSelecting(careerId);
    setError('');

    try {
      const token = getToken();

      const res = await fetch(
        `${API_BASE_URL}/api/v1/career/select/${careerId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        navigate('/my-career');
      } else {
        setError(result.detail || 'Failed to select career');
      }
    } catch (err) {
      setError('Failed to select career');
    } finally {
      setSelecting(null);
    }
  };

  const progress =
    ((step + 1) / questions.length) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-8">

      {/* Ambient Background Glow */}
      <div className="pointer-events-none fixed -left-32 top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />

      {!showResults ? (
        <div className="relative mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">

            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/10">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300/70">
                  Career Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Discover Your{' '}
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Career Path
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40 md:text-base">
                Answer a few questions and let AI identify the career paths
                that best match your skills, interests and goals.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-right backdrop-blur-xl md:block">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Assessment
              </p>

              <p className="mt-1 text-sm font-semibold text-white/70">
                AI Powered
              </p>
            </div>
          </div>

          {/* Progress Panel */}
          <div className="mb-6 rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-300" />

                <span className="text-xs font-medium text-white/50">
                  Question {step + 1} of {questions.length}
                </span>
              </div>

              <span className="text-xs font-bold text-violet-300">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-400 shadow-[0_0_14px_rgba(139,92,246,0.45)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-10">

            {/* Card Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />

            <div className="relative">

              {/* Question Number */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-sm font-bold text-violet-300">
                  {String(step + 1).padStart(2, '0')}
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                    Your Assessment
                  </p>

                  <p className="mt-0.5 text-xs text-white/40">
                    Choose the option that describes you best
                  </p>
                </div>
              </div>

              <h2 className="max-w-3xl text-2xl font-bold leading-tight text-white md:text-3xl">
                {questions[step].question}
              </h2>

              {/* Options */}
              <div className="mt-8 grid gap-3">

                {questions[step].options.map((option, index) => {
                  const selected =
                    answers[questions[step].id] === option;

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`
                        group relative flex w-full items-center justify-between
                        overflow-hidden rounded-2xl border
                        px-5 py-4 text-left
                        transition-all duration-200
                        ${
                          selected
                            ? 'border-violet-400/40 bg-violet-500/[0.10] shadow-[0_0_30px_rgba(139,92,246,0.08)]'
                            : 'border-white/[0.07] bg-white/[0.025] hover:border-violet-400/20 hover:bg-white/[0.05]'
                        }
                      `}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`
                            flex h-9 w-9 items-center justify-center
                            rounded-xl text-xs font-semibold
                            transition-all
                            ${
                              selected
                                ? 'bg-violet-500/20 text-violet-300'
                                : 'bg-white/[0.04] text-white/30 group-hover:text-white/60'
                            }
                          `}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>

                        <span
                          className={`
                            text-sm font-medium
                            ${
                              selected
                                ? 'text-white'
                                : 'text-white/55 group-hover:text-white/80'
                            }
                          `}
                        >
                          {option}
                        </span>
                      </div>

                      <div
                        className={`
                          flex h-7 w-7 items-center justify-center rounded-full
                          border transition-all
                          ${
                            selected
                              ? 'border-violet-400/40 bg-violet-500/20'
                              : 'border-white/[0.08] bg-white/[0.02]'
                          }
                        `}
                      >
                        {selected ? (
                          <Check className="h-3.5 w-3.5 text-violet-300" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex gap-3">

                <button
                  onClick={handleBack}
                  disabled={step === 0 || loading}
                  className="
                    rounded-2xl border border-white/[0.08]
                    bg-white/[0.025]
                    px-6 py-3.5
                    text-sm font-semibold
                    text-white/55
                    transition-all
                    hover:bg-white/[0.05]
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  Back
                </button>

                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="
                    group flex flex-1 items-center justify-center gap-2
                    rounded-2xl
                    bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600
                    px-6 py-3.5
                    text-sm font-semibold
                    text-white
                    shadow-[0_10px_30px_rgba(124,58,237,0.18)]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_15px_40px_rgba(124,58,237,0.25)]
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding Careers...
                    </>
                  ) : (
                    <>
                      {step === questions.length - 1
                        ? 'See Results'
                        : 'Continue'}

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/20">
            <Brain className="h-3.5 w-3.5" />
            AI analyzes your responses to find your strongest career matches
          </div>
        </div>
      ) : (

        /* =========================================================
           RESULTS
        ========================================================== */

        <div className="relative mx-auto max-w-6xl">

          {/* Results Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CircleCheck className="h-4 w-4 text-emerald-300" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300/70">
                  Assessment Complete
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Career Matches
                </span>
              </h1>

              <p className="mt-3 text-sm text-white/40 md:text-base">
                AI-powered recommendations based on your responses.
              </p>
            </div>

            <button
              onClick={handleTakeAgain}
              className="
                flex items-center justify-center gap-2
                rounded-2xl
                border border-white/[0.08]
                bg-white/[0.025]
                px-5 py-3
                text-sm font-semibold
                text-white/55
                transition-all
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <RotateCcw className="h-4 w-4" />
              Take Again
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/10 bg-red-500/[0.07] px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Career Results */}
          <div className="space-y-5">

            {careers.length === 0 ? (

              <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-12 text-center backdrop-blur-xl">
                <Brain className="mx-auto mb-4 h-10 w-10 text-white/20" />

                <p className="text-sm text-white/40">
                  No career recommendations found.
                </p>
              </div>

            ) : (

              careers.map((item, index) => {

                const career = item.career;

                const score = Math.round(
                  item.match_score || item.score || 0
                );

                const scoreDash = (score / 100) * 314;

                return (
                  <div
                    key={career.id || index}
                    className="
                      group relative overflow-hidden
                      rounded-[26px]
                      border border-white/[0.08]
                      bg-white/[0.025]
                      p-5
                      shadow-[0_20px_70px_rgba(0,0,0,0.15)]
                      backdrop-blur-2xl
                      transition-all duration-300
                      hover:border-violet-400/15
                      hover:bg-white/[0.04]
                      md:p-7
                    "
                  >

                    {/* Card Glow */}
                    <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-violet-500/[0.08] blur-[100px]" />

                    <div className="relative flex flex-col gap-8 lg:flex-row">

                      {/* Main Content */}
                      <div className="min-w-0 flex-1">

                        {/* Rank + Title */}
                        <div className="mb-4 flex items-start gap-3">

                          <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-violet-500/10 px-2 text-xs font-bold text-violet-300">
                            #{item.rank || index + 1}
                          </span>

                          <div>
                            <h3 className="text-xl font-bold text-white md:text-2xl">
                              {career.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1 text-[10px] text-white/40">
                                {career.category}
                              </span>

                              <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1 text-[10px] text-white/40">
                                {career.difficulty}
                              </span>

                              <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1 text-[10px] text-white/40">
                                {career.average_learning_time}h learning
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Description */}
                        <p className="mb-6 max-w-3xl text-sm leading-6 text-white/40">
                          {career.description}
                        </p>

                        {/* Skills */}
                        <div className="grid gap-5 md:grid-cols-2">

                          {item.matched_skills?.length > 0 && (
                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/60">
                                Matched Skills
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.matched_skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="
                                      rounded-xl
                                      border border-emerald-400/10
                                      bg-emerald-500/[0.07]
                                      px-3 py-1.5
                                      text-[11px]
                                      text-emerald-300/80
                                    "
                                  >
                                    ✓ {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.missing_skills?.length > 0 && (
                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-300/60">
                                Skills to Improve
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.missing_skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="
                                      rounded-xl
                                      border border-orange-400/10
                                      bg-orange-500/[0.07]
                                      px-3 py-1.5
                                      text-[11px]
                                      text-orange-300/80
                                    "
                                  >
                                    + {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Reasons */}
                        {item.reasons?.length > 0 && (
                          <div className="mt-6 space-y-2">
                            {item.reasons.map((reason, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs text-emerald-300/70"
                              >
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Select */}
                        <button
                          onClick={() =>
                            handleSelectCareer(career.id)
                          }
                          disabled={selecting === career.id}
                          className="
                            mt-7 flex w-full items-center justify-center gap-2
                            rounded-2xl
                            bg-gradient-to-r from-violet-600 to-blue-600
                            px-5 py-3
                            text-sm font-semibold
                            text-white
                            transition-all
                            hover:-translate-y-0.5
                            hover:shadow-[0_12px_30px_rgba(124,58,237,0.2)]
                            disabled:opacity-60
                          "
                        >
                          {selecting === career.id
                            ? 'Selecting...'
                            : 'This is what I want'}

                          {selecting !== career.id && (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                      {/* Score */}
                      <div className="flex flex-shrink-0 items-center justify-center lg:w-40">

                        <div className="relative h-32 w-32">

                          <svg
                            className="h-32 w-32 -rotate-90"
                            viewBox="0 0 112 112"
                          >
                            <circle
                              cx="56"
                              cy="56"
                              r="50"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="5"
                              className="text-white/[0.06]"
                            />

                            <circle
                              cx="56"
                              cy="56"
                              r="50"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="5"
                              strokeLinecap="round"
                              strokeDasharray={`${scoreDash} 314`}
                              className="text-violet-400"
                            />
                          </svg>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-white">
                                {score}
                              </span>

                              <span className="text-sm text-white/40">
                                %
                              </span>

                              <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/25">
                                Match
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Bottom Action */}
          <button
            onClick={handleTakeAgain}
            className="
              mt-6 flex w-full items-center justify-center gap-2
              rounded-2xl
              border border-white/[0.08]
              bg-white/[0.025]
              px-6 py-3.5
              text-sm font-semibold
              text-white/45
              transition-all
              hover:bg-white/[0.05]
              hover:text-white
            "
          >
            <RotateCcw className="h-4 w-4" />
            Take Assessment Again
          </button>

        </div>
      )}
    </div>
  );
};

export default CareerDiscovery;