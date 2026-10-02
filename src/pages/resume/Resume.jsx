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
      <div className="min-h-full w-full overflow-x-hidden bg-[#F6F1E8] text-[#173B32]">

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 border-b border-[#DED8CC] pb-8 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4B84A]/40 bg-[#E4B84A]/20">

                  <FileText className="h-4 w-4 text-[#173B32]" />

                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D66A4A]">
                  Resume Intelligence
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#173B32] sm:text-4xl lg:text-[42px]">
                Resume Analyzer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736B] sm:text-base">
                Upload your resume and let AI analyze your skills,
                career fit, ATS readiness, and improvement areas.
              </p>

            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#78927A]/40 bg-[#78927A]/15 px-3 py-2 sm:flex">

              <span className="h-2 w-2 rounded-full bg-[#78927A]" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#173B32]">
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

            <div className="overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] shadow-[0_2px_10px_rgba(23,59,50,0.07)]">

              <div className="p-6 sm:p-10 lg:p-14">

                {/* Upload area */}

                <div className="rounded-2xl border border-dashed border-[#78927A] bg-[#F6F1E8]/60 px-5 py-12 text-center transition-colors hover:border-[#D66A4A] sm:px-10 sm:py-16">

                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D66A4A]/20 bg-[#D66A4A]/10">

                    {analyzing ? (
                      <RefreshCw className="h-9 w-9 animate-spin text-[#D66A4A]" />
                    ) : (
                      <Upload className="h-9 w-9 text-[#D66A4A]" />
                    )}

                  </div>

                  <h2 className="text-xl font-bold text-[#173B32] sm:text-2xl">
                    {analyzing
                      ? 'Analyzing your resume...'
                      : 'Upload your resume'}
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#66736B]">
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
                    className={`mx-auto mt-7 flex max-w-md cursor-pointer items-center justify-center gap-3 rounded-xl border px-5 py-4 text-sm font-semibold transition-colors ${
                      selectedFile
                        ? 'border-[#173B32] bg-[#FFFDF8] text-[#173B32]'
                        : 'border-[#DED8CC] bg-[#FFFDF8] text-[#173B32] hover:border-[#173B32] hover:bg-[#173B32]/5'
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

                    <div className="mx-auto mt-4 flex max-w-md items-center justify-between rounded-xl border border-[#DED8CC] bg-[#FFFDF8] px-4 py-3 text-left">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E4B84A]/20">

                          <FileText className="h-4 w-4 text-[#173B32]" />

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-medium text-[#173B32]">
                            {selectedFile.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#8A948D]">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() => setSelectedFile(null)}
                        className="rounded-lg p-2 text-[#8A948D] transition hover:bg-[#B94F35]/10 hover:text-[#B94F35]"
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
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D66A4A] px-7 py-3.5 text-sm font-semibold text-[#FFFDF8] shadow-[0_2px_8px_rgba(214,106,74,0.25)] transition-colors hover:bg-[#C45C3D] disabled:cursor-not-allowed disabled:opacity-50"
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

                  <p className="mt-5 text-[11px] text-[#8A948D]">
                    Supported: PDF, DOC, DOCX • Maximum 5MB
                  </p>

                </div>

                {/* Error */}

                {error && (

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#B94F35]/30 bg-[#B94F35]/10 p-4">

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B94F35]" />

                    <p className="text-sm leading-6 text-[#B94F35]">
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

              <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4B84A]/20">

                    <Sparkles className="h-5 w-5 text-[#173B32]" />

                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-[#173B32]">
                      Better Analysis
                    </h3>

                    <p className="text-[11px] text-[#8A948D]">
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

                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#78927A]/20">

                        <CheckCircle2 className="h-3.5 w-3.5 text-[#78927A]" />

                      </div>

                      <p className="text-xs leading-5 text-[#66736B]">
                        {tip}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* AI capabilities */}

              <div className="rounded-2xl bg-[#173B32] p-6 shadow-[0_6px_20px_rgba(23,59,50,0.18)]">

                <div className="mb-5 flex items-center gap-2">

                  <Brain className="h-4 w-4 text-[#E4B84A]" />

                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F6F1E8]/70">
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
                      className="rounded-xl border border-[#F6F1E8]/15 bg-[#F6F1E8]/10 p-3"
                    >

                      <Icon className="mb-2 h-4 w-4 text-[#E4B84A]" />

                      <p className="text-[11px] font-medium text-[#F6F1E8]/85">
                        {title}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* Privacy */}

              <div className="flex items-center gap-3 rounded-xl border border-[#DED8CC] bg-[#FFFDF8] p-4">

                <ShieldCheck className="h-5 w-5 shrink-0 text-[#78927A]" />

                <p className="text-[11px] leading-5 text-[#66736B]">
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
    <div className="min-h-full w-full overflow-x-hidden bg-[#F6F1E8] text-[#173B32]">

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto w-full max-w-[1450px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 border-b border-[#DED8CC] pb-7 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4B84A]/40 bg-[#E4B84A]/20">

                <FileText className="h-4 w-4 text-[#173B32]" />

              </div>

              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D66A4A]">
                Resume Intelligence
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#173B32] sm:text-4xl">
              Resume Analysis
            </h1>

            <p className="mt-2 text-sm text-[#66736B]">
              AI-powered insights from your resume
            </p>

          </div>

          <button
            onClick={handleUploadAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#173B32] bg-[#FFFDF8] px-4 py-2.5 text-xs font-semibold text-[#173B32] transition-colors hover:bg-[#173B32]/5"
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

          <div className="rounded-2xl bg-[#173B32] p-6 shadow-[0_6px_20px_rgba(23,59,50,0.18)] sm:p-7">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F6F1E8]/65">
                  Overall Resume Score
                </p>

                <div className="mt-3 flex items-end gap-2">

                  <span className="text-5xl font-bold tracking-tight text-[#F6F1E8] sm:text-6xl">
                    {overallScore}
                  </span>

                  <span className="mb-2 text-sm text-[#F6F1E8]/50">
                    /100
                  </span>

                </div>

                <div className="mt-3 inline-flex rounded-full border border-[#E4B84A]/40 bg-[#E4B84A]/15 px-3 py-1">

                  <span className="text-[11px] font-semibold text-[#E4B84A]">
                    {getScoreLabel(overallScore)}
                  </span>

                </div>

              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F6F1E8]/15 bg-[#F6F1E8]/10">

                <TrendingUp className="h-9 w-9 text-[#E4B84A]" />

              </div>

            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#F6F1E8]/15">

              <div
                className="h-full rounded-full bg-[#E4B84A] transition-all duration-700"
                style={{ width: `${overallScore}%` }}
              />

            </div>

          </div>

          {/* Career */}

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D66A4A]/10">

                <Target className="h-5 w-5 text-[#D66A4A]" />

              </div>

              <div>

                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A948D]">
                  Career Fit
                </p>

                <h3 className="mt-1 text-sm font-bold text-[#173B32]">
                  {analysis?.career_title || 'Career Profile'}
                </h3>

              </div>

            </div>

            <div className="mt-6 flex items-end gap-2">

              <span className="text-4xl font-bold text-[#D66A4A]">
                {careerFitScore}%
              </span>

              <span className="mb-1 text-xs text-[#8A948D]">
                match
              </span>

            </div>

            <p className="mt-2 text-xs text-[#66736B]">
              Compatibility with your recommended career path.
            </p>

          </div>

          {/* Secure */}

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#78927A]/15">

                <ShieldCheck className="h-5 w-5 text-[#78927A]" />

              </div>

              <div>

                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A948D]">
                  Analysis Status
                </p>

                <h3 className="mt-1 text-sm font-bold text-[#173B32]">
                  Completed
                </h3>

              </div>

            </div>

            <p className="mt-6 text-xs leading-5 text-[#66736B]">
              Your resume has been successfully processed and analyzed.
            </p>

          </div>

        </div>

        {/* =================================================
            SCORE BREAKDOWN
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)] sm:p-7">

          <div className="mb-6">

            <div className="flex items-center gap-2">

              <Sparkles className="h-4 w-4 text-[#D66A4A]" />

              <h2 className="text-sm font-bold text-[#173B32]">
                Resume Score Breakdown
              </h2>

            </div>

            <p className="mt-1 text-xs text-[#66736B]">
              Understand how your resume performs across important areas.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Object.entries(breakdown).map(
              ([category, score]) => (

                <div
                  key={category}
                  className="rounded-xl border border-[#DED8CC] bg-[#F6F1E8]/60 p-4"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-xs font-medium text-[#66736B]">
                      {category}
                    </span>

                    <span className="text-sm font-bold text-[#173B32]">
                      {score}%
                    </span>

                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#DED8CC]">

                    <div
                      className="h-full rounded-full bg-[#E4B84A] transition-all duration-700"
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

          <div className="mt-6 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)] sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Target className="h-4 w-4 text-[#D66A4A]" />

                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A948D]">
                    Recommended Career
                  </span>

                </div>

                <h2 className="mt-2 text-xl font-bold text-[#173B32]">
                  {analysis.career_title}
                </h2>

              </div>

              <div className="rounded-xl border border-[#D66A4A]/30 bg-[#D66A4A]/10 px-5 py-3">

                <p className="text-[10px] uppercase tracking-wider text-[#66736B]">
                  Career Match
                </p>

                <p className="mt-1 text-2xl font-bold text-[#D66A4A]">
                  {careerFitScore}%
                </p>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Matched */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 text-[#78927A]" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#173B32]">
                    Matched Skills
                  </h3>

                </div>

                <div className="flex flex-wrap gap-2">

                  {careerMatchedSkills.length > 0 ? (

                    careerMatchedSkills.map(
                      (skill, index) => (

                        <span
                          key={index}
                          className="rounded-lg border border-[#78927A]/40 bg-[#78927A]/15 px-3 py-2 text-xs font-medium text-[#173B32]"
                        >
                          {skill}
                        </span>

                      )
                    )

                  ) : (

                    <p className="text-xs text-[#8A948D]">
                      No matched skills yet.
                    </p>

                  )}

                </div>

              </div>

              {/* Missing */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <AlertCircle className="h-4 w-4 text-[#B94F35]" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B94F35]">
                    Skills To Develop
                  </h3>

                </div>

                <div className="flex flex-wrap gap-2">

                  {careerMissingSkills.length > 0 ? (

                    careerMissingSkills.map(
                      (skill, index) => (

                        <span
                          key={index}
                          className="rounded-lg border border-[#D66A4A]/30 bg-[#D66A4A]/10 px-3 py-2 text-xs font-medium text-[#B94F35]"
                        >
                          {skill}
                        </span>

                      )
                    )

                  ) : (

                    <p className="text-xs text-[#8A948D]">
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

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4B84A]/20">

                <Brain className="h-5 w-5 text-[#173B32]" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-[#173B32]">
                  Detected Skills
                </h2>

                <p className="text-[11px] text-[#8A948D]">
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
                      className="rounded-lg border border-[#DED8CC] bg-[#F6F1E8] px-3 py-2 text-xs font-medium text-[#173B32]"
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <p className="text-xs text-[#8A948D]">
                  No skills detected.
                </p>

              )}

            </div>

          </div>

          {/* Missing */}

          <div className="rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)]">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D66A4A]/10">

                <AlertCircle className="h-5 w-5 text-[#D66A4A]" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-[#173B32]">
                  Missing Skills
                </h2>

                <p className="text-[11px] text-[#8A948D]">
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
                      className="flex items-center gap-3 rounded-lg border border-[#D66A4A]/20 bg-[#D66A4A]/[0.06] px-3 py-2.5"
                    >

                      <div className="h-1.5 w-1.5 rounded-full bg-[#D66A4A]" />

                      <span className="text-xs text-[#173B32]">
                        {skill}
                      </span>

                    </div>

                  )
                )

              ) : (

                <p className="text-xs text-[#8A948D]">
                  No missing skills detected.
                </p>

              )}

            </div>

          </div>

        </div>

        {/* =================================================
            AI RECOMMENDATIONS
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_1px_4px_rgba(23,59,50,0.06)] sm:p-7">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#78927A]/15">

                <TrendingUp className="h-5 w-5 text-[#173B32]" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-[#173B32]">
                  AI Recommendations
                </h2>

                <p className="text-[11px] text-[#8A948D]">
                  Personalized improvements for your resume
                </p>

              </div>

            </div>

            <Sparkles className="hidden h-5 w-5 text-[#E4B84A] sm:block" />

          </div>

          <div className="grid grid-cols-1 gap-3">

            {recommendations.length > 0 ? (

              recommendations.map(
                (recommendation, index) => (

                  <div
                    key={index}
                    className="group flex items-start gap-4 rounded-xl border border-[#DED8CC] bg-[#F6F1E8]/60 p-4 transition-colors hover:border-[#78927A]"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#173B32] text-xs font-bold text-[#E4B84A]">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-6 text-[#173B32]">
                      {recommendation}
                    </p>

                    <ArrowUpRight className="ml-auto mt-1 hidden h-4 w-4 shrink-0 text-[#8A948D] group-hover:text-[#D66A4A] sm:block" />

                  </div>

                )
              )

            ) : (

              <p className="text-sm text-[#8A948D]">
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
            className="inline-flex items-center gap-2 rounded-xl border border-[#173B32] bg-[#FFFDF8] px-5 py-3 text-xs font-semibold text-[#173B32] transition-colors hover:bg-[#173B32]/5"
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