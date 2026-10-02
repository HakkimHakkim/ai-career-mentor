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
  `${import.meta.env.VITE_API_BASE_URL || 'https://ai-career-mentor-m2id.onrender.com'}/api/v1`;

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F6F1E8]">
        <div className="w-14 h-14 rounded-xl bg-[#FFFDF8] border border-[#DED8CC] flex items-center justify-center shadow-[0_2px_10px_rgba(23,59,50,0.08)]">
          <Loader2 className="w-7 h-7 animate-spin text-[#D66A4A]" />
        </div>

        <p className="mt-5 text-sm text-[#66736B]">
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
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F6F1E8]">
        <div className="max-w-md w-full">

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-8 text-center shadow-[0_2px_12px_rgba(23,59,50,0.08)]">

            <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-[#B94F35]/10 border border-[#B94F35]/20 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-[#B94F35]" />
            </div>

            <h2 className="text-xl font-bold text-[#173B32] mb-3">
              Unable to Load Career
            </h2>

            <p className="text-sm text-[#B94F35] mb-6">
              {error}
            </p>

            <button
              onClick={fetchMyCareer}
              className="w-full py-3 rounded-xl bg-[#D66A4A] text-[#FFFDF8] font-semibold hover:bg-[#C45C3D] transition-colors"
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
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F6F1E8]">
        <div className="max-w-md w-full text-center">

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-10 shadow-[0_2px_12px_rgba(23,59,50,0.08)]">

            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#173B32] flex items-center justify-center">
              <Target className="w-10 h-10 text-[#E4B84A]" />
            </div>

            <h2 className="text-2xl font-bold text-[#173B32] mb-3">
              Discover Your Career Path
            </h2>

            <p className="text-[#66736B] mb-7">
              Complete your career assessment to discover
              your personalized career direction.
            </p>

            <button
              onClick={() =>
                navigate('/career-discovery')
              }
              className="w-full bg-[#D66A4A] text-[#FFFDF8] py-3.5 rounded-xl font-semibold hover:bg-[#C45C3D] transition-colors flex items-center justify-center gap-2"
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
    <div className="min-h-screen p-4 md:p-8 bg-[#F6F1E8] text-[#173B32]">

      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8 pb-8 border-b border-[#DED8CC]">

          <div>

            <div className="flex items-center gap-2 mb-3">

              <div className="w-8 h-8 rounded-lg bg-[#E4B84A]/20 border border-[#E4B84A]/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#173B32]" />
              </div>

              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#D66A4A]">
                Career Intelligence
              </span>

            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#173B32] tracking-tight">
              My Career Path
            </h1>

            <p className="mt-3 text-[#66736B]">
              Your personalized AI-powered career direction
            </p>

          </div>

          <button
            onClick={() =>
              navigate('/career-discovery')
            }
            className="w-fit px-4 py-2.5 rounded-xl border border-[#173B32] bg-[#FFFDF8] text-[#173B32] text-sm font-semibold hover:bg-[#173B32]/5 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reassess
          </button>

        </div>

        {/* =================================================
            HERO CAREER CARD
        ================================================= */}

        <div className="relative overflow-hidden rounded-2xl bg-[#173B32] p-6 md:p-9 mb-7 shadow-[0_6px_20px_rgba(23,59,50,0.18)]">

          <div className="relative">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

              {/* Career Info */}

              <div className="flex-1">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4B84A]/15 border border-[#E4B84A]/40 mb-5">

                  <span className="w-2 h-2 rounded-full bg-[#E4B84A]" />

                  <span className="text-xs font-semibold text-[#E4B84A]">
                    Career Match Found
                  </span>

                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-[#F6F1E8] mb-5">
                  {careerName}
                </h2>

                {careerDescription && (
                  <p className="max-w-2xl text-[#F6F1E8]/75 leading-relaxed">
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
                      className="text-[#F6F1E8]/15"
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
                      className="text-[#E4B84A]"
                    />

                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-3xl font-bold text-[#F6F1E8]">
                      {Math.round(matchScore)}%
                    </span>

                    <span className="text-[11px] uppercase tracking-wider text-[#F6F1E8]/60">
                      Match
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Stats */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">

              <div className="rounded-xl border border-[#F6F1E8]/15 bg-[#F6F1E8]/10 p-5">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-10 h-10 rounded-lg bg-[#F6F1E8]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#E4B84A]" />
                  </div>

                  <span className="text-xs text-[#F6F1E8]/65">
                    Average Salary
                  </span>

                </div>

                <p className="text-lg font-bold text-[#F6F1E8]">
                  {averageSalary}
                </p>

              </div>

              <div className="rounded-xl border border-[#F6F1E8]/15 bg-[#F6F1E8]/10 p-5">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-10 h-10 rounded-lg bg-[#F6F1E8]/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#E4B84A]" />
                  </div>

                  <span className="text-xs text-[#F6F1E8]/65">
                    Experience Level
                  </span>

                </div>

                <p className="text-lg font-bold text-[#F6F1E8]">
                  {experienceLevel}
                </p>

              </div>

              {jobReadiness !== null && (
                <div className="rounded-xl border border-[#F6F1E8]/15 bg-[#F6F1E8]/10 p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="w-10 h-10 rounded-lg bg-[#F6F1E8]/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#E4B84A]" />
                    </div>

                    <span className="text-xs text-[#F6F1E8]/65">
                      Job Readiness
                    </span>

                  </div>

                  <p className="text-lg font-bold text-[#F6F1E8]">
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

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-[#78927A]/15 border border-[#78927A]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#78927A]" />
                </div>

                <div>
                  <h3 className="font-bold text-[#173B32]">
                    Matched Skills
                  </h3>

                  <p className="text-xs text-[#8A948D] mt-1">
                    Skills you already have
                  </p>
                </div>

              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#78927A]/15 text-[#173B32]">
                {matchedSkills.length}
              </span>

            </div>

            {matchedSkills.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                {matchedSkills.map((skill, index) => (

                  <div
                    key={`${skill}-${index}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#78927A]/30 bg-[#78927A]/10"
                  >

                    <CheckCircle2 className="w-4 h-4 text-[#78927A] flex-shrink-0" />

                    <span className="text-sm text-[#173B32]">
                      {skill}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center text-sm text-[#8A948D]">
                No matched skills found yet.
              </div>

            )}

          </div>

          {/* Missing Skills */}

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-[#D66A4A]/10 border border-[#D66A4A]/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#D66A4A]" />
                </div>

                <div>

                  <h3 className="font-bold text-[#173B32]">
                    Skills to Learn
                  </h3>

                  <p className="text-xs text-[#8A948D] mt-1">
                    Skills to improve your career match
                  </p>

                </div>

              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D66A4A]/10 text-[#B94F35]">
                {missingSkills.length}
              </span>

            </div>

            {missingSkills.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                {missingSkills.map((skill, index) => (

                  <div
                    key={`${skill}-${index}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#D66A4A]/25 bg-[#D66A4A]/[0.07]"
                  >

                    <span className="w-2 h-2 rounded-full bg-[#D66A4A] flex-shrink-0" />

                    <span className="text-sm text-[#173B32]">
                      {skill}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center text-sm text-[#8A948D]">
                No missing skills. Great job!
              </div>

            )}

          </div>

        </div>

        {/* =================================================
            ROADMAP CTA
        ================================================= */}

        <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 md:p-8 mb-7 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-3">

                <Sparkles className="w-4 h-4 text-[#E4B84A]" />

                <span className="text-xs font-bold uppercase tracking-widest text-[#D66A4A]">
                  Your Next Move
                </span>

              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[#173B32] mb-2">
                Ready to build your roadmap?
              </h2>

              <p className="text-sm text-[#66736B] max-w-xl">
                Turn your career goal into a step-by-step learning
                journey designed around your current skills.
              </p>

            </div>

            <button
              onClick={handleViewRoadmap}
              disabled={generatingRoadmap}
              className="flex-shrink-0 px-6 py-3.5 rounded-xl bg-[#D66A4A] text-[#FFFDF8] font-bold hover:bg-[#C45C3D] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
            className="group p-5 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] hover:border-[#173B32] hover:shadow-[0_4px_14px_rgba(23,59,50,0.1)] transition-all text-left"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-[#E4B84A]/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#173B32]" />
                </div>

                <div>

                  <h3 className="font-bold text-[#173B32]">
                    Start Learning
                  </h3>

                  <p className="text-xs text-[#8A948D] mt-1">
                    Follow your personalized roadmap
                  </p>

                </div>

              </div>

              <ArrowRight className="w-5 h-5 text-[#8A948D] group-hover:text-[#D66A4A] group-hover:translate-x-1 transition" />

            </div>

          </button>

          <button
            onClick={() =>
              navigate('/career-discovery')
            }
            className="group p-5 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] hover:border-[#173B32] hover:shadow-[0_4px_14px_rgba(23,59,50,0.1)] transition-all text-left"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-[#D66A4A]/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[#D66A4A]" />
                </div>

                <div>

                  <h3 className="font-bold text-[#173B32]">
                    Explore Another Career
                  </h3>

                  <p className="text-xs text-[#8A948D] mt-1">
                    Retake the career assessment
                  </p>

                </div>

              </div>

              <ArrowRight className="w-5 h-5 text-[#8A948D] group-hover:text-[#D66A4A] group-hover:translate-x-1 transition" />

            </div>

          </button>

        </div>

      </div>
    </div>
  );
};

export default MyCareer;