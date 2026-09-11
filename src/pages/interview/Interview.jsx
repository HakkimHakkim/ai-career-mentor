import React, { useEffect, useRef, useState } from "react";
import {
  Zap,
  BookOpen,
  Users,
  Briefcase,
  Play,
  CheckCircle2,
  Volume2,
  Mic,
  MicOff,
  Lightbulb,
  ArrowRight,
  Trophy,
  Target,
  Clock3,
  Sparkles,
  RotateCcw,
  ChevronRight,
  X,
} from "lucide-react";

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL =
  `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

const PASS_SCORE = 60;

// ============================================================
// INTERVIEW TYPE META
// ============================================================

const typeMeta = {
  technical: {
    icon: Briefcase,
    difficulty: "Intermediate",
    color: "indigo",
  },

  hr: {
    icon: Users,
    difficulty: "Easy",
    color: "purple",
  },

  behavioral: {
    icon: BookOpen,
    difficulty: "Medium",
    color: "cyan",
  },

  mock: {
    icon: Zap,
    difficulty: "Hard",
    color: "orange",
  },

  general: {
    icon: Users,
    difficulty: "Easy",
    color: "emerald",
  },
};

// ============================================================
// INTERVIEW TYPES
// ============================================================

const interviewTypes = [
  {
    id: 1,
    key: "technical",
    name: "Technical Interview",
    description: "SQL, Python, data analysis questions",
  },

  {
    id: 2,
    key: "hr",
    name: "HR Interview",
    description: "Behavior, motivation, and soft skills",
  },

  {
    id: 3,
    key: "behavioral",
    name: "Behavioral Interview",
    description: "Past experiences and problem-solving",
  },

  {
    id: 4,
    key: "mock",
    name: "Mock Interview",
    description: "Full interview simulation",
  },

  {
    id: 5,
    key: "general",
    name: "General Interview",
    description:
      "Self intro, strengths, and common questions",
  },
];

// ============================================================
// AUTH HEADERS
// ============================================================

const authHeaders = () => {
  const token = localStorage.getItem("ra_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition ||
      window.webkitSpeechRecognition
    : null;

// ============================================================
// COMPONENT
// ============================================================

const Interview = () => {
  const [selectedType, setSelectedType] = useState(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState(null);

  const [recentSessions, setRecentSessions] = useState([]);

  const [overallReport, setOverallReport] = useState(null);

  const [showHint, setShowHint] = useState(false);

  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    fetchMySessions();
    fetchOverallReport();

    return () => {
      stopListening();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ============================================================
  // FETCH OVERALL REPORT
  // ============================================================

  const fetchOverallReport = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/interview/overall-report`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load overall report:",
          data
        );
        return;
      }

      setOverallReport(data?.data || null);
    } catch (error) {
      console.error(
        "fetchOverallReport error:",
        error
      );
    }
  };

  // ============================================================
  // FETCH RECENT SESSIONS
  // ============================================================

  const fetchMySessions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/interview/my-sessions`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load sessions:",
          data
        );
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
        "fetchMySessions error:",
        error
      );
    }
  };

  // ============================================================
  // START INTERVIEW
  // ============================================================

  const startInterview = async (type) => {
    if (isStarting) return;

    setIsStarting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/interview/start`,
        {
          method: "POST",
          headers: authHeaders(),

          body: JSON.stringify({
            interview_type: type.key,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to start interview"
        );
      }

      const interviewData =
        data?.data || data;

      const questions =
        interviewData?.questions || [];

      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        throw new Error(
          "No interview questions were generated."
        );
      }

      setSession({
        ...interviewData,
        questions,
      });

      setSelectedType(type);
      setCurrentIndex(0);
      setAnswerText("");
      setFeedback(null);
      setResult(null);
      setShowHint(false);
      setIsAnswering(true);
    } catch (error) {
      console.error(
        "startInterview error:",
        error
      );

      alert(
        error?.message ||
          "Unable to start interview."
      );
    } finally {
      setIsStarting(false);
    }
  };

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const currentQuestion =
    session?.questions?.[currentIndex] ||
    null;

  // ============================================================
  // QUESTION TEXT
  // ============================================================

  const getQuestionText = (question) => {
    if (!question) return "";

    return (
      question.question ||
      question.question_text ||
      question.text ||
      ""
    );
  };

  // ============================================================
  // QUESTION TIPS
  // ============================================================

  const getQuestionTips = (question) => {
    if (!question?.tips) return [];

    if (Array.isArray(question.tips)) {
      return question.tips;
    }

    if (typeof question.tips === "string") {
      try {
        const parsed = JSON.parse(
          question.tips
        );

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [question.tips];
      }
    }

    return [];
  };

  // ============================================================
  // NORMALIZE FEEDBACK
  // ============================================================

  const normalizeFeedback = (rawFeedback) => {
    if (!rawFeedback) {
      return {
        score: 0,
        acceptable: false,
        feedback:
          "The AI could not evaluate this answer.",
        strengths: [],
        missing_points: [],
        improvements: [
          "Please provide a complete answer.",
        ],
        sample_better_answer: "",
      };
    }

    let rawScore =
      rawFeedback.score ??
      rawFeedback.score_out_of_100 ??
      rawFeedback.overall_score ??
      0;

    let score = Number(rawScore);

    if (!Number.isFinite(score)) {
      score = 0;
    }

    if (score <= 10) {
      score = score * 10;
    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    score = Math.round(score * 10) / 10;

    return {
      ...rawFeedback,

      score,

      acceptable:
        score >= PASS_SCORE,

      feedback:
        rawFeedback.feedback ||
        rawFeedback.evaluation ||
        rawFeedback.message ||
        "Answer evaluated successfully.",

      strengths:
        Array.isArray(
          rawFeedback.strengths
        )
          ? rawFeedback.strengths
          : [],

      missing_points:
        Array.isArray(
          rawFeedback.missing_points
        )
          ? rawFeedback.missing_points
          : [],

      improvements:
        Array.isArray(
          rawFeedback.improvements
        )
          ? rawFeedback.improvements
          : [],

      sample_better_answer:
        rawFeedback.sample_better_answer ||
        "",
    };
  };

  // ============================================================
  // SUBMIT ANSWER
  // ============================================================

  const submitAnswer = async () => {
    if (submitting) return;

    const cleanAnswer =
      answerText.trim();

    if (!cleanAnswer) {
      alert(
        "Please enter an answer before submitting."
      );
      return;
    }

    if (cleanAnswer.length < 10) {
      setFeedback({
        score: 0,
        acceptable: false,

        feedback:
          "Your answer is too short. Please provide a proper explanation related to the question.",

        strengths: [],

        missing_points: [],

        improvements: [
          "Explain your answer clearly.",
          "Include relevant details or examples.",
        ],

        sample_better_answer: "",
      });

      return;
    }

    if (!currentQuestion) {
      alert("No question available.");
      return;
    }

    if (!session?.session_id) {
      alert("Interview session not found.");
      return;
    }

    setSubmitting(true);

   try {
  const response = await fetch(
    `${API_BASE_URL}/interview/sessions/${session.session_id}/answer`,
    {
          method: "POST",

          headers: authHeaders(),

          body: JSON.stringify({
            question_id:
              currentQuestion.id,

            answer_text:
              cleanAnswer,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to submit answer"
        );
      }

      const evaluation =
        data?.data ||
        data?.answer ||
        data;

      const normalized =
        normalizeFeedback(
          evaluation
        );

      setFeedback(normalized);
    } catch (error) {
      console.error(
        "submitAnswer error:",
        error
      );

      alert(
        error?.message ||
          "Unable to evaluate answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  const goToNextQuestion = () => {
    if (!session) return;

    const totalQuestions =
      session.questions?.length || 0;

    if (
      currentIndex + 1 >=
      totalQuestions
    ) {
      completeInterview();
      return;
    }

    stopListening();

    setCurrentIndex(
      (previous) =>
        previous + 1
    );

    setAnswerText("");
    setFeedback(null);
    setShowHint(false);
  };

  // ============================================================
  // SKIP QUESTION
  // ============================================================

  const skipQuestion = async () => {
    if (!session) return;

    const totalQuestions =
      session.questions?.length || 0;

    stopListening();

    if (
      currentIndex + 1 >=
      totalQuestions
    ) {
      await completeInterview();
      return;
    }

    setCurrentIndex(
      (previous) =>
        previous + 1
    );

    setAnswerText("");
    setFeedback(null);
    setShowHint(false);
  };

  // ============================================================
  // COMPLETE INTERVIEW
  // ============================================================

  const completeInterview = async () => {
    if (!session?.session_id) {
      return;
    }

    try {
      const response = await fetch(
  `${API_BASE_URL}/interview/sessions/${session.session_id}/complete`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to complete interview"
        );
      }

      const finalResult =
        data?.data ||
        data;

      setResult(finalResult);

      setIsAnswering(false);

      stopListening();

      await fetchMySessions();
      await fetchOverallReport();
    } catch (error) {
      console.error(
        "completeInterview error:",
        error
      );

      alert(
        error?.message ||
          "Unable to complete interview."
      );
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetAll = () => {
    stopListening();

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setSelectedType(null);
    setIsAnswering(false);
    setSession(null);
    setCurrentIndex(0);
    setAnswerText("");
    setFeedback(null);
    setResult(null);
    setShowHint(false);

    fetchMySessions();
    fetchOverallReport();
  };

  // ============================================================
  // TEXT TO SPEECH
  // ============================================================

  const speakQuestion = (text) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      alert(
        "Voice is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ============================================================
  // SPEECH TO TEXT
  // ============================================================

  const toggleListening = () => {
    if (!SpeechRecognitionAPI) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (listening) {
      stopListening();
      return;
    }

    const recognition =
      new SpeechRecognitionAPI();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (
      event
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      const cleanTranscript =
        transcript.trim();

      if (!cleanTranscript) return;

      setAnswerText(
        (previous) => {
          if (!previous.trim()) {
            return cleanTranscript;
          }

          return `${previous} ${cleanTranscript}`;
        }
      );
    };

    recognition.onerror = (
      event
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
      setListening(true);
    } catch (error) {
      console.error(
        "Speech start error:",
        error
      );

      setListening(false);
    }
  };

  // ============================================================
  // STOP LISTENING
  // ============================================================

  const stopListening = () => {
    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }

      recognitionRef.current =
        null;
    }

    setListening(false);
  };

  // ============================================================
  // COMMON PAGE WRAPPER
  // ============================================================

  const PageWrapper = ({ children }) => (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#070b22] text-gray-900 dark:text-white">
      <div className="w-full min-h-screen overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // SCREEN 1 - INTERVIEW CENTER
  // ============================================================

  if (!selectedType) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="mb-8 md:mb-10">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-500 dark:text-indigo-400">
                  AI Career Mentor
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Interview Preparation
                </p>
              </div>

            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              Interview Preparation Center
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm sm:text-base">
              Practice real interview questions,
              improve your answers, and build
              confidence with AI-powered feedback.
            </p>

          </div>

          {/* OVERALL REPORT */}

          {overallReport &&
            overallReport.total_sessions > 0 && (
              <div className="mb-8">

                <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-900/20">

                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                      <div>

                        <div className="flex items-center gap-2 mb-3">
                          <Trophy className="w-5 h-5" />

                          <span className="text-sm font-semibold text-white/80">
                            Your Interview Performance
                          </span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-bold mb-2">
                          {overallReport.overall_score}%
                        </h2>

                        <p className="text-sm text-white/70">
                          Based on{" "}
                          {overallReport.total_sessions}{" "}
                          completed session(s)
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        {Object.entries(
                          overallReport.by_type || {}
                        ).map(
                          ([type, score]) => (
                            <div
                              key={type}
                              className="min-w-[110px] bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl px-4 py-3"
                            >
                              <p className="text-xs capitalize text-white/60 mb-1">
                                {type}
                              </p>

                              <p className="text-lg font-bold">
                                {score}%
                              </p>
                            </div>
                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

          {/* SECTION TITLE */}

          <div className="flex items-end justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold">
                Choose Interview Type
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a mode and start practicing.
              </p>
            </div>

          </div>

          {/* INTERVIEW CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">

            {interviewTypes.map(
              (type) => {
                const meta =
                  typeMeta[type.key];

                const Icon =
                  meta.icon;

                return (
                  <button
                    key={type.id}
                    onClick={() =>
                      startInterview(type)
                    }
                    disabled={
                      isStarting
                    }
                    className="group relative text-left rounded-3xl border border-gray-200 dark:border-[#1e2749] bg-white dark:bg-[#111633] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/10 disabled:opacity-50 disabled:pointer-events-none"
                  >

                    <div className="flex items-start justify-between mb-6">

                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        {meta.difficulty}
                      </span>

                    </div>

                    <h3 className="text-lg font-bold mb-2">
                      {type.name}
                    </h3>

                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-6">
                      {type.description}
                    </p>

                    <div className="flex items-center justify-between">

                      <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        <Play className="w-4 h-4" />

                        {isStarting
                          ? "Generating..."
                          : "Start Interview"}
                      </span>

                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

          {/* RECENT SESSIONS */}

          <div className="rounded-3xl border border-gray-200 dark:border-[#1e2749] bg-white dark:bg-[#111633] p-6 sm:p-7">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  Recent Sessions
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Track your interview progress.
                </p>
              </div>

              <Clock3 className="w-5 h-5 text-gray-400" />

            </div>

            {recentSessions.length === 0 ? (
              <div className="py-12 text-center">

                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-gray-400" />
                </div>

                <p className="font-semibold mb-1">
                  No sessions yet
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start your first interview above.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {recentSessions.map(
                  (item, index) => (
                    <div
                      key={
                        item.session_id ||
                        item.id ||
                        index
                      }
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4"
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>

                        <div>

                          <p className="font-semibold">
                            {item.title ||
                              item.interview_type ||
                              "Interview"}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleDateString()
                              : ""}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {item.overall_score !=
                          null
                            ? `${Math.round(
                                Number(
                                  item.overall_score
                                )
                              )}%`
                            : "—"}
                        </span>

                        <ChevronRight className="w-4 h-4 text-gray-400" />

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      </PageWrapper>
    );
  }

  // ============================================================
  // SCREEN 2 - RESULT
  // ============================================================

  if (result) {
    const finalScore =
      result.overall_score != null
        ? Math.round(
            Number(result.overall_score)
          )
        : 0;

    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-8">

            <div className="inline-flex w-16 h-16 rounded-3xl bg-emerald-500/10 items-center justify-center mb-5">
              <Trophy className="w-8 h-8 text-emerald-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Interview Completed
            </h1>

            <p className="text-gray-500 dark:text-gray-400">
              Great job! Here's your performance summary.
            </p>

          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-[#1e2749] bg-white dark:bg-[#111633] p-7 sm:p-10 text-center">

            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-indigo-500/10 border-8 border-indigo-500/10 mb-6">

              <div>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {finalScore}%
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Overall Score
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-7">

              <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Questions Answered
                </p>

                <p className="text-xl font-bold">
                  {result.questions_answered ??
                    0}{" "}
                  /{" "}
                  {result.total_questions ??
                    session?.questions
                      ?.length ??
                    0}
                </p>

              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Interview Type
                </p>

                <p className="text-xl font-bold capitalize">
                  {selectedType?.name ||
                    "Interview"}
                </p>

              </div>

            </div>

            {result.performance_feedback && (
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-5 mb-7 text-left">

                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                  AI Performance Feedback
                </p>

                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {result.performance_feedback}
                </p>

              </div>
            )}

            {overallReport &&
              overallReport.total_sessions > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white text-left mb-7">

                  <div className="flex items-center justify-between mb-3">

                    <p className="font-bold">
                      Overall Interview Report
                    </p>

                    <p className="text-2xl font-bold">
                      {
                        overallReport.overall_score
                      }
                      %
                    </p>

                  </div>

                  <p className="text-xs text-white/70 mb-4">
                    Based on{" "}
                    {
                      overallReport.total_sessions
                    }{" "}
                    completed session(s)
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {Object.entries(
                      overallReport.by_type ||
                        {}
                    ).map(
                      ([type, score]) => (
                        <div
                          key={type}
                          className="bg-white/10 rounded-xl px-3 py-2"
                        >
                          <p className="text-[10px] capitalize text-white/60">
                            {type}
                          </p>

                          <p className="font-bold">
                            {score}%
                          </p>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            <button
              onClick={resetAll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Interview Center
            </button>

          </div>

        </div>
      </PageWrapper>
    );
  }

  // ============================================================
  // NO SESSION
  // ============================================================

  if (!isAnswering || !session) {
    return null;
  }

  // ============================================================
  // NO QUESTION
  // ============================================================

  if (!currentQuestion) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">

          <div className="rounded-3xl border border-gray-200 dark:border-[#1e2749] bg-white dark:bg-[#111633] p-8 text-center">

            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <X className="w-7 h-7 text-red-500" />
            </div>

            <h2 className="text-xl font-bold mb-3">
              No question available
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We couldn't load the current
              interview question.
            </p>

            <button
              onClick={resetAll}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Back to Interview Center
            </button>

          </div>

        </div>
      </PageWrapper>
    );
  }

  // ============================================================
  // QUESTION DATA
  // ============================================================

  const questionText =
    getQuestionText(
      currentQuestion
    );

  const questionTips =
    getQuestionTips(
      currentQuestion
    );

  // ============================================================
  // SCORE
  // ============================================================

  const currentScore =
    feedback &&
    Number.isFinite(
      Number(feedback.score)
    )
      ? Number(feedback.score)
      : 0;

  const answerAccepted =
    feedback !== null &&
    currentScore >= PASS_SCORE;

  const isLastQuestion =
    currentIndex + 1 >=
    session.questions.length;

  const progress =
    ((currentIndex + 1) /
      session.questions.length) *
    100;

  // ============================================================
  // SCREEN 3 - QUESTION
  // ============================================================

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">

        {/* TOP BAR */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                {selectedType.name}
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {typeMeta[
                  selectedType.key
                ]?.difficulty}
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Interview Practice
            </h1>

          </div>

          <button
            onClick={resetAll}
            className="self-start sm:self-auto w-10 h-10 rounded-xl border border-gray-200 dark:border-[#1e2749] flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition"
            title="Exit interview"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-3xl border border-gray-200 dark:border-[#1e2749] bg-white dark:bg-[#111633] shadow-xl shadow-black/5 overflow-hidden">

          {/* PROGRESS HEADER */}

          <div className="px-5 sm:px-7 pt-6">

            <div className="flex items-center justify-between mb-3">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Current Question
                </p>

                <p className="font-bold mt-1">
                  Question{" "}
                  {currentIndex + 1}{" "}
                  of{" "}
                  {session.questions.length}
                </p>

              </div>

              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(progress)}%
              </span>

            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* QUESTION AREA */}

          <div className="p-5 sm:p-7">

            <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-5 sm:p-6 mb-6">

              <div className="flex items-start gap-4">

                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    Q
                  </span>
                </div>

                <div className="flex-1">

                  <p className="text-lg sm:text-xl font-semibold leading-8">
                    {questionText}
                  </p>

                </div>

                <button
                  onClick={() =>
                    speakQuestion(
                      questionText
                    )
                  }
                  title="Read question aloud"
                  className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:scale-105 transition"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

              </div>

            </div>

            {/* HINT */}

            {questionTips.length > 0 && (
              <div className="mb-6">

                <button
                  onClick={() =>
                    setShowHint(
                      (value) =>
                        !value
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-semibold"
                >
                  <Lightbulb className="w-4 h-4" />

                  {showHint
                    ? "Hide Hint"
                    : "Show Hint"}
                </button>

                {showHint && (
                  <div className="mt-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4">

                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">

                      {questionTips.map(
                        (
                          tip,
                          index
                        ) => (
                          <li key={index}>
                            {tip}
                          </li>
                        )
                      )}

                    </ul>

                  </div>
                )}

              </div>
            )}

            {/* ANSWER */}

            <div className="mb-6">

              <div className="flex items-center justify-between mb-3">

                <label className="text-sm font-semibold">
                  Your Answer
                </label>

                <button
                  onClick={
                    toggleListening
                  }
                  disabled={
                    submitting
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 ${
                    listening
                      ? "bg-red-500/10 text-red-500"
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  }`}
                >

                  {listening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}

                  {listening
                    ? "Listening..."
                    : "Speak"}
                </button>

              </div>

              <textarea
                value={answerText}
                onChange={(event) =>
                  setAnswerText(
                    event.target.value
                  )
                }
                disabled={
                  submitting
                }
                placeholder="Type your answer here, or use the Speak button..."
                className="w-full min-h-[180px] p-5 border border-gray-200 dark:border-[#1e2749] rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-60 transition"
              />

              <div className="flex justify-between mt-2">

                <p className="text-xs text-gray-400">
                  Minimum 10 characters
                </p>

                <p className="text-xs text-gray-400">
                  {answerText.length} characters
                </p>

              </div>

            </div>

            {/* AI FEEDBACK */}

            {feedback && (
              <div
                className={`mb-6 rounded-2xl border p-5 ${
                  answerAccepted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        answerAccepted
                          ? "bg-emerald-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {answerAccepted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Target className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    <div>

                      <h3 className="font-bold">
                        AI Evaluation
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {answerAccepted
                          ? "Your answer meets the passing score."
                          : "Your answer needs improvement."}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`text-3xl font-bold ${
                      answerAccepted
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {currentScore}%
                  </span>

                </div>

                <div className="rounded-xl bg-white/50 dark:bg-black/10 p-4 mb-4">

                  <p className="text-sm leading-6">
                    {feedback.feedback}
                  </p>

                </div>

                {feedback.strengths?.length >
                  0 && (
                  <div className="mb-4">

                    <p className="font-semibold text-sm mb-2">
                      Strengths
                    </p>

                    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">

                      {feedback.strengths.map(
                        (
                          item,
                          index
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>
                )}

                {feedback.missing_points
                  ?.length > 0 && (
                  <div className="mb-4">

                    <p className="font-semibold text-sm mb-2">
                      Missing Points
                    </p>

                    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">

                      {feedback.missing_points.map(
                        (
                          item,
                          index
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>
                )}

                {feedback.improvements
                  ?.length > 0 && (
                  <div className="mb-4">

                    <p className="font-semibold text-sm mb-2">
                      Improve
                    </p>

                    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">

                      {feedback.improvements.map(
                        (
                          item,
                          index
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>
                )}

                {feedback.sample_better_answer && (
                  <div>

                    <p className="font-semibold text-sm mb-2">
                      Better Answer
                    </p>

                    <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
                      {
                        feedback.sample_better_answer
                      }
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ACTION BUTTONS */}

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                onClick={
                  skipQuestion
                }
                disabled={
                  submitting
                }
                className="sm:flex-1 border border-gray-200 dark:border-[#1e2749] text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition"
              >
                Skip Question
              </button>

              {!feedback ? (
                <button
                  onClick={
                    submitAnswer
                  }
                  disabled={
                    submitting ||
                    !answerText.trim()
                  }
                  className="sm:flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                >
                  {submitting
                    ? "Evaluating..."
                    : "Submit Answer"}

                  {!submitting && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              ) : answerAccepted ? (
                <button
                  onClick={
                    isLastQuestion
                      ? completeInterview
                      : goToNextQuestion
                  }
                  className="sm:flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3.5 rounded-xl font-semibold transition"
                >
                  {isLastQuestion
                    ? "Finish Interview"
                    : "Next Question"}

                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFeedback(
                      null
                    );

                    setAnswerText("");
                    setShowHint(false);
                  }}
                  className="sm:flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3.5 rounded-xl font-semibold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              )}

            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
};

export default Interview;