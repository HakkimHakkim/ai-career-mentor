import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Clock3,
  Brain,
  ChevronRight,
  Activity,
  Award,
  Rocket,
  BarChart3,
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

import MetricCard from '../../components/cards/MetricCard';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

/* =====================================================
   AUTH
===================================================== */

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

/* =====================================================
   DASHBOARD
===================================================== */

const Dashboard = () => {
  const [careerData, setCareerData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  /* =====================================================
     API CALLS
  ===================================================== */

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

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const careerMatch =
    careerData?.match_score != null
      ? Math.round(Number(careerData.match_score))
      : null;

  const roadmapProgress =
    roadmapData?.overall_progress != null
      ? Math.round(Number(roadmapData.overall_progress))
      : 0;

  const totalSteps =
    roadmapData?.steps?.length || 0;

  const completedSteps =
    roadmapData?.steps?.filter(
      (step) => step.status === 'completed'
    ).length || 0;

  const remainingSteps =
    Math.max(totalSteps - completedSteps, 0);

  const interviewScore =
    interviewReport?.overall_score != null
      ? Math.round(
          Number(interviewReport.overall_score)
        )
      : null;

  const interviewSessions =
    interviewReport?.total_sessions || 0;

  const nextSteps =
    (roadmapData?.steps || [])
      .filter((step) => step.status !== 'completed')
      .slice(0, 5);

  const interviewChartData =
    Object.entries(
      interviewReport?.by_type || {}
    ).map(([type, score]) => ({
      type,
      score: Number(score),
    }));

  /* =====================================================
     USER NAME
  ===================================================== */

  const userName = getUserName();

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070914] text-white">

      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -top-40 left-[15%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute top-[20%] right-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute bottom-[-150px] left-[30%] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[150px]" />

      </div>

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="relative mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 xl:p-10">

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section className="mb-8">

          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-[#11152c]/90 via-[#0d1125]/90 to-[#09172b]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-8 lg:p-10">

            {/* Glow */}

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />

            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/10 bg-violet-500/[0.08] px-3 py-1.5">

                  <Sparkles className="h-3.5 w-3.5 text-violet-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
                    Career Intelligence
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">

                  Welcome back,{' '}

                  <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    {userName}
                  </span>

                  <span className="ml-2">
                    👋
                  </span>

                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
                  Your career journey is already in motion.
                  Keep learning, improving and moving closer
                  to your dream career.
                </p>

              </div>

              {/* STATUS */}

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] px-5 py-4">

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                  <Activity className="h-5 w-5 text-emerald-400" />

                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                    Current Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/80">
                    Career journey active
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            METRICS
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* CAREER MATCH */}

          <div className="group relative overflow-hidden rounded-[24px] border border-violet-400/10 bg-white/[0.035] p-1 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/25">

            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl transition-all group-hover:bg-violet-500/25" />

            <MetricCard
              icon={TrendingUp}
              title="Career Match"
              value={
                careerMatch != null
                  ? `${careerMatch}%`
                  : '—'
              }
              subtitle={
                careerData?.career?.title
                  ? `Matched with ${careerData.career.title}`
                  : 'Complete Career Discovery'
              }
              progress={careerMatch || 0}
            />

          </div>

          {/* ROADMAP */}

          <div className="group relative overflow-hidden rounded-[24px] border border-blue-400/10 bg-white/[0.035] p-1 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/25">

            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/15 blur-3xl transition-all group-hover:bg-blue-500/25" />

            <MetricCard
              icon={Target}
              title="Roadmap Progress"
              value={`${roadmapProgress}%`}
              subtitle={`${completedSteps}/${totalSteps} steps completed`}
              progress={roadmapProgress}
            />

          </div>

          {/* INTERVIEW */}

          <div className="group relative overflow-hidden rounded-[24px] border border-cyan-400/10 bg-white/[0.035] p-1 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25">

            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl transition-all group-hover:bg-cyan-500/25" />

            <MetricCard
              icon={BookOpen}
              title="Interview Score"
              value={
                interviewScore != null
                  ? `${interviewScore}%`
                  : '—'
              }
              subtitle={`${interviewSessions} session(s) completed`}
              progress={interviewScore || 0}
            />

          </div>

          {/* REMAINING */}

          <div className="group relative overflow-hidden rounded-[24px] border border-purple-400/10 bg-white/[0.035] p-1 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/25">

            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl transition-all group-hover:bg-purple-500/25" />

            <MetricCard
              icon={Zap}
              title="Steps Remaining"
              value={`${remainingSteps}`}
              subtitle="Keep progressing"
              progress={
                totalSteps > 0
                  ? Math.round(
                      (completedSteps /
                        totalSteps) *
                        100
                    )
                  : 0
              }
            />

          </div>

        </section>

        {/* =================================================
            CAREER + ROADMAP
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* NEXT STEPS */}

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-2xl xl:col-span-1">

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/[0.07] blur-3xl" />

            <div className="relative mb-6 flex items-center justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <Target className="h-4 w-4 text-violet-300" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300/60">
                    Roadmap
                  </span>

                </div>

                <h2 className="text-xl font-bold">
                  Next Steps
                </h2>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">

                <ChevronRight className="h-4 w-4 text-white/40" />

              </div>

            </div>

            <div className="relative space-y-3">

              {nextSteps.length === 0 && (

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 text-center">

                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" />

                  <p className="text-sm text-white/50">
                    {roadmapData
                      ? 'All roadmap steps completed! 🎉'
                      : 'Complete Career Discovery first.'}
                  </p>

                </div>

              )}

              {nextSteps.map((step, index) => (

                <div
                  key={step.id}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3 transition-all duration-200 hover:border-violet-400/20 hover:bg-violet-500/[0.04]"
                >

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      step.status === 'in_progress'
                        ? 'bg-violet-500/10'
                        : 'bg-white/[0.04]'
                    }`}
                  >

                    {step.status === 'in_progress' ? (

                      <Activity className="h-4 w-4 text-violet-400" />

                    ) : (

                      <span className="text-xs font-bold text-white/30">
                        0{index + 1}
                      </span>

                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-white/80">
                      {step.title}
                    </p>

                    <div className="mt-1 flex items-center gap-2">

                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                          style={{
                            width: `${step.progress || 0}%`,
                          }}
                        />

                      </div>

                      <span className="text-[10px] text-white/30">
                        {step.progress || 0}%
                      </span>

                    </div>

                  </div>

                  <ArrowUpRight className="h-4 w-4 text-white/20 transition-all group-hover:text-violet-300" />

                </div>

              ))}

            </div>

          </div>

          {/* AI MENTOR */}

          <div className="relative overflow-hidden rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-[#181542] via-[#111632] to-[#0a1d36] p-7 shadow-[0_30px_100px_rgba(76,29,149,0.16)] xl:col-span-2">

            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-[110px]" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[110px]" />

            <div className="relative">

              <div className="mb-7 flex items-start justify-between">

                <div>

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                    <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-300/70">
                      AI Mentor Online
                    </span>

                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Your AI Career Mentor
                  </h2>

                  <p className="mt-2 text-sm text-white/40">
                    Personalized guidance for your career journey
                  </p>

                </div>

                <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-3xl shadow-[0_0_40px_rgba(139,92,246,0.15)] sm:flex">
                  🤖
                </div>

              </div>

              <div className="max-w-2xl">

                <p className="mb-7 text-sm leading-7 text-white/60 sm:text-base">

                  {careerData?.career?.title ? (

                    <>
                      You're currently targeting{' '}
                      <span className="font-semibold text-violet-300">
                        {careerData.career.title}
                      </span>{' '}
                      with a{' '}
                      <span className="font-semibold text-cyan-300">
                        {careerMatch}%
                      </span>{' '}
                      career match. Continue your roadmap
                      and practice interviews to become job-ready.
                    </>

                  ) : (

                    'Complete Career Discovery to unlock your personalized career match, roadmap and AI guidance.'

                  )}

                </p>

                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/90"
                >

                  <Brain className="h-4 w-4" />

                  Chat with AI Mentor

                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />

                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* ROADMAP ANALYTICS */}

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-2xl">

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/[0.06] blur-3xl" />

            <div className="relative mb-7 flex items-center justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <BarChart3 className="h-4 w-4 text-violet-300" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300/60">
                    Progress Analytics
                  </span>

                </div>

                <h3 className="text-lg font-bold">
                  Roadmap Progress
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">

                <TrendingUp className="h-4 w-4 text-violet-300" />

              </div>

            </div>

            {roadmapData?.steps?.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <BarChart data={roadmapData.steps}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.08)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="order"
                    stroke="#64748B"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    stroke="#64748B"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,15,35,0.96)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      color: '#fff',
                    }}
                    cursor={{
                      fill: 'rgba(139,92,246,0.05)',
                    }}
                  />

                  <Bar
                    dataKey="progress"
                    fill="#8B5CF6"
                    radius={[8, 8, 2, 2]}
                    maxBarSize={42}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[260px] items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02]">

                <div className="text-center">

                  <BarChart3 className="mx-auto mb-3 h-8 w-8 text-white/20" />

                  <p className="text-sm text-white/30">
                    No roadmap data yet.
                  </p>

                </div>

              </div>

            )}

          </div>

          {/* INTERVIEW ANALYTICS */}

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-2xl">

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/[0.06] blur-3xl" />

            <div className="relative mb-7 flex items-center justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <Award className="h-4 w-4 text-cyan-300" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/60">
                    Interview Analytics
                  </span>

                </div>

                <h3 className="text-lg font-bold">
                  Interview Performance
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">

                <BookOpen className="h-4 w-4 text-cyan-300" />

              </div>

            </div>

            {interviewChartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <BarChart data={interviewChartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.08)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="type"
                    stroke="#64748B"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    stroke="#64748B"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,15,35,0.96)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      color: '#fff',
                    }}
                    cursor={{
                      fill: 'rgba(56,189,248,0.05)',
                    }}
                  />

                  <Bar
                    dataKey="score"
                    fill="#38BDF8"
                    radius={[8, 8, 2, 2]}
                    maxBarSize={42}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[260px] items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02]">

                <div className="text-center">

                  <Award className="mx-auto mb-3 h-8 w-8 text-white/20" />

                  <p className="text-sm text-white/30">
                    No completed interviews yet.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            RECOMMENDED NEXT STEPS
        ================================================= */}

        <section>

          <div className="mb-6 flex items-end justify-between">

            <div>

              <div className="mb-1 flex items-center gap-2">

                <Rocket className="h-4 w-4 text-violet-300" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300/60">
                  Keep Moving
                </span>

              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                Recommended Next Steps
              </h2>

            </div>

          </div>

          {roadmapData?.steps?.length > 0 ? (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {roadmapData.steps
                .filter(
                  (step) =>
                    step.status !== 'completed'
                )
                .slice(0, 3)
                .map((step, index) => (

                  <div
                    key={step.id}
                    className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:shadow-[0_25px_70px_rgba(76,29,149,0.12)]"
                  >

                    {/* CARD GLOW */}

                    <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/[0.08] blur-3xl transition-all group-hover:bg-violet-500/[0.15]" />

                    {/* HEADER */}

                    <div className="relative flex h-32 items-end overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-600/10 p-5">

                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(139,92,246,0.20),transparent_35%)]" />

                      <div className="relative flex w-full items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">

                          <span className="text-sm font-bold text-violet-200">
                            0{index + 1}
                          </span>

                        </div>

                        <div className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/50 backdrop-blur-xl">

                          {step.status === 'in_progress'
                            ? 'In Progress'
                            : 'Not Started'}

                        </div>

                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="relative p-6">

                      <h3 className="mb-2 text-lg font-bold">
                        {step.title}
                      </h3>

                      <p className="mb-5 text-xs leading-5 text-white/35">
                        {step.status === 'in_progress'
                          ? 'Continue working on this roadmap step.'
                          : 'Start this step to continue your career journey.'}
                      </p>

                      {/* PROGRESS */}

                      <div className="mb-5">

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                            Progress
                          </span>

                          <span className="text-xs font-semibold text-violet-300">
                            {step.progress || 0}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 transition-all duration-500"
                            style={{
                              width: `${step.progress || 0}%`,
                            }}
                          />

                        </div>

                      </div>

                      <a
                        href="/roadmap"
                        className="group/button flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.045] py-3 text-xs font-semibold text-white/65 transition-all duration-200 hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-white"
                      >

                        Continue Learning

                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" />

                      </a>

                    </div>

                  </div>

                ))}

            </div>

          ) : (

            <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-10 text-center backdrop-blur-xl">

              <Rocket className="mx-auto mb-4 h-10 w-10 text-white/20" />

              <p className="text-sm text-white/35">
                No roadmap steps yet. Complete Career Discovery to get started.
              </p>

            </div>

          )}

        </section>

      </div>

    </div>
  );
};

export default Dashboard;