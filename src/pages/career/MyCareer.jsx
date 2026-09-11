import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Target,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ai-career-mentor-m2id.onrender.com/api/v1';

/* =====================================================
   TOKEN HELPER
===================================================== */

const getToken = () => {
  return (
    localStorage.getItem('ra_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('ai-nexus-token') ||
    ''
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const MyCareer = () => {
  const navigate = useNavigate();

  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  /* =====================================================
     FETCH MY CAREER
  ===================================================== */

  useEffect(() => {
    fetchMyCareer();
  }, []);

  const fetchMyCareer = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        );
      }

      const response = await fetch(
        `${API_BASE}/career/my-career`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        setCareerData(null);
        return;
      }

      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail || 'Failed to fetch career'
        );
      }

      if (!result?.data) {
        throw new Error('Career data not found.');
      }

      setCareerData(result.data);
    } catch (err) {
      console.error('My Career Error:', err);

      setError(
        err.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     GENERATE ROADMAP
  ===================================================== */

  const handleViewRoadmap = async () => {
    try {
      setGeneratingRoadmap(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        );
      }

      if (!careerData) {
        throw new Error(
          'Career information not available.'
        );
      }

      const selectedCareer = careerData.career || {};

      const careerId =
        selectedCareer.id ||
        selectedCareer.career_id ||
        careerData.career_id ||
        careerData.id;

      if (!careerId) {
        throw new Error(
          'Career ID not found. Please complete Career Discovery again.'
        );
      }

      const response = await fetch(
        `${API_BASE}/roadmap/generate`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            career_id: careerId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail ||
          result?.message ||
          'Failed to generate roadmap'
        );
      }

      navigate('/roadmap');
    } catch (err) {
      console.error(
        'Roadmap Generation Error:',
        err
      );

      alert(
        err.message ||
        'Unable to generate roadmap'
      );
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  /* =====================================================
     START LEARNING
  ===================================================== */

  const handleStartLearning = async () => {
    await handleViewRoadmap();
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-indigo-600/30 rounded-full" />

          <Loader2 className="relative w-12 h-12 animate-spin text-indigo-400" />
        </div>

        <p className="mt-5 text-sm text-gray-400">
          Loading your career path...
        </p>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="relative max-w-md w-full">

          <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full" />

          <div className="relative rounded-3xl border border-red-500/20 bg-[#111633]/80 backdrop-blur-xl p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-3">
              Unable to Load Career
            </h2>

            <p className="text-sm text-red-400 mb-6">
              {error}
            </p>

            <button
              onClick={fetchMyCareer}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     NO CAREER
  ===================================================== */

  if (!careerData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="relative max-w-md w-full text-center">

          <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full" />

          <div className="relative rounded-3xl border border-white/10 bg-[#111633]/70 backdrop-blur-xl p-10">

            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Target className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Discover Your Career Path
            </h2>

            <p className="text-gray-400 mb-7">
              Complete your career assessment to discover
              your personalized career direction.
            </p>

            <button
              onClick={() =>
                navigate('/career-discovery')
              }
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Take Career Discovery
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     CAREER DATA
  ===================================================== */

  const career = careerData.career || {};

  const careerName =
    career.career_name ||
    career.name ||
    career.title ||
    careerData.career_name ||
    careerData.name ||
    'Recommended Career';

  const careerDescription =
    career.description ||
    careerData.description ||
    '';

  const matchScore = Number(
    careerData.match_score ??
    careerData.match_percentage ??
    careerData.score ??
    0
  );

  const averageSalary =
    career.avg_salary ||
    career.average_salary ||
    careerData.avg_salary ||
    careerData.average_salary ||
    'Not Available';

  const experienceLevel =
    career.experience_level ||
    career.level ||
    careerData.experience_level ||
    careerData.level ||
    'Fresher';

  const matchedSkills =
    careerData.matched_skills || [];

  const missingSkills =
    careerData.missing_skills || [];

  const jobReadiness =
    careerData.job_readiness !== undefined
      ? Number(careerData.job_readiness)
      : null;

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="relative min-h-screen p-4 md:p-8 overflow-hidden">

      {/* Background Glow */}

      <div className="pointer-events-none fixed top-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="pointer-events-none fixed bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="relative max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 mb-3">

              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>

              <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-300">
                Career Intelligence
              </span>

            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              My Career Path
            </h1>

            <p className="mt-3 text-gray-400">
              Your personalized AI-powered career direction
            </p>

          </div>

          <button
            onClick={() =>
              navigate('/career-discovery')
            }
            className="w-fit px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07] transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reassess
          </button>

        </div>

        {/* =================================================
            HERO CAREER CARD
        ================================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#171b48] via-[#121632] to-[#0e122c] p-6 md:p-9 mb-7 shadow-2xl">

          {/* Glow */}

          <div className="absolute -top-32 -right-20 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full" />

          <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full" />

          <div className="relative">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

              {/* Career Info */}

              <div className="flex-1">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-5">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-xs font-semibold text-emerald-300">
                    Career Match Found
                  </span>

                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
                  {careerName}
                </h2>

                {careerDescription && (
                  <p className="max-w-2xl text-gray-300 leading-relaxed">
                    {careerDescription}
                  </p>
                )}

              </div>

              {/* Match Score */}

              <div className="flex-shrink-0">

                <div className="relative w-36 h-36">

                  <svg
                    className="w-36 h-36 -rotate-90"
                    viewBox="0 0 120 120"
                  >

                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-white/10"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${(matchScore / 100) * 327} 327`}
                      className="text-indigo-400"
                    />

                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-3xl font-bold text-white">
                      {Math.round(matchScore)}%
                    </span>

                    <span className="text-[11px] uppercase tracking-wider text-gray-400">
                      Match
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Stats */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>

                  <span className="text-xs text-gray-400">
                    Average Salary
                  </span>

                </div>

                <p className="text-lg font-bold text-white">
                  {averageSalary}
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  </div>

                  <span className="text-xs text-gray-400">
                    Experience Level
                  </span>

                </div>

                <p className="text-lg font-bold text-white">
                  {experienceLevel}
                </p>

              </div>

              {jobReadiness !== null && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>

                    <span className="text-xs text-gray-400">
                      Job Readiness
                    </span>

                  </div>

                  <p className="text-lg font-bold text-white">
                    {jobReadiness}%
                  </p>

                </div>
              )}

            </div>

          </div>
        </div>

        {/* =================================================
            SKILLS
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">

          {/* Matched Skills */}

          <div className="rounded-3xl border border-white/10 bg-[#111633]/70 backdrop-blur-xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Matched Skills
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Skills you already have
                  </p>
                </div>

              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                {matchedSkills.length}
              </span>

            </div>

            {matchedSkills.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                {matchedSkills.map((skill, index) => (

                  <div
                    key={`${skill}-${index}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04]"
                  >

                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />

                    <span className="text-sm text-gray-300">
                      {skill}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center text-sm text-gray-500">
                No matched skills found yet.
              </div>

            )}

          </div>

          {/* Missing Skills */}

          <div className="rounded-3xl border border-white/10 bg-[#111633]/70 backdrop-blur-xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-400" />
                </div>

                <div>

                  <h3 className="font-bold text-white">
                    Skills to Learn
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Skills to improve your career match
                  </p>

                </div>

              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400">
                {missingSkills.length}
              </span>

            </div>

            {missingSkills.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                {missingSkills.map((skill, index) => (

                  <div
                    key={`${skill}-${index}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-500/10 bg-orange-500/[0.04]"
                  >

                    <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />

                    <span className="text-sm text-gray-300">
                      {skill}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center text-sm text-gray-500">
                No missing skills. Great job!
              </div>

            )}

          </div>

        </div>

        {/* =================================================
            ROADMAP CTA
        ================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-indigo-400/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-cyan-500/10 p-6 md:p-8 mb-7">

          <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-3">

                <Sparkles className="w-4 h-4 text-indigo-400" />

                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  Your Next Move
                </span>

              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to build your roadmap?
              </h2>

              <p className="text-sm text-gray-400 max-w-xl">
                Turn your career goal into a step-by-step learning
                journey designed around your current skills.
              </p>

            </div>

            <button
              onClick={handleViewRoadmap}
              disabled={generatingRoadmap}
              className="flex-shrink-0 px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >

              {generatingRoadmap ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  View Roadmap
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <button
            onClick={handleStartLearning}
            disabled={generatingRoadmap}
            className="group p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-left"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>

                <div>

                  <h3 className="font-bold text-white">
                    Start Learning
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Follow your personalized roadmap
                  </p>

                </div>

              </div>

              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />

            </div>

          </button>

          <button
            onClick={() =>
              navigate('/career-discovery')
            }
            className="group p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-left"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </div>

                <div>

                  <h3 className="font-bold text-white">
                    Explore Another Career
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Retake the career assessment
                  </p>

                </div>

              </div>

              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />

            </div>

          </button>

        </div>

      </div>
    </div>
  );
};

export default MyCareer;