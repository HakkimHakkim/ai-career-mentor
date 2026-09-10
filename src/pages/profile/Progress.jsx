import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  Calendar,
  ArrowUpRight,
  Trophy,
  Activity,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

// ============================================================
// AUTH
// ============================================================

const authHeaders = () => {
  const token = localStorage.getItem('ra_token');

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ============================================================
// COMPONENT
// ============================================================

const Progress = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    fetchRoadmap();
    fetchInterviewReport();
    fetchRecentSessions();
  }, []);

  // ============================================================
  // FETCH ROADMAP
  // ============================================================

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

  // ============================================================
  // FETCH INTERVIEW REPORT
  // ============================================================

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

  // ============================================================
  // FETCH RECENT SESSIONS
  // ============================================================

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interview/my-sessions`,
        {
          method: 'GET',
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRecentSessions([]);
        return;
      }

      const sessions =
        data?.data ||
        data?.sessions ||
        [];

      setRecentSessions(
        Array.isArray(sessions)
          ? sessions
          : []
      );
    } catch (error) {
      console.error(
        'fetchRecentSessions error:',
        error
      );

      setRecentSessions([]);
    }
  };

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const roadmapProgress =
    roadmapData?.overall_progress != null
      ? Math.round(
          Number(roadmapData.overall_progress)
        )
      : 0;

  const totalSteps =
    roadmapData?.steps?.length || 0;

  const completedSteps =
    roadmapData?.steps?.filter(
      (step) =>
        step.status === 'completed'
    ).length || 0;

  const interviewScore =
    interviewReport?.overall_score != null
      ? Math.round(
          Number(
            interviewReport.overall_score
          )
        )
      : null;

  const interviewSessions =
    interviewReport?.total_sessions || 0;

  const radarData = Object.entries(
    interviewReport?.by_type || {}
  ).map(([type, score]) => ({
    skill: type,
    value: Number(score) || 0,
  }));

  const completedSessionsList =
    recentSessions
      .filter(
        (session) =>
          session.status === 'completed'
      )
      .slice(0, 6);

  // ============================================================
  // HELPER
  // ============================================================

  const getScoreLabel = (score) => {
    if (score == null) return 'No data';

    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';

    return 'Needs work';
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full w-full bg-gray-50 dark:bg-[#080d20]">

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300">
                <Activity className="h-3.5 w-3.5" />
                Learning Analytics
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Your Progress
              </h1>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                Track your learning journey, interview performance,
                and career growth.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-[#1e2749] dark:bg-[#111633]">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Current Goal
                </p>

                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {roadmapData?.career_title ||
                    'Build your career'}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ====================================================
            HERO PROGRESS
        ==================================================== */}

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-900/10 sm:p-8">

          {/* Decorative elements */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">

            {/* Left */}

            <div>

              <div className="mb-4 flex items-center gap-2">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <span className="text-sm font-semibold text-white/80">
                  Overall Roadmap Progress
                </span>

              </div>

              <div className="flex flex-wrap items-end gap-4">

                <h2 className="text-6xl font-black tracking-tight sm:text-7xl">
                  {roadmapProgress}%
                </h2>

                <div className="pb-2">

                  <p className="text-sm font-semibold">
                    {roadmapProgress >= 80
                      ? 'Almost there!'
                      : roadmapProgress >= 50
                      ? 'Great progress!'
                      : 'Keep going!'}
                  </p>

                  <p className="mt-1 text-xs text-white/70">
                    {completedSteps} of{' '}
                    {totalSteps} roadmap steps
                    completed
                  </p>

                </div>

              </div>

              {/* Progress bar */}

              <div className="mt-6 max-w-2xl">

                <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/70">
                  <span>
                    {roadmapData?.career_title ||
                      'Career Roadmap'}
                  </span>

                  <span>
                    {roadmapProgress}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/15">

                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          roadmapProgress
                        )
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Circular progress */}

            <div className="flex justify-center lg:pr-6">

              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(
                    white ${roadmapProgress}%,
                    rgba(255,255,255,0.14) ${roadmapProgress}%
                  )`,
                }}
              >

                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur">

                  <span className="text-3xl font-black">
                    {roadmapProgress}%
                  </span>

                  <span className="mt-1 text-[11px] font-medium text-white/70">
                    completed
                  </span>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ====================================================
            STAT CARDS
        ==================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Roadmap */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <ArrowUpRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />

            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Roadmap Progress
            </p>

            <div className="mt-2 flex items-end justify-between">

              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {roadmapProgress}%
              </p>

              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {roadmapData?.career_title ||
                  'No roadmap'}
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${roadmapProgress}%`,
                }}
              />
            </div>

          </div>

          {/* Steps */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>

              <CheckCircle2 className="h-4 w-4 text-gray-400" />

            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Steps Completed
            </p>

            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              {completedSteps}
              <span className="ml-1 text-lg font-semibold text-gray-400">
                / {totalSteps}
              </span>
            </p>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Roadmap milestones completed
            </p>

          </div>

          {/* Interview score */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>

              <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
                {getScoreLabel(
                  interviewScore
                )}
              </span>

            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Interview Score
            </p>

            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              {interviewScore != null
                ? `${interviewScore}%`
                : '—'}
            </p>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Overall interview average
            </p>

          </div>

          {/* Sessions */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>

              <Clock3 className="h-4 w-4 text-gray-400" />

            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Interview Sessions
            </p>

            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              {interviewSessions}
            </p>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Completed practice sessions
            </p>

          </div>

        </div>

        {/* ====================================================
            CHARTS
        ==================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Roadmap Chart */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Roadmap Steps
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Progress across your career roadmap
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>

            </div>

            {roadmapData?.steps?.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={roadmapData.steps}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="order"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Progress',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                    }}
                  />

                  <Bar
                    dataKey="progress"
                    fill="#6366f1"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[280px] flex-col items-center justify-center text-center">

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No roadmap data yet
                </p>

                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  Complete your career setup to start
                  tracking roadmap progress.
                </p>

              </div>

            )}

          </div>

          {/* Interview Radar */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1e2749] dark:bg-[#111633]">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Interview Performance
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your performance by interview type
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>

            </div>

            {radarData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <RadarChart data={radarData}>

                  <PolarGrid />

                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Score',
                    ]}
                  />

                </RadarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[280px] flex-col items-center justify-center text-center">

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                  <Target className="h-5 w-5 text-gray-400" />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No interview data yet
                </p>

                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  Complete an interview to see your
                  performance breakdown.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* ====================================================
            RECENT ACTIVITY
        ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1e2749] dark:bg-[#111633]">

          <div className="mb-7 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recent Interview Activity
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your latest completed sessions
                </p>

              </div>

            </div>

            <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-400 sm:block">
              Latest 6
            </span>

          </div>

          {completedSessionsList.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>

              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No completed interviews yet
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your interview activity will appear
                here after completing a session.
              </p>

            </div>

          ) : (

            <div className="relative">

              {/* Timeline line */}

              <div className="absolute bottom-5 left-[19px] top-5 hidden w-px bg-gray-200 dark:bg-gray-700 sm:block" />

              <div className="space-y-4">

                {completedSessionsList.map(
                  (item, index) => {

                    const score =
                      item.overall_score != null
                        ? Math.round(
                            Number(
                              item.overall_score
                            )
                          )
                        : null;

                    return (

                      <div
                        key={
                          item.session_id ||
                          item.id ||
                          index
                        }
                        className="group relative flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-gray-800 dark:bg-white/[0.025] dark:hover:border-indigo-900/50 dark:hover:bg-indigo-900/10"
                      >

                        {/* Icon */}

                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-gray-50 bg-emerald-100 dark:border-[#111633] dark:bg-emerald-900/30">

                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">

                                {item.created_at
                                  ? new Date(
                                      item.created_at
                                    ).toLocaleDateString(
                                      undefined,
                                      {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      }
                                    )
                                  : 'Recent'}

                              </p>

                              <p className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">

                                {item.title ||
                                  item.interview_type ||
                                  'Interview Session'}

                              </p>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className="hidden text-xs text-gray-500 sm:block">
                                Completed
                              </span>

                              <span className="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-black text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">

                                {score != null
                                  ? `${score}%`
                                  : '—'}

                              </span>

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )}

        </div>

        {/* ====================================================
            BOTTOM SPACING
        ==================================================== */}

        <div className="h-8" />

      </div>
    </div>
  );
};

export default Progress;