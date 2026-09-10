import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Sparkles,
  Target,
  Brain,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../../services/api';

const Resume = () => {
  const { t } = useTranslation();

  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Optional frontend size validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume file must be smaller than 5MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  // =========================================================
  // UPLOAD + ANALYZE
  // =========================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a resume file first.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');

      const response = await api.uploadResume(selectedFile);

      console.log('Resume API Response:', response);

      if (response?.success && response?.data?.analysis) {
        setAnalysis(response.data.analysis);
        setUploaded(true);
      } else {
        throw new Error('Invalid response from resume API');
      }
    } catch (err) {
      console.error('Resume upload error:', err);

      setError(
        err.message || 'Failed to upload and analyze resume.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleUploadAnother = () => {
    setUploaded(false);
    setSelectedFile(null);
    setAnalysis(null);
    setError('');
  };

  // =========================================================
  // SAFE JSON PARSER
  // =========================================================

  const safeParse = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  // =========================================================
  // SCORE HELPERS
  // =========================================================

  const getScore = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return 0;

    return Math.max(0, Math.min(100, Math.round(number)));
  };

  // =========================================================
  // UPLOAD SCREEN
  // =========================================================

  if (!uploaded) {
    return (
      <div className="relative min-h-full w-full overflow-x-hidden bg-[#070b20] text-white">

        {/* =====================================================
            BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/[0.08] blur-[130px]" />

          <div className="absolute right-[-180px] top-[10%] h-[480px] w-[480px] rounded-full bg-blue-600/[0.07] blur-[150px]" />

          <div className="absolute bottom-[-200px] left-[40%] h-[450px] w-[450px] rounded-full bg-purple-600/[0.06] blur-[140px]" />

        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.10]">

                  <FileText className="h-4 w-4 text-violet-300" />

                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/60">
                  Resume Intelligence
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px]">
                Resume Analyzer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
                Upload your resume and let AI analyze your skills,
                career fit, ATS readiness, and improvement areas.
              </p>

            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 sm:flex">

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                AI Analysis Ready
              </span>

            </div>

          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

            {/* =================================================
                UPLOAD CARD
            ================================================= */}

            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1330]/80 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">

              {/* top glow */}

              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[80px]" />

              <div className="relative p-6 sm:p-10 lg:p-14">

                {/* Upload area */}

                <div className="rounded-[24px] border border-dashed border-violet-400/20 bg-[#090e27]/70 px-5 py-12 text-center transition-all hover:border-violet-400/35 sm:px-10 sm:py-16">

                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-blue-500/10 shadow-[0_0_60px_rgba(139,92,246,0.12)]">

                    {analyzing ? (
                      <RefreshCw className="h-9 w-9 animate-spin text-violet-300" />
                    ) : (
                      <Upload className="h-9 w-9 text-violet-300" />
                    )}

                  </div>

                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    {analyzing
                      ? 'Analyzing your resume...'
                      : 'Upload your resume'}
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
                    {analyzing
                      ? 'Our AI is reviewing your skills, keywords, projects and career compatibility.'
                      : 'Drop your resume here or select a file to get your personalized AI analysis.'}
                  </p>

                  {/* File input */}

                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={analyzing}
                  />

                  <label
                    htmlFor="resume-file"
                    className={`mx-auto mt-7 flex max-w-md cursor-pointer items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold transition-all ${
                      selectedFile
                        ? 'border-violet-400/20 bg-violet-500/[0.08] text-violet-200'
                        : 'border-white/[0.08] bg-white/[0.035] text-white/70 hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white'
                    }`}
                  >

                    <FileText className="h-5 w-5" />

                    <span className="max-w-[280px] truncate">
                      {selectedFile
                        ? selectedFile.name
                        : 'Choose Resume File'}
                    </span>

                  </label>

                  {/* Selected file */}

                  {selectedFile && !analyzing && (

                    <div className="mx-auto mt-4 flex max-w-md items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-left">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">

                          <FileText className="h-4 w-4 text-violet-300" />

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-medium text-white/75">
                            {selectedFile.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-white/25">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() => setSelectedFile(null)}
                        className="rounded-lg p-2 text-white/25 transition hover:bg-red-500/10 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  )}

                  {/* Upload button */}

                  {selectedFile && (

                    <button
                      onClick={handleUpload}
                      disabled={analyzing}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(99,102,241,0.22)] transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {analyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Analyzing Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Upload & Analyze
                        </>
                      )}

                    </button>

                  )}

                  <p className="mt-5 text-[10px] text-white/20">
                    Supported: PDF, DOC, DOCX • Maximum 5MB
                  </p>

                </div>

                {/* Error */}

                {error && (

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/[0.06] p-4">

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                    <p className="text-sm leading-6 text-red-200/80">
                      {error}
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                TIPS CARD
            ================================================= */}

            <div className="space-y-4">

              <div className="rounded-[24px] border border-white/[0.07] bg-[#0d1330]/75 p-6 backdrop-blur-xl">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">

                    <Sparkles className="h-5 w-5 text-violet-300" />

                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-white">
                      Better Analysis
                    </h3>

                    <p className="text-[10px] text-white/30">
                      Make your resume stronger
                    </p>

                  </div>

                </div>

                <div className="space-y-4">

                  {[
                    'Use clear formatting and proper structure',
                    'Include relevant technical skills',
                    'Highlight projects and achievements',
                    'Use keywords related to your target role',
                  ].map((tip, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >

                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">

                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />

                      </div>

                      <p className="text-xs leading-5 text-white/45">
                        {tip}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* AI capabilities */}

              <div className="rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.04] p-6">

                <div className="mb-5 flex items-center gap-2">

                  <Brain className="h-4 w-4 text-violet-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    AI checks
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  {[
                    ['ATS Score', Target],
                    ['Skills', Brain],
                    ['Keywords', Sparkles],
                    ['Career Fit', ArrowUpRight],
                  ].map(([title, Icon]) => (

                    <div
                      key={title}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                    >

                      <Icon className="mb-2 h-4 w-4 text-violet-300/70" />

                      <p className="text-[11px] font-medium text-white/50">
                        {title}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* Privacy */}

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">

                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300/70" />

                <p className="text-[10px] leading-5 text-white/25">
                  Your resume is processed securely for career analysis.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ===========================================================
  // ANALYSIS DATA
  // ===========================================================

  const overallScore = getScore(
    analysis?.overall_score
  );

  const careerFitScore = getScore(
    analysis?.career_fit_score
  );

  const breakdown = {
    'Skill Match': getScore(analysis?.skill_match_score),
    Keywords: getScore(analysis?.keyword_score),
    Projects: getScore(analysis?.projects_score),
    Experience: getScore(analysis?.experience_score),
  };

  const missingSkills = safeParse(
    analysis?.missing_skills
  );

  const detectedSkills = safeParse(
    analysis?.detected_skills
  );

  const recommendations = safeParse(
    analysis?.recommendations
  );

  const careerMatchedSkills = safeParse(
    analysis?.career_matched_skills
  );

  const careerMissingSkills = safeParse(
    analysis?.career_missing_skills
  );

  // ===========================================================
  // SCORE COLOR LABEL
  // ===========================================================

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Needs Work';
  };

  // ===========================================================
  // ANALYSIS SCREEN
  // ===========================================================

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-[#070b20] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-violet-600/[0.07] blur-[140px]" />

        <div className="absolute right-[-150px] top-[20%] h-[450px] w-[450px] rounded-full bg-blue-600/[0.06] blur-[150px]" />

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative mx-auto w-full max-w-[1450px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">

                <FileText className="h-4 w-4 text-violet-300" />

              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/60">
                Resume Intelligence
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Resume Analysis
            </h1>

            <p className="mt-2 text-sm text-white/35">
              AI-powered insights from your resume
            </p>

          </div>

          <button
            onClick={handleUploadAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-medium text-white/55 transition hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white"
          >

            <RefreshCw className="h-3.5 w-3.5" />

            Analyze Another Resume

          </button>

        </div>

        {/* =================================================
            TOP SCORE GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1fr]">

          {/* Overall score */}

          <div className="relative overflow-hidden rounded-[26px] border border-violet-400/10 bg-gradient-to-br from-violet-600/20 via-[#111638] to-blue-600/10 p-6 sm:p-7">

            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/15 blur-[70px]" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Overall Resume Score
                </p>

                <div className="mt-3 flex items-end gap-2">

                  <span className="text-5xl font-bold tracking-tight sm:text-6xl">
                    {overallScore}
                  </span>

                  <span className="mb-2 text-sm text-white/30">
                    /100
                  </span>

                </div>

                <div className="mt-3 inline-flex rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1">

                  <span className="text-[10px] font-semibold text-violet-200">
                    {getScoreLabel(overallScore)}
                  </span>

                </div>

              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/[0.08] bg-white/[0.04]">

                <TrendingUp className="h-9 w-9 text-violet-300" />

              </div>

            </div>

            <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/[0.07]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all duration-700"
                style={{ width: `${overallScore}%` }}
              />

            </div>

          </div>

          {/* Career */}

          <div className="rounded-[26px] border border-white/[0.07] bg-[#0d1330]/80 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                <Target className="h-5 w-5 text-blue-300" />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                  Career Fit
                </p>

                <h3 className="mt-1 text-sm font-bold text-white">
                  {analysis?.career_title || 'Career Profile'}
                </h3>

              </div>

            </div>

            <div className="mt-6 flex items-end gap-2">

              <span className="text-4xl font-bold text-blue-300">
                {careerFitScore}%
              </span>

              <span className="mb-1 text-xs text-white/25">
                match
              </span>

            </div>

            <p className="mt-2 text-xs text-white/30">
              Compatibility with your recommended career path.
            </p>

          </div>

          {/* Secure */}

          <div className="rounded-[26px] border border-white/[0.07] bg-[#0d1330]/80 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                <ShieldCheck className="h-5 w-5 text-emerald-300" />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                  Analysis Status
                </p>

                <h3 className="mt-1 text-sm font-bold text-emerald-300">
                  Completed
                </h3>

              </div>

            </div>

            <p className="mt-6 text-xs leading-5 text-white/30">
              Your resume has been successfully processed and analyzed.
            </p>

          </div>

        </div>

        {/* =================================================
            SCORE BREAKDOWN
        ================================================= */}

        <div className="mt-6 rounded-[26px] border border-white/[0.07] bg-[#0d1330]/75 p-6 sm:p-7">

          <div className="mb-6">

            <div className="flex items-center gap-2">

              <Sparkles className="h-4 w-4 text-violet-300" />

              <h2 className="text-sm font-bold text-white">
                Resume Score Breakdown
              </h2>

            </div>

            <p className="mt-1 text-xs text-white/25">
              Understand how your resume performs across important areas.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Object.entries(breakdown).map(
              ([category, score]) => (

                <div
                  key={category}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-xs font-medium text-white/45">
                      {category}
                    </span>

                    <span className="text-sm font-bold text-violet-300">
                      {score}%
                    </span>

                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all duration-700"
                      style={{ width: `${score}%` }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* =================================================
            CAREER FIT
        ================================================= */}

        {analysis?.career_title && (

          <div className="mt-6 rounded-[26px] border border-white/[0.07] bg-[#0d1330]/75 p-6 sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Target className="h-4 w-4 text-violet-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Recommended Career
                  </span>

                </div>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {analysis.career_title}
                </h2>

              </div>

              <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] px-5 py-3">

                <p className="text-[9px] uppercase tracking-wider text-white/25">
                  Career Match
                </p>

                <p className="mt-1 text-2xl font-bold text-violet-300">
                  {careerFitScore}%
                </p>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Matched */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
                    Matched Skills
                  </h3>

                </div>

                <div className="flex flex-wrap gap-2">

                  {careerMatchedSkills.length > 0 ? (

                    careerMatchedSkills.map(
                      (skill, index) => (

                        <span
                          key={index}
                          className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-200/80"
                        >
                          {skill}
                        </span>

                      )
                    )

                  ) : (

                    <p className="text-xs text-white/25">
                      No matched skills yet.
                    </p>

                  )}

                </div>

              </div>

              {/* Missing */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <AlertCircle className="h-4 w-4 text-orange-300" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-300/80">
                    Skills To Develop
                  </h3>

                </div>

                <div className="flex flex-wrap gap-2">

                  {careerMissingSkills.length > 0 ? (

                    careerMissingSkills.map(
                      (skill, index) => (

                        <span
                          key={index}
                          className="rounded-xl border border-orange-400/10 bg-orange-400/[0.06] px-3 py-2 text-xs text-orange-200/80"
                        >
                          {skill}
                        </span>

                      )
                    )

                  ) : (

                    <p className="text-xs text-white/25">
                      No skill gaps found.
                    </p>

                  )}

                </div>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            SKILLS + MISSING
        ================================================= */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Detected */}

          <div className="rounded-[26px] border border-white/[0.07] bg-[#0d1330]/75 p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">

                <Brain className="h-5 w-5 text-indigo-300" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-white">
                  Detected Skills
                </h2>

                <p className="text-[10px] text-white/25">
                  Skills found in your resume
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {detectedSkills.length > 0 ? (

                detectedSkills.map(
                  (skill, index) => (

                    <span
                      key={index}
                      className="rounded-xl border border-indigo-400/10 bg-indigo-500/[0.07] px-3 py-2 text-xs font-medium text-indigo-200/80"
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <p className="text-xs text-white/25">
                  No skills detected.
                </p>

              )}

            </div>

          </div>

          {/* Missing */}

          <div className="rounded-[26px] border border-white/[0.07] bg-[#0d1330]/75 p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">

                <AlertCircle className="h-5 w-5 text-orange-300" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-white">
                  Missing Skills
                </h2>

                <p className="text-[10px] text-white/25">
                  Recommended skills to improve
                </p>

              </div>

            </div>

            <div className="space-y-2">

              {missingSkills.length > 0 ? (

                missingSkills.map(
                  (skill, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-orange-400/[0.07] bg-orange-400/[0.035] px-3 py-2.5"
                    >

                      <div className="h-1.5 w-1.5 rounded-full bg-orange-300" />

                      <span className="text-xs text-white/55">
                        {skill}
                      </span>

                    </div>

                  )
                )

              ) : (

                <p className="text-xs text-white/25">
                  No missing skills detected.
                </p>

              )}

            </div>

          </div>

        </div>

        {/* =================================================
            AI RECOMMENDATIONS
        ================================================= */}

        <div className="mt-6 rounded-[26px] border border-white/[0.07] bg-[#0d1330]/75 p-6 sm:p-7">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">

                <TrendingUp className="h-5 w-5 text-violet-300" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-white">
                  AI Recommendations
                </h2>

                <p className="text-[10px] text-white/25">
                  Personalized improvements for your resume
                </p>

              </div>

            </div>

            <Sparkles className="hidden h-5 w-5 text-violet-300/40 sm:block" />

          </div>

          <div className="grid grid-cols-1 gap-3">

            {recommendations.length > 0 ? (

              recommendations.map(
                (recommendation, index) => (

                  <div
                    key={index}
                    className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all hover:border-violet-400/10 hover:bg-violet-500/[0.035]"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-300">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-6 text-white/55">
                      {recommendation}
                    </p>

                    <ArrowUpRight className="ml-auto mt-1 hidden h-4 w-4 shrink-0 text-white/15 group-hover:text-violet-300/50 sm:block" />

                  </div>

                )
              )

            ) : (

              <p className="text-sm text-white/25">
                No recommendations available.
              </p>

            )}

          </div>

        </div>

        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        <div className="mt-6 flex justify-center">

          <button
            onClick={handleUploadAnother}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-xs font-semibold text-white/50 transition-all hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white"
          >

            <Upload className="h-4 w-4" />

            Upload Another Resume

          </button>

        </div>

      </div>

    </div>
  );
};

export default Resume;