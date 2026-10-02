import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Clock3,
  Brain,
  ChevronRight,
  Activity,
  Award,
  Rocket,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  MessageSquare,
  Compass,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  UserRound,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/* =========================================================
   AUTH
========================================================= */

const authHeaders = () => {
  const token = localStorage.getItem('ra_token');

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getUserName = () => {
  try {
    const raw = localStorage.getItem('ra_user');

    if (!raw) return 'there';

    const parsed = JSON.parse(raw);
    return parsed?.name || 'there';
  } catch {
    return 'there';
  }
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  progress,
  tone = 'terracotta',
}) => {
  const tones = {
    terracotta: {
      icon: 'bg-[#D96C4A] text-white',
      progress: 'bg-[#D96C4A]',
    },
    sage: {
      icon: 'bg-[#6F8F72] text-white',
      progress: 'bg-[#6F8F72]',
    },
    mustard: {
      icon: 'bg-[#E7B84B] text-[#18231F]',
      progress: 'bg-[#E7B84B]',
    },
    forest: {
      icon: 'bg-[#24483A] text-white',
      progress: 'bg-[#24483A]',
    },
  };

  const current = tones[tone];

  return (
    <div className="rounded-2xl border border-[#E4DED2] bg-[#FFFCF6] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(52,48,39,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-xs font-medium text-[#8A887F]">
          {progress}%
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#85847C]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#202D28]">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-[#8A887F]">{subtitle}</p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ECE7DC]">
        <div
          className={`h-full rounded-full ${current.progress} transition-all duration-500`}
          style={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, title, tone = 'terracotta' }) => {
  const tones = {
    terracotta: 'bg-[#F9E7DF] text-[#B95337]',
    sage: 'bg-[#E6EFE5] text-[#527058]',
    mustard: 'bg-[#F8EECF] text-[#9A751D]',
    forest: 'bg-[#E2ECE8] text-[#315D4B]',
  };

  return (
    <a
      href="#"
      className="group flex min-h-[82px] flex-col justify-between rounded-xl border border-[#E8E1D5] bg-[#FFFCF6] p-3 transition hover:border-[#D8CCBA] hover:shadow-[0_8px_24px_rgba(52,48,39,0.06)]"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#303B35]">{title}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#A19D93] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D96C4A]" />
      </div>
    </a>
  );
};

const SectionHeading = ({ eyebrow, title, icon: Icon, action }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#D96C4A]" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B887E]">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-[#202D28]">
        {title}
      </h2>
    </div>

    {action && (
      <a
        href={action.href || '#'}
        className="hidden items-center gap-1 text-xs font-semibold text-[#557660] hover:text-[#D96C4A] sm:flex"
      >
        {action.label}
        <ChevronRight className="h-3.5 w-3.5" />
      </a>
    )}
  </div>
);

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const [careerData, setCareerData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  useEffect(() => {
    fetchCareer();
    fetchRoadmap();
    fetchInterviewReport();
  }, []);

  const fetchCareer = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/career/my-career`,
        {
          method: 'GET',
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        setCareerData(null);
        return;
      }

      const data = await response.json();
      setCareerData(data?.data || null);
    } catch (error) {
      console.error('fetchCareer error:', error);
      setCareerData(null);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/career/roadmap/my`,
        {
          method: 'GET',
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        setRoadmapData(null);
        return;
      }

      const data = await response.json();
      setRoadmapData(data?.data || null);
    } catch (error) {
      console.error('fetchRoadmap error:', error);
      setRoadmapData(null);
    }
  };

  const fetchInterviewReport = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interview/overall-report`,
        {
          method: 'GET',
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setInterviewReport(null);
        return;
      }

      setInterviewReport(data?.data || null);
    } catch (error) {
      console.error('fetchInterviewReport error:', error);
      setInterviewReport(null);
    }
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const careerMatch =
    careerData?.match_score != null
      ? Math.round(Number(careerData.match_score))
      : null;

  const roadmapProgress =
    roadmapData?.overall_progress != null
      ? Math.round(Number(roadmapData.overall_progress))
      : 0;

  const totalSteps = roadmapData?.steps?.length || 0;

  const completedSteps =
    roadmapData?.steps?.filter(
      (step) => step.status === 'completed'
    ).length || 0;

  const remainingSteps = Math.max(totalSteps - completedSteps, 0);

  const interviewScore =
    interviewReport?.overall_score != null
      ? Math.round(Number(interviewReport.overall_score))
      : null;

  const interviewSessions = interviewReport?.total_sessions || 0;

  const nextSteps = (roadmapData?.steps || [])
    .filter((step) => step.status !== 'completed')
    .slice(0, 5);

  const interviewChartData = Object.entries(
    interviewReport?.by_type || {}
  ).map(([type, score]) => ({
    type,
    score: Number(score),
  }));

  const userName = getUserName();

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#202D28]">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-[#E5DED2] bg-[#F7F4ED]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DED6C9] bg-[#FFFCF6] text-[#304139] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#182E26]">
              <Compass className="h-5 w-5 text-[#E7B84B]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#203028]">
                AI Career Mentor
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#8C887E]">
                Learn · Plan · Build
              </p>
            </div>
          </div>

          <div className="relative max-w-xl flex-1 lg:ml-8">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99958B]" />

            <input
              type="text"
              placeholder="Search for courses, skills, jobs..."
              className="h-11 w-full rounded-xl border border-[#DDD6C9] bg-[#FFFCF6] pl-10 pr-4 text-sm text-[#28362F] outline-none placeholder:text-[#AAA59A] focus:border-[#C98368] focus:ring-2 focus:ring-[#D96C4A]/10"
            />
          </div>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DED6C9] bg-[#FFFCF6] text-[#4E5A53] hover:text-[#D96C4A]"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D96C4A]" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE8DF] text-[#355A47]">
              <UserRound className="h-4 w-4" />
            </div>

            <div className="hidden xl:block">
              <p className="text-xs font-bold text-[#28362F]">{userName}</p>
              <p className="text-[10px] text-[#918D84]">Learner</p>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HERO */}

        <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="relative min-h-[250px] overflow-hidden rounded-2xl border border-[#DDD4C5] bg-[#EFE7D7] p-6 sm:p-8 lg:p-10">
            {/* Simple manual decorative landscape */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-full w-[45%] opacity-90">
              <div className="absolute bottom-0 right-[10%] h-32 w-32 rounded-t-[70px] bg-[#B9C8A9]" />
              <div className="absolute bottom-0 right-[-4%] h-44 w-56 rounded-t-[100%] bg-[#78927A]" />
              <div className="absolute bottom-0 right-[23%] h-24 w-36 rounded-t-[100%] bg-[#496E58]" />
              <div className="absolute right-[24%] top-12 h-2 w-24 rotate-[25deg] rounded-full bg-[#E2B65C]" />
              <div className="absolute right-[12%] top-5 h-8 w-8 rounded-full bg-[#E7B84B]" />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D5C9B6] bg-[#FFFCF6]/70 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#D96C4A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5F675F]">
                  Career Journey
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#1E3028] sm:text-4xl">
                Good Morning, {userName}
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#60665F] sm:text-base">
                Every skill you build brings you one step closer to your
                career goal.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/career-discovery"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D96C4A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#C75E3E]"
                >
                  Explore Career Paths
                  <ArrowUpRight className="h-4 w-4" />
                </a>

                <a
                  href="/roadmap"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D7CDBE] bg-[#FFFCF6] px-5 py-3 text-xs font-bold text-[#33453C] transition hover:border-[#C8B9A4]"
                >
                  View My Roadmap
                </a>
              </div>
            </div>
          </div>

          {/* CAREER PROGRESS */}

          <div className="rounded-2xl bg-[#1B332A] p-6 text-[#FFFDF7] shadow-[0_12px_35px_rgba(24,45,37,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#AEBFB3]">
                  Your Career
                </p>
                <h2 className="mt-1 text-xl font-bold">Progress</h2>
              </div>

              <TrendingUp className="h-5 w-5 text-[#E7B84B]" />
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div
                className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#E7B84B ${roadmapProgress}%, #355343 ${roadmapProgress}% 100%)`,
                }}
              >
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#1B332A]">
                  <span className="text-2xl font-bold">{roadmapProgress}%</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-8">
                  <span className="flex items-center gap-2 text-[#C5D0C8]">
                    <CheckCircle2 className="h-4 w-4 text-[#8BAE8E]" />
                    Steps completed
                  </span>
                  <strong>{completedSteps}/{totalSteps}</strong>
                </div>

                <div className="flex items-center justify-between gap-8">
                  <span className="flex items-center gap-2 text-[#C5D0C8]">
                    <Activity className="h-4 w-4 text-[#E7B84B]" />
                    Interview score
                  </span>
                  <strong>{interviewScore != null ? `${interviewScore}%` : '—'}</strong>
                </div>

                <div className="flex items-center justify-between gap-8">
                  <span className="flex items-center gap-2 text-[#C5D0C8]">
                    <Target className="h-4 w-4 text-[#D88B70]" />
                    Career match
                  </span>
                  <strong>{careerMatch != null ? `${careerMatch}%` : '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={TrendingUp}
            label="Career Match"
            value={careerMatch != null ? `${careerMatch}%` : '—'}
            subtitle={
              careerData?.career?.title
                ? `Matched with ${careerData.career.title}`
                : 'Complete Career Discovery'
            }
            progress={careerMatch || 0}
            tone="terracotta"
          />

          <MetricCard
            icon={Target}
            label="Roadmap Progress"
            value={`${roadmapProgress}%`}
            subtitle={`${completedSteps}/${totalSteps} steps completed`}
            progress={roadmapProgress}
            tone="sage"
          />

          <MetricCard
            icon={BookOpen}
            label="Interview Score"
            value={interviewScore != null ? `${interviewScore}%` : '—'}
            subtitle={`${interviewSessions} session(s) completed`}
            progress={interviewScore || 0}
            tone="mustard"
          />

          <MetricCard
            icon={Zap}
            label="Steps Remaining"
            value={remainingSteps}
            subtitle="Keep progressing"
            progress={
              totalSteps > 0
                ? Math.round((completedSteps / totalSteps) * 100)
                : 0
            }
            tone="forest"
          />
        </section>

        {/* QUICK FEATURES */}

        <section className="mb-7">
          <SectionHeading
            eyebrow="Your workspace"
            title="What would you like to do?"
            icon={Compass}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <a
              href="/career-discovery"
              className="group rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 transition hover:-translate-y-0.5 hover:border-[#D2C5B5] hover:shadow-[0_10px_28px_rgba(52,48,39,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9E7DF] text-[#C05B3D]">
                  <Compass className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#AAA398] transition group-hover:text-[#D96C4A]" />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#25352D]">
                Career Discovery
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#858178]">
                Find the right career path based on your interests and skills.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#C05B3D]">
                Explore →
              </span>
            </a>

            <a
              href="/roadmap"
              className="group rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 transition hover:-translate-y-0.5 hover:border-[#D2C5B5] hover:shadow-[0_10px_28px_rgba(52,48,39,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6EFE5] text-[#527058]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#AAA398] transition group-hover:text-[#6F8F72]" />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#25352D]">
                My Roadmap
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#858178]">
                Follow your personalized learning path and track progress.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#527058]">
                View Roadmap →
              </span>
            </a>

            <a
              href="/ai-tutor"
              className="group rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 transition hover:-translate-y-0.5 hover:border-[#D2C5B5] hover:shadow-[0_10px_28px_rgba(52,48,39,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EECF] text-[#9A751D]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#AAA398] transition group-hover:text-[#9A751D]" />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#25352D]">
                AI Tutor
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#858178]">
                Get help with concepts, questions and your daily learning.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#9A751D]">
                Start Chat →
              </span>
            </a>
          </div>
        </section>

        {/* ROADMAP + ACTIVITY */}

        <section className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              eyebrow="Learning journey"
              title="Your Roadmap"
              icon={Target}
              action={{ label: 'View all', href: '/roadmap' }}
            />

            {nextSteps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DCD4C6] bg-[#FAF7F0] p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#6F8F72]" />
                <p className="text-sm font-semibold text-[#4B5A51]">
                  {roadmapData
                    ? 'All roadmap steps completed! 🎉'
                    : 'Complete Career Discovery first.'}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute bottom-4 left-[17px] top-4 w-px bg-[#DCD7CD]" />

                <div className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="relative flex gap-4 rounded-xl border border-[#ECE5DA] bg-[#FAF8F2] p-4"
                    >
                      <div
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-[#FAF8F2] ${
                          step.status === 'in_progress'
                            ? 'bg-[#D96C4A] text-white'
                            : 'bg-[#E1E7DF] text-[#66806B]'
                        }`}
                      >
                        {step.status === 'in_progress' ? (
                          <Activity className="h-4 w-4" />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#2D3B34]">
                              {step.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#918C82]">
                              {step.status === 'in_progress'
                                ? 'Currently in progress'
                                : 'Not started yet'}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-[#5D7565]">
                            {step.progress || 0}%
                          </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8E3D9]">
                          <div
                            className={`h-full rounded-full ${
                              step.status === 'in_progress'
                                ? 'bg-[#D96C4A]'
                                : 'bg-[#A9B8A8]'
                            }`}
                            style={{ width: `${step.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      <a
                        href="/roadmap"
                        className="self-center rounded-lg p-2 text-[#9A968D] hover:bg-[#F0EAE0] hover:text-[#D96C4A]"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              eyebrow="Latest updates"
              title="Recent Activity"
              icon={Clock3}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#EEE8DD] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6EFE5] text-[#527058]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#35433B]">
                    Roadmap progress updated
                  </p>
                  <p className="text-[10px] text-[#959087]">
                    Your learning journey is moving forward
                  </p>
                </div>
                <span className="text-[9px] text-[#AAA59A]">Now</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#EEE8DD] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8EECF] text-[#9A751D]">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#35433B]">
                    AI Tutor ready
                  </p>
                  <p className="text-[10px] text-[#959087]">
                    Continue your learning conversation
                  </p>
                </div>
                <span className="text-[9px] text-[#AAA59A]">Today</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#EEE8DD] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9E7DF] text-[#C05B3D]">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#35433B]">
                    Resume workspace
                  </p>
                  <p className="text-[10px] text-[#959087]">
                    Keep your profile job-ready
                  </p>
                </div>
                <span className="text-[9px] text-[#AAA59A]">Today</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#EEE8DD] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E2ECE8] text-[#315D4B]">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#35433B]">
                    Job preparation
                  </p>
                  <p className="text-[10px] text-[#959087]">
                    Practice before your next opportunity
                  </p>
                </div>
                <span className="text-[9px] text-[#AAA59A]">This week</span>
              </div>
            </div>
          </div>
        </section>

        {/* ANALYTICS */}

        <section className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              eyebrow="Progress analytics"
              title="Roadmap Progress"
              icon={BarChart3}
            />

            {roadmapData?.steps?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roadmapData.steps}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8E2D8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="order"
                    stroke="#99958B"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#99958B"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFCF6',
                      border: '1px solid #DDD5C8',
                      borderRadius: '10px',
                      color: '#25352D',
                    }}
                    cursor={{ fill: '#F5F0E7' }}
                  />
                  <Bar
                    dataKey="progress"
                    fill="#6F8F72"
                    radius={[6, 6, 1, 1]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-[#DED7CA] bg-[#FAF8F2]">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-3 h-8 w-8 text-[#B0ABA1]" />
                  <p className="text-sm text-[#918C82]">
                    No roadmap data yet.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              eyebrow="Interview analytics"
              title="Interview Performance"
              icon={Award}
            />

            {interviewChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={interviewChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8E2D8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="type"
                    stroke="#99958B"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#99958B"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFCF6',
                      border: '1px solid #DDD5C8',
                      borderRadius: '10px',
                      color: '#25352D',
                    }}
                    cursor={{ fill: '#F5F0E7' }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#D96C4A"
                    radius={[6, 6, 1, 1]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-[#DED7CA] bg-[#FAF8F2]">
                <div className="text-center">
                  <Award className="mx-auto mb-3 h-8 w-8 text-[#B0ABA1]" />
                  <p className="text-sm text-[#918C82]">
                    No completed interviews yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS + RECOMMENDATION */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#E2DBCF] bg-[#FFFCF6] p-5">
            <SectionHeading
              eyebrow="Shortcuts"
              title="Quick Actions"
              icon={Zap}
            />

            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={Target} title="Take a Quiz" tone="terracotta" />
              <QuickAction icon={FileText} title="Build Resume" tone="sage" />
              <QuickAction icon={BriefcaseBusiness} title="Find Jobs" tone="mustard" />
              <QuickAction icon={MessageSquare} title="Practice Interview" tone="forest" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#D7CBB8] bg-[#EFE6D4] p-6">
            <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-lg">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B332A] text-[#E7B84B]">
                  <Rocket className="h-4 w-4" />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B786F]">
                  Keep moving
                </p>

                <h2 className="mt-1 text-2xl font-bold leading-tight text-[#203028]">
                  Build your skills.
                  <br />
                  Create your future.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6F7069]">
                  Keep your roadmap moving and prepare for the opportunities
                  ahead.
                </p>
              </div>

              <a
                href="/roadmap"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1B332A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#24483A]"
              >
                Continue Learning
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
