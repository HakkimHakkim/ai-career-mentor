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
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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

      const sessions = data?.data || data?.sessions || [];

      setRecentSessions(
        Array.isArray(sessions) ? sessions : []
      );
    } catch (error) {
      console.error('fetchRecentSessions error:', error);
      setRecentSessions([]);
    }
  };

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const roadmapProgress =
    roadmapData?.overall_progress != null
      ? Math.round(Number(roadmapData.overall_progress))
      : 0;

  const totalSteps = roadmapData?.steps?.length || 0;

  const completedSteps =
    roadmapData?.steps?.filter(
      (step) => step.status === 'completed'
    ).length || 0;

  const interviewScore =
    interviewReport?.overall_score != null
      ? Math.round(Number(interviewReport.overall_score))
      : null;

  const interviewSessions =
    interviewReport?.total_sessions || 0;

  const radarData = Object.entries(
    interviewReport?.by_type || {}
  ).map(([type, score]) => ({
    skill: type,
    value: Number(score) || 0,
  }));

  const completedSessionsList = recentSessions
    .filter((session) => session.status === 'completed')
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
    <div className="min-h-full w-full bg-[#F6F1E8] text-[#173B32]">

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173B32] text-white">
                <Activity className="h-4 w-4" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#78927A]">
                Learning Dashboard
              </span>

            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#173B32] sm:text-4xl">
              Your Progress
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736B] sm:text-base">
              Follow your learning journey, monitor interview
              performance, and keep moving toward your career goal.
            </p>

          </div>

          {/* Current goal */}

          <div className="flex items-center gap-3 rounded-2xl border border-[#D9D2C5] bg-[#FFFDF8] px-4 py-3 shadow-[0_4px_16px_rgba(23,59,50,0.06)]">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4B84A]/20">
              <Trophy className="h-5 w-5 text-[#A8790B]" />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">
                Current Goal
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-sm font-bold text-[#173B32]">
                {roadmapData?.career_title || 'Build your career'}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            EDUCATION HERO
        ====================================================== */}

        <div className="relative mb-7 overflow-hidden rounded-[28px] bg-[#173B32] p-6 text-white shadow-[0_12px_30px_rgba(23,59,50,0.15)] sm:p-8">

          {/* Decorative manual shapes */}

          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border-[22px] border-[#E4B84A]/20" />

          <div className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-[#D66A4A]/10" />

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-1/2 bg-white/10" />

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

            {/* Left */}

            <div>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <TrendingUp className="h-5 w-5 text-[#E4B84A]" />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                    Overall Roadmap Progress
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white/85">
                    {roadmapData?.career_title || 'Career Roadmap'}
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-end gap-5">

                <h2 className="text-6xl font-black tracking-tight sm:text-7xl">
                  {roadmapProgress}%
                </h2>

                <div className="pb-2">

                  <p className="text-base font-bold">

                    {roadmapProgress >= 80
                      ? 'Almost there!'
                      : roadmapProgress >= 50
                      ? 'Great progress!'
                      : 'Keep going!'}

                  </p>

                  <p className="mt-1 text-xs text-white/55">
                    {completedSteps} of {totalSteps} roadmap steps completed
                  </p>

                </div>

              </div>

              {/* Progress bar */}

              <div className="mt-7 max-w-2xl">

                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/55">

                  <span>Learning journey</span>

                  <span>{roadmapProgress}%</span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-[#E4B84A] transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, roadmapProgress)
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Right education summary */}

            <div className="flex items-center justify-center lg:justify-end">

              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[14px] border-[#E4B84A]/20">

                <div
                  className="absolute inset-[-14px] rounded-full"
                  style={{
                    background: `conic-gradient(
                      #E4B84A ${roadmapProgress}%,
                      transparent ${roadmapProgress}%
                    )`,
                    mask:
                      'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                    maskComposite: 'exclude',
                    padding: '14px',
                  }}
                />

                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#21483D]">

                  <span className="text-4xl font-black">
                    {roadmapProgress}%
                  </span>

                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
                    Completed
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Roadmap */}

          <div className="group border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(23,59,50,0.09)]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4B84A]/20">
                <TrendingUp className="h-5 w-5 text-[#A8790B]" />
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#A3AAA4] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />

            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">
              Roadmap Progress
            </p>

            <div className="mt-2 flex items-end justify-between gap-2">

              <p className="text-3xl font-black text-[#173B32]">
                {roadmapProgress}%
              </p>

              <span className="max-w-[120px] truncate text-xs font-bold text-[#78927A]">
                {roadmapData?.career_title || 'No roadmap'}
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E9E3D8]">

              <div
                className="h-full rounded-full bg-[#E4B84A]"
                style={{
                  width: `${roadmapProgress}%`,
                }}
              />

            </div>

          </div>

          {/* Steps */}

          <div className="group border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(23,59,50,0.09)]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#78927A]/15">
                <BookOpen className="h-5 w-5 text-[#58735B]" />
              </div>

              <CheckCircle2 className="h-4 w-4 text-[#78927A]" />

            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">
              Steps Completed
            </p>

            <p className="mt-2 text-3xl font-black text-[#173B32]">
              {completedSteps}

              <span className="ml-1 text-lg font-semibold text-[#A3AAA4]">
                / {totalSteps}
              </span>
            </p>

            <p className="mt-2 text-xs text-[#66736B]">
              Roadmap milestones completed
            </p>

          </div>

          {/* Interview score */}

          <div className="group border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(23,59,50,0.09)]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D66A4A]/12">
                <Target className="h-5 w-5 text-[#C35738]" />
              </div>

              <span className="rounded-full bg-[#D66A4A]/10 px-2.5 py-1 text-[10px] font-bold text-[#B64D31]">
                {getScoreLabel(interviewScore)}
              </span>

            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">
              Interview Score
            </p>

            <p className="mt-2 text-3xl font-black text-[#173B32]">
              {interviewScore != null
                ? `${interviewScore}%`
                : '—'}
            </p>

            <p className="mt-2 text-xs text-[#66736B]">
              Overall interview average
            </p>

          </div>

          {/* Sessions */}

          <div className="group border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(23,59,50,0.09)]">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173B32]/10">
                <Zap className="h-5 w-5 text-[#173B32]" />
              </div>

              <Clock3 className="h-4 w-4 text-[#A3AAA4]" />

            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">
              Interview Sessions
            </p>

            <p className="mt-2 text-3xl font-black text-[#173B32]">
              {interviewSessions}
            </p>

            <p className="mt-2 text-xs text-[#66736B]">
              Completed practice sessions
            </p>

          </div>

        </div>

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* Roadmap Chart */}

          <div className="border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] sm:p-6">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-lg font-black text-[#173B32]">
                    Roadmap Steps
                  </h3>

                  <span className="rounded-full bg-[#E4B84A]/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8A6808]">
                    Learning
                  </span>

                </div>

                <p className="mt-1 text-xs text-[#66736B]">
                  Progress across your career roadmap
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173B32]/10">
                <BookOpen className="h-4 w-4 text-[#173B32]" />
              </div>

            </div>

            {roadmapData?.steps?.length > 0 ? (

              <ResponsiveContainer width="100%" height={280}>

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
                    stroke="#E5DED2"
                  />

                  <XAxis
                    dataKey="order"
                    tick={{
                      fontSize: 12,
                      fill: '#66736B',
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                      fill: '#8A948D',
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Progress',
                    ]}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #D9D2C5',
                      background: '#FFFDF8',
                      color: '#173B32',
                    }}
                  />

                  <Bar
                    dataKey="progress"
                    fill="#D66A4A"
                    radius={[7, 7, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[280px] flex-col items-center justify-center text-center">

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EBE1]">
                  <BookOpen className="h-5 w-5 text-[#78927A]" />
                </div>

                <p className="text-sm font-bold text-[#173B32]">
                  No roadmap data yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-[#66736B]">
                  Complete your career setup to start tracking roadmap progress.
                </p>

              </div>

            )}

          </div>

          {/* Interview Radar */}

          <div className="border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] sm:p-6">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-lg font-black text-[#173B32]">
                    Interview Performance
                  </h3>

                  <span className="rounded-full bg-[#D66A4A]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#B64D31]">
                    Skills
                  </span>

                </div>

                <p className="mt-1 text-xs text-[#66736B]">
                  Your performance by interview type
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D66A4A]/10">
                <Target className="h-4 w-4 text-[#C35738]" />
              </div>

            </div>

            {radarData.length > 0 ? (

              <ResponsiveContainer width="100%" height={280}>

                <RadarChart data={radarData}>

                  <PolarGrid stroke="#DDD5C8" />

                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{
                      fontSize: 11,
                      fill: '#66736B',
                    }}
                  />

                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 9,
                      fill: '#9AA19B',
                    }}
                  />

                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#173B32"
                    fill="#78927A"
                    fillOpacity={0.4}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Score',
                    ]}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #D9D2C5',
                      background: '#FFFDF8',
                    }}
                  />

                </RadarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-[280px] flex-col items-center justify-center text-center">

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EBE1]">
                  <Target className="h-5 w-5 text-[#78927A]" />
                </div>

                <p className="text-sm font-bold text-[#173B32]">
                  No interview data yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-[#66736B]">
                  Complete an interview to see your performance breakdown.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* =====================================================
            RECENT ACTIVITY
        ====================================================== */}

        <div className="border border-[#D9D2C5] bg-[#FFFDF8] p-5 shadow-[0_4px_16px_rgba(23,59,50,0.05)] sm:p-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#78927A]/15">
                <Calendar className="h-5 w-5 text-[#58735B]" />
              </div>

              <div>

                <h3 className="text-lg font-black text-[#173B32]">
                  Recent Interview Activity
                </h3>

                <p className="text-xs text-[#66736B]">
                  Your latest completed sessions
                </p>

              </div>

            </div>

            <span className="w-fit rounded-full bg-[#F0EBE1] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#66736B]">
              Latest 6
            </span>

          </div>

          {completedSessionsList.length === 0 ? (

            <div className="border border-dashed border-[#D9D2C5] bg-[#F8F4EC] p-10 text-center">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9E3D8]">
                <Calendar className="h-5 w-5 text-[#78927A]" />
              </div>

              <p className="text-sm font-bold text-[#173B32]">
                No completed interviews yet
              </p>

              <p className="mt-1 text-xs text-[#66736B]">
                Your interview activity will appear here after completing a session.
              </p>

            </div>

          ) : (

            <div className="relative">

              {/* Timeline */}

              <div className="absolute bottom-5 left-[19px] top-5 hidden w-px bg-[#D9D2C5] sm:block" />

              <div className="space-y-3">

                {completedSessionsList.map(
                  (item, index) => {

                    const score =
                      item.overall_score != null
                        ? Math.round(
                            Number(item.overall_score)
                          )
                        : null;

                    return (

                      <div
                        key={
                          item.session_id ||
                          item.id ||
                          index
                        }
                        className="group relative flex gap-4 border border-[#E5DED2] bg-[#F9F6EF] p-4 transition-all hover:border-[#78927A] hover:bg-[#F4F0E7]"
                      >

                        {/* Timeline icon */}

                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-[#F9F6EF] bg-[#78927A]/15">

                          <CheckCircle2 className="h-4 w-4 text-[#58735B]" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A948D]">

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

                              <p className="mt-1 truncate text-sm font-black text-[#173B32]">

                                {item.title ||
                                  item.interview_type ||
                                  'Interview Session'}

                              </p>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className="hidden text-xs font-medium text-[#8A948D] sm:block">
                                Completed
                              </span>

                              <span className="rounded-lg bg-[#173B32] px-3 py-1.5 text-sm font-black text-white">

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

        <div className="h-8" />

      </div>
    </div>
  );
};

export default Progress;