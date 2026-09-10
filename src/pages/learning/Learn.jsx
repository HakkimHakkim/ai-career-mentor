import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Play,
  Clock3,
  Target,
  Loader2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  GraduationCap,
  Layers3,
  TrendingUp,
} from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1';

/* =========================================================
   CAREER → SKILLS
========================================================= */

const careerSkills = {
  'Data Analyst': [
    'Excel',
    'SQL',
    'Python',
    'Power BI',
    'Statistics',
  ],

  'Data Scientist': [
    'Python',
    'Statistics',
    'SQL',
    'Machine Learning',
    'Data Visualization',
  ],

  'Full Stack Developer': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Node.js',
    'SQL',
  ],

  'Frontend Developer': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
  ],

  'Backend Developer': [
    'Python',
    'SQL',
    'API Development',
    'Node.js',
  ],

  'ML Engineer': [
    'Python',
    'Statistics',
    'Machine Learning',
    'Deep Learning',
    'MLOps',
  ],

  'DevOps Engineer': [
    'Linux',
    'Docker',
    'Kubernetes',
    'AWS',
    'CI/CD',
  ],

  'UI/UX Designer': [
    'Figma',
    'UI Design',
    'UX Research',
    'Prototyping',
  ],

  'Business Analyst': [
    'Excel',
    'SQL',
    'Power BI',
    'Business Analysis',
    'Statistics',
  ],

  'Product Manager': [
    'Product Management',
    'Agile',
    'Market Research',
    'Analytics',
  ],
};

/* =========================================================
   LEARNING RESOURCES
========================================================= */

const learningResources = {
  Python: [
    {
      title: 'Python Full Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: '4 Hours 26 Minutes',
      level: 'Beginner',
      videoId: 'rfscVS0vtbw',
    },
    {
      title: 'Python Tutorial for Beginners',
      channel: 'Programming with Mosh',
      duration: '6 Hours',
      level: 'Intermediate',
      videoId: '_uQrJ0TkZlc',
    },
  ],

  JavaScript: [
    {
      title: 'JavaScript Full Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: '3+ Hours',
      level: 'Beginner',
      videoId: 'PkZNo7MFNFg',
    },
  ],

  HTML: [
    {
      title: 'HTML Full Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: '2 Hours',
      level: 'Beginner',
      videoId: 'pQN-pnXPaVg',
    },
  ],

  CSS: [
    {
      title: 'CSS Full Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: '11 Hours',
      level: 'Beginner',
      videoId: 'OXGznpKZ_sA',
    },
  ],

  React: [
    {
      title: 'React JS Full Course',
      channel: 'freeCodeCamp.org',
      duration: '5 Hours',
      level: 'Beginner',
      videoId: 'DLX62G4lc44',
    },
  ],

  'Node.js': [
    {
      title: 'Node.js and Express.js Full Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'Oe421EPjeBE',
    },
  ],

  SQL: [
    {
      title: 'SQL Tutorial - Full Database Course',
      channel: 'freeCodeCamp.org',
      duration: '4+ Hours',
      level: 'Beginner',
      videoId: 'HXV3zeQKqGY',
    },
  ],

  Excel: [
    {
      title: 'Excel Tutorial for Beginners',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'Vl0H-qTclOg',
    },
  ],

  'Power BI': [
    {
      title: 'Power BI For Beginners [FULL COURSE]',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'sG7_ub8s_5A',
    },
  ],

  Statistics: [
    {
      title: 'Statistics Full Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'xxpc-HPKN28',
    },
  ],

  'Data Visualization': [
    {
      title: 'Data Visualization Full Course',
      channel: 'freeCodeCamp.org',
      duration: 'Beginner Course',
      level: 'Beginner',
      videoId: 'a9UrKTVEeZA',
    },
  ],

  Analytics: [
    {
      title: 'Data Analytics Full Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'r-uOLxNrNk8',
    },
  ],

  'Machine Learning': [
    {
      title: 'Machine Learning for Everybody',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'i_LwzRVP7bg',
    },
  ],

  'Deep Learning': [
    {
      title: 'Deep Learning Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Intermediate',
      videoId: 'VyWAvY2CF9c',
    },
  ],

  MLOps: [
    {
      title: 'MLOps Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Intermediate',
      videoId: 'Yf0h5MsFv3w',
    },
  ],

  Linux: [
    {
      title: 'Linux Command Line Full Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'ZtqBQ68cfJc',
    },
  ],

  Docker: [
    {
      title: 'Docker Tutorial for Beginners',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'fqMOX6JJhGo',
    },
  ],

  Kubernetes: [
    {
      title: 'Kubernetes Course for Beginners',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Intermediate',
      videoId: 'X48VuDVv0do',
    },
  ],

  AWS: [
    {
      title: 'AWS Cloud Practitioner Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'SOTamWNgDKc',
    },
  ],

  'CI/CD': [
    {
      title: 'CI/CD Full Course (2 Hours) - Build a Real DevOps Pipeline',
      channel: 'GitHub Actions, Docker, Kubernetes',
      duration: '2 Hours',
      level: 'Beginner',
      videoId: 'hbeLqL6sjKA',
    },
  ],

  'API Development': [
    {
      title: 'REST API Course',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Intermediate',
      videoId: 'GZvSYJDk-us',
    },
  ],

  'Problem Solving': [
    {
      title: 'Algorithms and Data Structures Tutorial',
      channel: 'freeCodeCamp.org',
      duration: '5+ Hours',
      level: 'Beginner',
      videoId: '8hly31xKli0',
    },
  ],

  Figma: [
    {
      title: 'Figma UI UX Design Tutorial',
      channel: 'freeCodeCamp.org',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'j7i2q8KtPE4',
    },
  ],

  'UI Design': [
    {
      title: 'UI / UX Design Tutorial – Wireframe, Mockup & Design in Figma',
      channel: 'freeCodeCamp.org',
      duration: '1-2 Hours',
      level: 'Beginner',
      videoId: 'c9Wg6Cb_YlU',
    },
  ],

  'UX Research': [
    {
      title: 'User Research Full Course [FREE]',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'xkXaPOb9Qxo',
    },
  ],

  Prototyping: [
    {
      title: 'UI / UX Design Tutorial – Wireframe, Mockup & Design in Figma',
      channel: 'freeCodeCamp.org',
      duration: '1-2 Hours',
      level: 'Intermediate',
      videoId: 'c9Wg6Cb_YlU',
    },
  ],

  'Business Analysis': [
    {
      title: 'Business Analyst Full Course 2026',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'MCItmVVmFsk',
    },
  ],

  'Product Management': [
    {
      title: 'The Business of Building Apps - App Product Management Course',
      channel: 'freeCodeCamp.org',
      duration: '8 Hours',
      level: 'Beginner',
      videoId: 'poLzjLt2yqU',
    },
  ],

  Agile: [
    {
      title: 'Scrum Master Full Course 2026',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: '3mRnPTI7S8s',
    },
  ],

  'Market Research': [
    {
      title: 'Digital Marketing Full Course 2025',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: '4WJeZltRCrQ',
    },
  ],

  Communication: [
    {
      title: 'Complete Communication Skills Course',
      channel: 'Simplilearn',
      duration: 'Full Course',
      level: 'Beginner',
      videoId: 'A0BMyN3Eofk',
    },
  ],
};

