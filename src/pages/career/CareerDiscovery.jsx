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
    <div className="min-h-screen bg-[#F6F1E8] px-4 py-6 text-[#173B32] md:px-8 md:py-8">

      {!showResults ? (
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6 border-b border-[#DED8CC] pb-8">

            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4B84A]/40 bg-[#E4B84A]/20">
                  <Sparkles className="h-4 w-4 text-[#173B32]" />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D66A4A]">
                  Career Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#173B32] md:text-5xl">
                Discover Your{' '}
                <span className="text-[#D66A4A]">
                  Career Path
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66736B] md:text-base">
                Answer a few questions and let AI identify the career paths
                that best match your skills, interests and goals.
              </p>
            </div>

            <div className="hidden rounded-xl border border-[#DED8CC] bg-[#FFFDF8] px-4 py-3 text-right shadow-[0_1px_4px_rgba(23,59,50,0.06)] md:block">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A948D]">
                Assessment
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173B32]">
                AI Powered
              </p>
            </div>
          </div>

          {/* Progress Panel */}
          <div className="mb-6 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-4 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D66A4A]" />

                <span className="text-xs font-medium text-[#66736B]">
                  Question {step + 1} of {questions.length}
                </span>
              </div>

              <span className="text-xs font-bold text-[#173B32]">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#DED8CC]">
              <div
                className="h-full rounded-full bg-[#E4B84A] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_2px_10px_rgba(23,59,50,0.07)] md:p-10">

            <div>

              {/* Question Number */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173B32] text-sm font-bold text-[#E4B84A]">
                  {String(step + 1).padStart(2, '0')}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A948D]">
                    Your Assessment
                  </p>

                  <p className="mt-0.5 text-xs text-[#66736B]">
                    Choose the option that describes you best
                  </p>
                </div>
              </div>

              <h2 className="max-w-3xl text-2xl font-bold leading-tight text-[#173B32] md:text-3xl">
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
                        overflow-hidden rounded-xl border
                        px-5 py-4 text-left
                        transition-colors duration-200
                        ${
                          selected
                            ? 'border-[#173B32] bg-[#173B32]/5'
                            : 'border-[#DED8CC] bg-[#FFFDF8] hover:border-[#78927A] hover:bg-[#F6F1E8]/60'
                        }
                      `}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`
                            flex h-9 w-9 items-center justify-center
                            rounded-lg text-xs font-semibold
                            transition-colors
                            ${
                              selected
                                ? 'bg-[#173B32] text-[#E4B84A]'
                                : 'bg-[#F6F1E8] text-[#66736B] group-hover:text-[#173B32]'
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
                                ? 'text-[#173B32]'
                                : 'text-[#66736B] group-hover:text-[#173B32]'
                            }
                          `}
                        >
                          {option}
                        </span>
                      </div>

                      <div
                        className={`
                          flex h-7 w-7 items-center justify-center rounded-full
                          border transition-colors
                          ${
                            selected
                              ? 'border-[#D66A4A] bg-[#D66A4A]'
                              : 'border-[#DED8CC] bg-[#FFFDF8]'
                          }
                        `}
                      >
                        {selected ? (
                          <Check className="h-3.5 w-3.5 text-[#FFFDF8]" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-[#8A948D] transition-transform group-hover:translate-x-0.5 group-hover:text-[#173B32]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-xl border border-[#B94F35]/30 bg-[#B94F35]/10 px-4 py-3 text-sm text-[#B94F35]">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex gap-3">

                <button
                  onClick={handleBack}
                  disabled={step === 0 || loading}
                  className="
                    rounded-xl border border-[#173B32]
                    bg-[#FFFDF8]
                    px-6 py-3.5
                    text-sm font-semibold
                    text-[#173B32]
                    transition-colors
                    hover:bg-[#173B32]/5
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
                    rounded-xl
                    bg-[#D66A4A]
                    px-6 py-3.5
                    text-sm font-semibold
                    text-[#FFFDF8]
                    shadow-[0_2px_8px_rgba(214,106,74,0.25)]
                    transition-colors duration-200
                    hover:bg-[#C45C3D]
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
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8A948D]">
            <Brain className="h-3.5 w-3.5" />
            AI analyzes your responses to find your strongest career matches
          </div>
        </div>
      ) : (

        /* =========================================================
           RESULTS
        ========================================================== */

        <div className="mx-auto max-w-6xl">

          {/* Results Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#DED8CC] pb-8 md:flex-row md:items-end">

            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#78927A]/15">
                  <CircleCheck className="h-4 w-4 text-[#78927A]" />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78927A]">
                  Assessment Complete
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#173B32] md:text-5xl">
                Your{' '}
                <span className="text-[#D66A4A]">
                  Career Matches
                </span>
              </h1>

              <p className="mt-3 text-sm text-[#66736B] md:text-base">
                AI-powered recommendations based on your responses.
              </p>
            </div>

            <button
              onClick={handleTakeAgain}
              className="
                flex items-center justify-center gap-2
                rounded-xl
                border border-[#173B32]
                bg-[#FFFDF8]
                px-5 py-3
                text-sm font-semibold
                text-[#173B32]
                transition-colors
                hover:bg-[#173B32]/5
              "
            >
              <RotateCcw className="h-4 w-4" />
              Take Again
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-[#B94F35]/30 bg-[#B94F35]/10 px-5 py-4 text-sm text-[#B94F35]">
              {error}
            </div>
          )}

          {/* Career Results */}
          <div className="space-y-5">

            {careers.length === 0 ? (

              <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-12 text-center shadow-[0_1px_4px_rgba(23,59,50,0.06)]">
                <Brain className="mx-auto mb-4 h-10 w-10 text-[#8A948D]" />

                <p className="text-sm text-[#66736B]">
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
                      rounded-2xl
                      border border-[#DED8CC]
                      bg-[#FFFDF8]
                      p-5
                      shadow-[0_1px_4px_rgba(23,59,50,0.06)]
                      transition-all duration-300
                      hover:shadow-[0_8px_22px_rgba(23,59,50,0.12)]
                      md:p-7
                    "
                  >

                    <div className="relative flex flex-col gap-8 lg:flex-row">

                      {/* Main Content */}
                      <div className="min-w-0 flex-1">

                        {/* Rank + Title */}
                        <div className="mb-4 flex items-start gap-3">

                          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#173B32] px-2 text-xs font-bold text-[#E4B84A]">
                            #{item.rank || index + 1}
                          </span>

                          <div>
                            <h3 className="text-xl font-bold text-[#173B32] md:text-2xl">
                              {career.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]">
                                {career.category}
                              </span>

                              <span className="rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]">
                                {career.difficulty}
                              </span>

                              <span className="rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]">
                                {career.average_learning_time}h learning
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Description */}
                        <p className="mb-6 max-w-3xl text-sm leading-6 text-[#66736B]">
                          {career.description}
                        </p>

                        {/* Skills */}
                        <div className="grid gap-5 md:grid-cols-2">

                          {item.matched_skills?.length > 0 && (
                            <div>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#78927A]">
                                Matched Skills
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.matched_skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="
                                      rounded-lg
                                      border border-[#78927A]/40
                                      bg-[#78927A]/15
                                      px-3 py-1.5
                                      text-[11px]
                                      font-medium
                                      text-[#173B32]
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
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#B94F35]">
                                Skills to Improve
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.missing_skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="
                                      rounded-lg
                                      border border-[#D66A4A]/30
                                      bg-[#D66A4A]/10
                                      px-3 py-1.5
                                      text-[11px]
                                      font-medium
                                      text-[#B94F35]
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
                                className="flex items-start gap-2 text-xs text-[#66736B]"
                              >
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#78927A]" />
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
                            rounded-xl
                            bg-[#173B32]
                            px-5 py-3
                            text-sm font-semibold
                            text-[#FFFDF8]
                            transition-colors
                            hover:bg-[#1F4A3F]
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
                              className="text-[#DED8CC]"
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
                              className="text-[#D66A4A]"
                            />
                          </svg>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-[#173B32]">
                                {score}
                              </span>

                              <span className="text-sm text-[#66736B]">
                                %
                              </span>

                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8A948D]">
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
              rounded-xl
              border border-[#173B32]
              bg-[#FFFDF8]
              px-6 py-3.5
              text-sm font-semibold
              text-[#173B32]
              transition-colors
              hover:bg-[#173B32]/5
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