/* =========================================================
   COMPONENT
========================================================= */

const Learn = () => {
  const [missingSkills, setMissingSkills] = useState([]);
  const [careerName, setCareerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [completingSkill, setCompletingSkill] = useState(null);

  /* =======================================================
     FETCH DATA
  ======================================================= */

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('ra_token');

        console.log('Learn Token found:', !!token);

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
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Learn API Status:', response.status);

        if (response.status === 404) {
          setMissingSkills([]);
          return;
        }

        if (response.status === 401) {
          throw new Error(
            'Unauthorized. Your login token may have expired. Please login again.'
          );
        }

        if (!response.ok) {
          throw new Error(
            `Failed to load learning data. Status: ${response.status}`
          );
        }

        const result = await response.json();

        console.log('Learn API Response:', result);

        const careerData = result.data || result;

        setMissingSkills(careerData.missing_skills || []);

        const careerInfo = careerData.career || {};

        setCareerName(
          careerInfo.career_name ||
            careerInfo.name ||
            careerInfo.title ||
            careerData.career_name ||
            ''
        );

        const roadmapResponse = await fetch(
          `${API_BASE}/roadmap/`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(
          'Roadmap API Status:',
          roadmapResponse.status
        );

        if (roadmapResponse.ok) {
          const roadmapResult =
            await roadmapResponse.json();

          console.log(
            'Roadmap API Response:',
            roadmapResult
          );

          const roadmapData =
            roadmapResult.data || {};

          setRoadmapSteps(
            roadmapData.steps || []
          );
        }
      } catch (err) {
        console.error('Learn Page Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  /* =======================================================
     SKILLS
  ======================================================= */

  const getSkillsToLearn = () => {
    if (
      Array.isArray(roadmapSteps) &&
      roadmapSteps.length > 0
    ) {
      return roadmapSteps
        .filter(
          (step) =>
            step &&
            step.title &&
            step.status !== 'completed'
        )
        .map((step) =>
          step.title.replace(
            /^Master\s+/i,
            ''
          )
        );
    }

    const careerSkillList =
      careerSkills[careerName] || [];

    const allSkills = [
      ...(missingSkills || []),
      ...careerSkillList,
    ];

    return [...new Set(allSkills)];
  };

  
const skillsToLearn = getSkillsToLearn();

const getResourcesForSkill = (skill) => {
  if (learningResources[skill]) {
    return learningResources[skill];
  }

  return [
    {
      title: `${skill} Tutorial for Beginners`,
      channel: 'YouTube',
      duration: 'Free Course',
      level: 'Beginner',
      searchQuery: `${skill} tutorial for beginners`,
    },
    {
      title: `${skill} Full Course`,
      channel: 'YouTube',
      duration: 'Free Course',
      level: 'Intermediate',
      searchQuery: `${skill} full course`,
    },
  ];
};

const getResourceUrl = (resource) => {
  if (resource?.videoId) {
    return `https://www.youtube.com/watch?v=${resource.videoId}`;
  }

  if (resource?.searchQuery) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      resource.searchQuery
    )}`;
  }

  return 'https://www.youtube.com/';
};

  /* =======================================================
     PROGRESS
  ======================================================= */

  const completedCount = roadmapSteps.filter(
    (step) => step.status === 'completed'
  ).length;

  const totalRoadmapSteps = roadmapSteps.length;

  const learningProgress =
    totalRoadmapSteps > 0
      ? Math.round(
          (completedCount /
            totalRoadmapSteps) *
            100
        )
      : 0;

  const availableCourses = useMemo(() => {
    return skillsToLearn.reduce(
      (total, skill) =>
        total +
        getResourcesForSkill(skill).length,
      0
    );
  }, [skillsToLearn]);

  /* =======================================================
     COMPLETE SKILL
  ======================================================= */

  const handleCompleteSkill = async (skill) => {
    try {
      setCompletingSkill(skill);

      const token =
        localStorage.getItem('ra_token');

      const roadmapStep =
        roadmapSteps.find((step) => {
          const stepTitle =
            step.title.toLowerCase();

          const skillName =
            skill.toLowerCase();

          return (
            stepTitle === skillName ||
            stepTitle ===
              `master ${skillName}` ||
            stepTitle.includes(skillName)
          );
        });

      if (!roadmapStep) {
        alert(
          `${skill} is not currently part of your personalized roadmap.`
        );
        return;
      }

      const response = await fetch(
        `${API_BASE}/roadmap/steps/${roadmapStep.id}/complete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            'Failed to complete skill'
        );
      }

      setRoadmapSteps((previousSteps) =>
        previousSteps.map((step) =>
          step.id === roadmapStep.id
            ? {
                ...step,
                status: 'completed',
                progress: 100,
              }
            : step
        )
      );

      alert(
        `${skill} marked as completed! 🎉`
      );
    } catch (err) {
      console.error(
        'Complete skill error:',
        err
      );

      alert(
        err.message ||
          'Failed to complete skill'
      );
    } finally {
      setCompletingSkill(null);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050914] flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[150px]" />
          <div className="absolute bottom-0 right-[10%] w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[150px]" />
        </div>

        <div className="relative flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            <Loader2 className="w-7 h-7 text-violet-300 animate-spin" />
          </div>

          <p className="text-sm text-white/50">
            Finding the best learning resources for you...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050914] flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[30%] w-96 h-96 rounded-full bg-red-500/10 blur-[130px]" />
        </div>

        <div className="relative max-w-md w-full rounded-[28px] border border-red-400/10 bg-white/[0.035] backdrop-blur-2xl p-8 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-red-500/10 border border-red-400/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Unable to Load Learning Resources
          </h2>

          <p className="text-sm text-red-300/80">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] text-white">

      {/* ===================================================
          AMBIENT BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -top-40 left-[12%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute top-[15%] right-[-100px] h-[480px] w-[480px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute bottom-[-100px] left-[30%] h-[450px] w-[450px] rounded-full bg-indigo-600/15 blur-[150px]" />

        <div className="absolute top-[45%] left-[55%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1500px] mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-4">

                <div className="w-8 h-8 rounded-xl border border-violet-400/10 bg-violet-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-300" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300/70">
                  Personalized Learning
                </span>

              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight">
                Learning
                <span className="ml-3 bg-gradient-to-r from-violet-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Center
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/45">
                Build the skills you need, follow your roadmap,
                and move closer to your dream career.
              </p>

            </div>

            {/* STATUS */}

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur-xl">

              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                  Learning Status
                </p>

                <p className="text-xs font-semibold text-white/80">
                  {learningProgress}% Progress
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            HERO / CAREER CARD
        ================================================= */}

        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-gradient-to-br from-[#171743]/90 via-[#111936]/90 to-[#08152e]/95 p-6 sm:p-8 lg:p-10 mb-8 shadow-[0_30px_100px_rgba(35,20,100,0.18)]">

          {/* Glow */}

          <div className="absolute -top-32 right-[10%] h-[300px] w-[300px] rounded-full bg-violet-500/25 blur-[110px]" />

          <div className="absolute -bottom-40 left-[25%] h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[110px]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">

            <div>

              <div className="flex items-center gap-2 mb-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07]">
                  <GraduationCap className="w-4 h-4 text-violet-200" />
                </div>

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Your Career Goal
                </span>

              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                {careerName || 'Your Career'}
              </h2>

              <p className="text-sm text-white/45 max-w-xl">
                Your personalized learning path contains{' '}
                <span className="text-violet-300 font-semibold">
                  {skillsToLearn.length}
                </span>{' '}
                important skills to help you become career ready.
              </p>

            </div>

            {/* PROGRESS */}

            <div className="relative w-full lg:w-48">

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  Roadmap
                </span>

                <span className="text-sm font-bold text-violet-300">
                  {learningProgress}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 transition-all duration-700"
                  style={{
                    width: `${learningProgress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[10px] text-white/25">
                {completedCount}/{totalRoadmapSteps} steps completed
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            MINI METRICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

          {/* SKILLS */}

          <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl hover:border-violet-400/20 transition-all">

            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  Skills
                </p>

                <p className="text-3xl font-bold">
                  {skillsToLearn.length}
                </p>

              </div>

              <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-400/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-300" />
              </div>

            </div>

          </div>

          {/* COURSES */}

          <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl hover:border-blue-400/20 transition-all">

            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  Courses
                </p>

                <p className="text-3xl font-bold">
                  {availableCourses}
                </p>

              </div>

              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-300" />
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl hover:border-emerald-400/20 transition-all">

            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  Completed
                </p>

                <p className="text-3xl font-bold">
                  {completedCount}
                </p>

              </div>

              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <div className="flex items-end justify-between mb-6">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <Layers3 className="w-4 h-4 text-violet-300" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-300/60">
                Skill Development
              </span>

            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Skills to Master
            </h2>

          </div>

        </div>

        {/* =================================================
            SKILLS
        ================================================= */}

        <div className="space-y-10">

          {skillsToLearn.map(
            (skill, skillIndex) => {

              const resources =
                getResourcesForSkill(skill);

              const roadmapStep =
                roadmapSteps.find(
                  (step) => {
                    const stepTitle =
                      step.title.toLowerCase();

                    const skillName =
                      skill.toLowerCase();

                    return (
                      stepTitle === skillName ||
                      stepTitle ===
                        `master ${skillName}` ||
                      stepTitle.includes(
                        skillName
                      )
                    );
                  }
                );

              const isCompleted =
                roadmapStep?.status ===
                'completed';

              return (
                <section
                  key={`${skill}-${skillIndex}`}
                  className="relative"
                >

                  {/* SKILL HEADER */}

                  <div className="flex items-center justify-between mb-5">

                    <div className="flex items-center gap-3">

                      <div className="relative w-11 h-11 rounded-2xl border border-violet-400/10 bg-violet-500/10 flex items-center justify-center">

                        <Target className="w-5 h-5 text-violet-300" />

                        <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-xl" />

                      </div>

                      <div>

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                          Skill {String(skillIndex + 1).padStart(2, '0')}
                        </p>

                        <h3 className="text-xl font-bold">
                          {skill}
                        </h3>

                      </div>

                    </div>

                    {isCompleted && (
                      <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-500/10 px-3 py-1.5">

                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />

                        <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                          Completed
                        </span>

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      RESOURCE GRID
                  ================================================= */}

                  {resources.length === 0 ? (

                    <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-7 backdrop-blur-xl">

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white/30" />
                        </div>

                        <p className="text-sm text-white/40">
                          Learning videos for{' '}
                          <span className="text-white/70 font-semibold">
                            {skill}
                          </span>{' '}
                          will be added soon.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                      {resources.map(
                        (resource, index) => (

                          <div
                            key={`${resource.videoId}-${index}`}
                            className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:shadow-[0_25px_70px_rgba(76,29,149,0.15)]"
                          >

                            {/* CARD GLOW */}

                            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition-all group-hover:bg-violet-500/20" />

                            {/* THUMBNAIL */}

                            <div className="relative h-48 overflow-hidden bg-[#080d1b]">

                              {resource.videoId ? (
  <img
    src={`https://img.youtube.com/vi/${resource.videoId}/hqdefault.jpg`}
    alt={resource.title}
    className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
  />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
    <Play className="w-10 h-10 text-white/30" />
  </div>
)}

                              {/* PLAY */}

                              <a
                                href={getResourceUrl(resource)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 flex items-center justify-center"
                              >

                                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.25)] group-hover:scale-110 transition-transform">

                                  <Play className="w-5 h-5 text-white fill-white ml-1" />

                                </div>

                              </a>

                              {/* LEVEL */}

                              <div className="absolute top-4 left-4">

                                <span className="px-3 py-1.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-xl text-[9px] uppercase tracking-wider font-semibold text-white/70">
                                  {resource.level}
                                </span>

                              </div>

                            </div>

                            {/* CONTENT */}

                            <div className="relative p-5">

                              <h4 className="text-base font-bold text-white/90 leading-snug mb-2 line-clamp-2">
                                {resource.title}
                              </h4>

                              <p className="text-xs text-white/35 mb-4">
                                {resource.channel}
                              </p>

                              <div className="flex items-center gap-2 text-[11px] text-white/35 mb-5">

                                <Clock3 className="w-3.5 h-3.5" />

                                {resource.duration}

                              </div>

                              {/* WATCH */}

                              <a
                                href={getResourceUrl(resource)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/watch flex items-center justify-center gap-2 w-full rounded-xl border border-violet-400/15 bg-violet-500/10 hover:bg-violet-500/20 py-3 text-xs font-semibold text-violet-200 transition-all"
                              >

                                <Play className="w-3.5 h-3.5 fill-current" />

                                Watch Course

                                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/watch:-translate-y-0.5 group-hover/watch:translate-x-0.5" />

                              </a>

                              {/* COMPLETE */}

                              <button
                                onClick={() =>
                                  handleCompleteSkill(
                                    skill
                                  )
                                }
                                disabled={
                                  completingSkill ===
                                    skill ||
                                  isCompleted
                                }
                                className={`w-full mt-3 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 border border-emerald-400/10 text-emerald-300 cursor-not-allowed'
                                    : 'bg-white/[0.04] border border-white/[0.07] text-white/60 hover:bg-emerald-500/10 hover:border-emerald-400/15 hover:text-emerald-300'
                                }`}
                              >

                                {completingSkill ===
                                skill ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Updating...
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Mark as Completed
                                  </>
                                )}

                              </button>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </section>
              );
            }
          )}

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {skillsToLearn.length === 0 && (

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-12 text-center backdrop-blur-2xl">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />

            <div className="relative">

              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-400/10 flex items-center justify-center">

                <GraduationCap className="w-7 h-7 text-violet-300" />

              </div>

              <h3 className="text-xl font-bold mb-2">
                Your learning path is ready to begin
              </h3>

              <p className="text-sm text-white/35 max-w-md mx-auto">
                Complete Career Discovery to generate
                your personalized roadmap and learning
                resources.
              </p>

            </div>

          </div>

        )}

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <div className="mt-12 relative overflow-hidden rounded-[28px] border border-violet-400/10 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-blue-600/10 p-7">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-violet-500/15 blur-[100px]" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <Sparkles className="w-4 h-4 text-violet-300" />

                <span className="text-[9px] uppercase tracking-[0.2em] text-violet-300/60">
                  Keep Growing
                </span>

              </div>

              <h3 className="text-xl font-bold">
                Every skill moves you closer to your goal.
              </h3>

              <p className="text-sm text-white/35 mt-1">
                Stay consistent and complete your roadmap.
              </p>

            </div>

            <a
              href="/roadmap"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-indigo-700 hover:bg-white/90 transition-all"
            >
              View Roadmap

              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Learn;