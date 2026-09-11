import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  Loader2,
  X,
  Play,
  BookOpen,
  Code2,
  ExternalLink,
  Save,
  Sparkles,
  Clock3,
  Trophy,
  Target,
  ChevronRight,
  Zap,
} from 'lucide-react';

const API_BASE_URL =
  `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

/* =====================================================
   LEARNING RESOURCES
===================================================== */

const learningResources = {
  Docker: {
    videos: [
      {
        title: 'Docker Tutorial for Beginners',
        search: 'Docker tutorial for beginners',
      },
      {
        title: 'Docker Full Course',
        search: 'Docker full course',
      },
    ],
    docs: 'https://docs.docker.com/',
    project: 'Containerize a React + FastAPI application',
  },

  Kubernetes: {
    videos: [
      {
        title: 'Kubernetes Tutorial for Beginners',
        search: 'Kubernetes tutorial for beginners',
      },
      {
        title: 'Kubernetes Full Course',
        search: 'Kubernetes full course',
      },
    ],
    docs: 'https://kubernetes.io/docs/',
    project: 'Deploy a containerized application using Kubernetes',
  },

  Python: {
    videos: [
      {
        title: 'Python Tutorial for Beginners',
        search: 'Python tutorial for beginners',
      },
      {
        title: 'Python Full Course',
        search: 'Python full course for beginners',
      },
    ],
    docs: 'https://docs.python.org/3/',
    project: 'Build a Python automation project',
  },

  SQL: {
    videos: [
      {
        title: 'SQL Tutorial for Beginners',
        search: 'SQL tutorial for beginners',
      },
      {
        title: 'SQL Full Course',
        search: 'SQL full course for beginners',
      },
    ],
    docs: 'https://www.postgresql.org/docs/',
    project: 'Build a Student Management Database',
  },

  JavaScript: {
    videos: [
      {
        title: 'JavaScript Tutorial for Beginners',
        search: 'JavaScript tutorial for beginners',
      },
      {
        title: 'JavaScript Full Course',
        search: 'JavaScript full course for beginners',
      },
    ],
    docs:
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    project: 'Build an interactive JavaScript application',
  },

  React: {
    videos: [
      {
        title: 'React Tutorial for Beginners',
        search: 'React JS tutorial for beginners',
      },
      {
        title: 'React Full Course',
        search: 'React JS full course',
      },
    ],
    docs: 'https://react.dev/',
    project: 'Build a React dashboard application',
  },

  Linux: {
    videos: [
      {
        title: 'Linux Tutorial for Beginners',
        search: 'Linux tutorial for beginners',
      },
      {
        title: 'Linux Commands Full Course',
        search: 'Linux commands tutorial full course',
      },
    ],
    docs: 'https://www.linux.org/',
    project: 'Practice Linux commands and server basics',
  },

  Git: {
    videos: [
      {
        title: 'Git and GitHub Tutorial',
        search: 'Git and GitHub tutorial for beginners',
      },
      {
        title: 'Git Full Course',
        search: 'Git full course for beginners',
      },
    ],
    docs: 'https://git-scm.com/doc',
    project: 'Create and manage a GitHub project repository',
  },

  AWS: {
    videos: [
      {
        title: 'AWS Tutorial for Beginners',
        search: 'AWS tutorial for beginners',
      },
      {
        title: 'AWS Full Course',
        search: 'AWS full course',
      },
    ],
    docs: 'https://docs.aws.amazon.com/',
    project: 'Deploy a cloud application using AWS',
  },

  Jenkins: {
    videos: [
      {
        title: 'Jenkins Tutorial for Beginners',
        search: 'Jenkins tutorial for beginners',
      },
      {
        title: 'Jenkins Full Course',
        search: 'Jenkins full course',
      },
    ],
    docs: 'https://www.jenkins.io/doc/',
    project: 'Create a CI/CD pipeline using Jenkins',
  },

  Terraform: {
    videos: [
      {
        title: 'Terraform Tutorial for Beginners',
        search: 'Terraform tutorial for beginners',
      },
      {
        title: 'Terraform Full Course',
        search: 'Terraform full course',
      },
    ],
    docs: 'https://developer.hashicorp.com/terraform/docs',
    project: 'Provision cloud infrastructure using Terraform',
  },

  Communication: {
    videos: [
      {
        title: 'Communication Skills',
        search: 'communication skills tutorial for beginners',
      },
      {
        title: 'English Communication',
        search: 'English communication skills full course',
      },
    ],
    docs:
      'https://www.skillsyouneed.com/ips/communication-skills.html',
    project: 'Prepare and record a 5 minute technical presentation',
  },

  'Problem Solving': {
    videos: [
      {
        title: 'Problem Solving Skills',
        search: 'problem solving skills tutorial for beginners',
      },
      {
        title: 'Programming Problem Solving',
        search: 'programming problem solving tutorial',
      },
    ],
    docs: 'https://developer.mozilla.org/',
    project:
      'Solve 10 programming problems and document your solution',
  },
  Excel: {
    videos: [
      { title: 'Excel Tutorial for Beginners', search: 'Excel tutorial for beginners' },
      { title: 'Excel Full Course', search: 'Excel full course for beginners' },
    ],
    docs: 'https://support.microsoft.com/excel',
    project: 'Build an expense tracker dashboard in Excel',
  },

  Statistics: {
    videos: [
      { title: 'Statistics for Beginners', search: 'statistics tutorial for beginners' },
      { title: 'Statistics Full Course', search: 'statistics full course' },
    ],
    docs: 'https://www.khanacademy.org/math/statistics-probability',
    project: 'Analyze a sample dataset and summarize insights',
  },

  'Data Visualization': {
    videos: [
      { title: 'Data Visualization Tutorial', search: 'data visualization tutorial for beginners' },
      { title: 'Tableau / Power BI Full Course', search: 'Tableau Power BI full course' },
    ],
    docs: 'https://www.tableau.com/learn',
    project: 'Create a dashboard visualizing a sample dataset',
  },

  'Machine Learning': {
    videos: [
      { title: 'Machine Learning for Beginners', search: 'machine learning tutorial for beginners' },
      { title: 'Machine Learning Full Course', search: 'machine learning full course' },
    ],
    docs: 'https://scikit-learn.org/stable/',
    project: 'Build a simple prediction model',
  },

  'Deep Learning': {
    videos: [
      { title: 'Deep Learning for Beginners', search: 'deep learning tutorial for beginners' },
      { title: 'Deep Learning Full Course', search: 'deep learning full course' },
    ],
    docs: 'https://www.tensorflow.org/tutorials',
    project: 'Build an image classifier',
  },

  'HTML/CSS': {
    videos: [
      { title: 'HTML CSS Tutorial for Beginners', search: 'HTML CSS tutorial for beginners' },
      { title: 'HTML CSS Full Course', search: 'HTML CSS full course' },
    ],
    docs: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    project: 'Build a responsive landing page',
  },

  'Node.js': {
    videos: [
      { title: 'Node.js Tutorial for Beginners', search: 'Node.js tutorial for beginners' },
      { title: 'Node.js Full Course', search: 'Node.js full course' },
    ],
    docs: 'https://nodejs.org/en/docs',
    project: 'Build a REST API using Node.js',
  },

  'CI/CD': {
    videos: [
      { title: 'CI/CD Tutorial for Beginners', search: 'CI CD pipeline tutorial for beginners' },
      { title: 'GitHub Actions Full Course', search: 'GitHub Actions full course' },
    ],
    docs: 'https://docs.github.com/en/actions',
    project: 'Set up a CI/CD pipeline with GitHub Actions',
  },

  'Cloud Computing': {
    videos: [
      { title: 'Cloud Computing for Beginners', search: 'cloud computing tutorial for beginners' },
      { title: 'AWS/Azure Full Course', search: 'AWS Azure cloud full course' },
    ],
    docs: 'https://docs.aws.amazon.com/',
    project: 'Deploy an app on a free cloud tier',
  },

  Networking: {
    videos: [
      { title: 'Networking Basics', search: 'computer networking tutorial for beginners' },
      { title: 'Networking Full Course', search: 'networking full course' },
    ],
    docs: 'https://www.cloudflare.com/learning/',
    project: 'Set up and troubleshoot a basic network',
  },

  Figma: {
    videos: [
      { title: 'Figma Tutorial for Beginners', search: 'Figma tutorial for beginners' },
      { title: 'Figma Full Course', search: 'Figma full course UI UX' },
    ],
    docs: 'https://help.figma.com/',
    project: 'Design a mobile app screen in Figma',
  },

  Wireframing: {
    videos: [
      { title: 'Wireframing Basics', search: 'wireframing tutorial for beginners' },
      { title: 'Wireframing Full Course', search: 'UX wireframing full course' },
    ],
    docs: 'https://www.figma.com/resource-library/what-is-wireframing/',
    project: 'Wireframe a website homepage',
  },

  Prototyping: {
    videos: [
      { title: 'Prototyping in Figma', search: 'Figma prototyping tutorial' },
      { title: 'UX Prototyping Full Course', search: 'UX prototyping full course' },
    ],
    docs: 'https://help.figma.com/hc/en-us/sections/360001445513-Prototyping',
    project: 'Build a clickable prototype for an app',
  },

  'User Research': {
    videos: [
      { title: 'User Research Basics', search: 'user research tutorial for beginners' },
      { title: 'UX Research Full Course', search: 'UX research full course' },
    ],
    docs: 'https://www.nngroup.com/articles/',
    project: 'Conduct 3 user interviews and summarize findings',
  },

  'Visual Design': {
    videos: [
      { title: 'Visual Design Basics', search: 'visual design tutorial for beginners' },
      { title: 'Visual Design Full Course', search: 'visual design full course' },
    ],
    docs: 'https://www.interaction-design.org/literature/topics/visual-design',
    project: 'Design a brand style guide',
  },

  'Design Systems': {
    videos: [
      { title: 'Design Systems Basics', search: 'design systems tutorial for beginners' },
      { title: 'Design Systems Full Course', search: 'design systems full course' },
    ],
    docs: 'https://www.designsystems.com/',
    project: 'Build a small component design system',
  },

  'Usability Testing': {
    videos: [
      { title: 'Usability Testing Basics', search: 'usability testing tutorial for beginners' },
      { title: 'Usability Testing Full Course', search: 'usability testing full course' },
    ],
    docs: 'https://www.nngroup.com/articles/usability-testing-101/',
    project: 'Run a usability test on an existing app',
  },

  'API Development': {
    videos: [
      { title: 'API Development Tutorial', search: 'REST API development tutorial for beginners' },
      { title: 'FastAPI Full Course', search: 'FastAPI full course' },
    ],
    docs: 'https://fastapi.tiangolo.com/',
    project: 'Build a REST API with authentication',
  },

  'System Design': {
    videos: [
      { title: 'System Design Basics', search: 'system design tutorial for beginners' },
      { title: 'System Design Full Course', search: 'system design full course' },
    ],
    docs: 'https://github.com/donnemartin/system-design-primer',
    project: 'Design a URL shortener system',
  },

  'Market Research': {
    videos: [
      { title: 'Market Research Basics', search: 'market research tutorial for beginners' },
      { title: 'Market Research Full Course', search: 'market research full course' },
    ],
    docs: 'https://www.hubspot.com/marketing',
    project: 'Do a competitor analysis for a product idea',
  },

  Roadmapping: {
    videos: [
      { title: 'Product Roadmapping Basics', search: 'product roadmap tutorial for beginners' },
      { title: 'Roadmapping Full Course', search: 'product roadmapping full course' },
    ],
    docs: 'https://www.atlassian.com/agile/product-management/product-roadmaps',
    project: 'Create a product roadmap for a sample app',
  },

  'Agile/Scrum': {
    videos: [
      { title: 'Agile Scrum Basics', search: 'agile scrum tutorial for beginners' },
      { title: 'Scrum Full Course', search: 'scrum master full course' },
    ],
    docs: 'https://www.scrum.org/resources',
    project: 'Run a mock sprint planning session',
  },

  'Stakeholder Management': {
    videos: [
      { title: 'Stakeholder Management Basics', search: 'stakeholder management tutorial for beginners' },
      { title: 'Stakeholder Management Full Course', search: 'stakeholder management full course' },
    ],
    docs: 'https://www.pmi.org/',
    project: 'Create a stakeholder communication plan',
  },

  'Requirements Gathering': {
    videos: [
      { title: 'Requirements Gathering Basics', search: 'requirements gathering tutorial for beginners' },
      { title: 'Business Analysis Full Course', search: 'business analysis requirements full course' },
    ],
    docs: 'https://www.iiba.org/',
    project: 'Write a requirements document for a feature',
  },

  'Business Process Modeling': {
    videos: [
      { title: 'Business Process Modeling Basics', search: 'business process modeling tutorial for beginners' },
      { title: 'BPMN Full Course', search: 'BPMN full course' },
    ],
    docs: 'https://www.bpmn.org/',
    project: 'Model a business process using BPMN',
  },

  MLOps: {
    videos: [
      { title: 'MLOps Basics', search: 'MLOps tutorial for beginners' },
      { title: 'MLOps Full Course', search: 'MLOps full course' },
    ],
    docs: 'https://ml-ops.org/',
    project: 'Set up a simple ML model deployment pipeline',
  },

  'Model Deployment': {
    videos: [
      { title: 'Model Deployment Basics', search: 'ML model deployment tutorial for beginners' },
      { title: 'Model Deployment Full Course', search: 'ML model deployment full course' },
    ],
    docs: 'https://fastapi.tiangolo.com/deployment/',
    project: 'Deploy a trained model as an API',
  },

  'Web Development': {
    videos: [
      { title: 'Web Development for Beginners', search: 'web development tutorial for beginners' },
      { title: 'Web Development Full Course', search: 'web development full course' },
    ],
    docs: 'https://developer.mozilla.org/en-US/docs/Learn',
    project: 'Build a full portfolio website',
  },
};

/* =====================================================
   TOKEN
===================================================== */

const getToken = () => {
  return (
    localStorage.getItem('ra_token') ||
    localStorage.getItem('ai-nexus-token') ||
    localStorage.getItem('token') ||
    ''
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStep, setSelectedStep] = useState(null);
  const [stepProgress, setStepProgress] = useState(0);

  const [savingProgress, setSavingProgress] = useState(false);
  const [completing, setCompleting] = useState(false);

  /* =====================================================
     FETCH ROADMAP
  ===================================================== */

  const fetchRoadmap = async () => {
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
        `${API_BASE_URL}/api/v1/career/roadmap/my`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log('Roadmap API Response:', result);

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            'Failed to load roadmap'
        );
      }

      if (!result.success) {
        throw new Error(
          result?.message || 'Failed to load roadmap'
        );
      }

      setRoadmap(result.data);
    } catch (err) {
      console.error('Roadmap Fetch Error:', err);
      setError(
        err.message ||
          'Something went wrong while loading roadmap'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getProgress = (step) => {
    return Number(
      step?.progress ??
        step?.completion_percentage ??
        0
    );
  };

  const getSkillName = (step) => {
    if (!step?.title) return '';

    return step.title
      .replace(/^Master\s+/i, '')
      .trim();
  };

  const getResources = (step) => {
    const skill = getSkillName(step);

    if (learningResources[skill]) {
      return learningResources[skill];
    }

    const matchedKey = Object.keys(
      learningResources
    ).find(
      (key) =>
        key.toLowerCase().trim() ===
        skill.toLowerCase().trim()
    );

    if (matchedKey) {
      return learningResources[matchedKey];
    }

    return {
      videos: [
        {
          title: `${skill} Tutorial for Beginners`,
          search: `${skill} tutorial for beginners`,
        },
        {
          title: `${skill} Full Course`,
          search: `${skill} full course`,
        },
      ],
      docs: `https://www.google.com/search?q=${encodeURIComponent(
        `${skill} official documentation`
      )}`,
      project: `Build a beginner project using ${skill}`,
    };
  };

  /* =====================================================
     STEP MODAL
  ===================================================== */

  const openStep = (step) => {
    if (step.status === 'pending') return;

    setSelectedStep(step);
    setStepProgress(getProgress(step));
  };

  const closeModal = () => {
    setSelectedStep(null);
    setStepProgress(0);
  };

  /* =====================================================
     RESOURCES
  ===================================================== */

  const openVideo = (searchQuery) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery
    )}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openDocs = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /* =====================================================
     UPDATE PROGRESS
  ===================================================== */

  const handleUpdateProgress = async () => {
    if (!selectedStep) return;

    try {
      setSavingProgress(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/roadmap/steps/${selectedStep.id}/progress`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress: stepProgress,
          }),
        }
      );

      const result = await response.json();

      console.log(
        'Progress Update Response:',
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            'Failed to update progress'
        );
      }

      const updatedStep = result?.data?.step;

      if (updatedStep) {
        setSelectedStep(updatedStep);
        setStepProgress(getProgress(updatedStep));
      }

      await fetchRoadmap();

      if (stepProgress >= 100) {
        alert(
          'Skill completed successfully! 🎉 Next step unlocked.'
        );
      } else {
        alert(
          `Progress updated to ${stepProgress}% 🎉`
        );
      }
    } catch (err) {
      console.error(
        'Progress Update Error:',
        err
      );

      alert(
        err.message ||
          'Failed to update progress'
      );
    } finally {
      setSavingProgress(false);
    }
  };

  /* =====================================================
     COMPLETE STEP
  ===================================================== */

  const handleCompleteStep = async () => {
    if (!selectedStep) return;

    try {
      setCompleting(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/roadmap/steps/${selectedStep.id}/complete`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log(
        'Complete Step Response:',
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            result?.message ||
            'Failed to complete step'
        );
      }

      await fetchRoadmap();

      closeModal();

      alert(
        'Skill marked as completed! 🎉'
      );
    } catch (err) {
      console.error(
        'Complete Step Error:',
        err
      );

      alert(
        err.message ||
          'Failed to complete step'
      );
    } finally {
      setCompleting(false);
    }
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        );

      case 'in_progress':
      case 'in-progress':
        return (
          <div className="relative w-11 h-11 rounded-full bg-indigo-500/15 border border-indigo-400/50 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
            <Zap className="w-5 h-5 text-indigo-400 relative z-10" />
          </div>
        );

      default:
        return (
          <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>

          <h2 className="text-white font-semibold text-lg">
            Building your roadmap
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Preparing your personalized learning journey...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b18] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-[#0d1326]/90 border border-red-500/20 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <Target className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Unable to Load Roadmap
          </h2>

          <p className="text-red-400 text-sm mb-6">
            {error}
          </p>

          <button
            onClick={fetchRoadmap}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const steps = roadmap?.steps || [];

  const overallProgress = Math.round(
    Number(roadmap?.overall_progress || 0)
  );

  const completedSteps =
    roadmap?.completed_steps || 0;

  const totalSteps =
    roadmap?.total_steps || steps.length;

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#070b18] text-white px-4 py-6 md:px-8 md:py-10">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 md:mb-10">

          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            PERSONALIZED LEARNING JOURNEY
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                {roadmap?.title || 'Your Learning Roadmap'}
              </h1>

              <p className="text-gray-400 max-w-2xl leading-relaxed">
                {roadmap?.description ||
                  'Follow your personalized path and build the skills you need for your career.'}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-gray-300">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Keep going
            </div>

          </div>
        </div>

        {/* =================================================
            PROGRESS HERO
        ================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111936] via-[#0d142b] to-[#10152d] p-6 md:p-8 mb-10 shadow-2xl">

          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row gap-8 items-center">

            {/* Circular progress */}

            <div className="relative w-40 h-40 flex-shrink-0">

              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="67"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-white/5"
                />

                <circle
                  cx="80"
                  cy="80"
                  r="67"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="421"
                  strokeDashoffset={
                    421 -
                    (421 * overallProgress) / 100
                  }
                  className="text-indigo-500 transition-all duration-1000"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">
                  {overallProgress}%
                </span>

                <span className="text-xs text-gray-500">
                  COMPLETE
                </span>
              </div>
            </div>

            {/* Progress details */}

            <div className="flex-1 w-full">

              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-1">
                  Overall Progress
                </p>

                <h2 className="text-2xl font-bold">
                  You're making progress 🚀
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Complete each skill to unlock the next stage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />

                  <p className="text-2xl font-bold">
                    {completedSteps}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Skills completed
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                  <Target className="w-5 h-5 text-indigo-400 mb-3" />

                  <p className="text-2xl font-bold">
                    {totalSteps}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Total skills
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                  <Clock3 className="w-5 h-5 text-purple-400 mb-3" />

                  <p className="text-2xl font-bold">
                    {roadmap?.estimated_duration_days || 0}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Days estimated
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* =================================================
            ROADMAP TITLE
        ================================================= */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-2xl font-bold">
              Your Learning Path
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Master each skill step by step
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Completed
            <span className="w-2 h-2 rounded-full bg-indigo-400 ml-3" />
            Current
            <span className="w-2 h-2 rounded-full bg-gray-600 ml-3" />
            Locked
          </div>

        </div>

        {/* =================================================
            STEPS
        ================================================= */}

        <div className="space-y-4">

          {steps.length === 0 ? (

            <div className="rounded-3xl border border-white/10 bg-[#0d1326] p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />

              <h3 className="text-lg font-bold mb-2">
                No roadmap steps yet
              </h3>

              <p className="text-gray-500 text-sm">
                Your personalized learning steps will appear here.
              </p>
            </div>

          ) : (

            steps.map((step, index) => {

              const progress = getProgress(step);

              const isCompleted =
                step.status === 'completed';

              const isCurrent =
                step.status === 'in_progress' ||
                step.status === 'in-progress';

              const isLocked =
                step.status === 'pending';

              return (
                <div
                  key={step.id || index}
                  className="relative"
                >

                  {/* Connector */}

                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-[21px] top-12 w-px h-[calc(100%+16px)] ${
                        isCompleted
                          ? 'bg-emerald-500/50'
                          : 'bg-white/10'
                      }`}
                    />
                  )}

                  <div className="relative flex gap-4 md:gap-5">

                    {/* Status */}

                    <div className="relative z-10 flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>

                    {/* Card */}

                    <button
                      type="button"
                      onClick={() => openStep(step)}
                      disabled={isLocked}
                      className={`text-left flex-1 group rounded-2xl border p-5 md:p-6 transition-all duration-300 ${
                        isLocked
                          ? 'bg-white/[0.015] border-white/5 opacity-45 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-indigo-500/[0.06] border-indigo-500/30 hover:border-indigo-400/50 hover:-translate-y-0.5'
                          : 'bg-[#0d1326]/80 border-white/10 hover:bg-[#111936] hover:border-white/20 hover:-translate-y-0.5'
                      }`}
                    >

                      <div className="flex flex-col md:flex-row md:items-center gap-5">

                        <div className="flex-1">

                          <div className="flex items-center gap-3 mb-2">

                            <span className="text-xs font-bold text-gray-600">
                              STEP {String(index + 1).padStart(2, '0')}
                            </span>

                            {isCompleted && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                COMPLETED
                              </span>
                            )}

                            {isCurrent && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                CURRENT
                              </span>
                            )}

                            {isLocked && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white/5 text-gray-500">
                                LOCKED
                              </span>
                            )}

                          </div>

                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-indigo-300 transition">
                            {step.title}
                          </h3>

                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {step.description}
                          </p>

                        </div>

                        {/* Progress */}

                        <div className="w-full md:w-52">

                          <div className="flex items-center justify-between mb-2">

                            <span className="text-xs text-gray-500">
                              Progress
                            </span>

                            <span
                              className={`text-sm font-bold ${
                                isCompleted
                                  ? 'text-emerald-400'
                                  : 'text-indigo-400'
                              }`}
                            >
                              {Math.round(progress)}%
                            </span>

                          </div>

                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">

                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  progress,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                        {!isLocked && (
                          <ChevronRight className="hidden md:block w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition" />
                        )}

                      </div>

                    </button>

                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* =================================================
          LEARNING MODAL
      ================================================= */}

      {selectedStep &&
        (() => {

          const resources =
            getResources(selectedStep);

          const isCompleted =
            selectedStep.status === 'completed';

          return (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={closeModal}
            >

              <div
                className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1124] shadow-2xl"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                {/* Modal header */}

                <div className="sticky top-0 z-20 bg-[#0b1124]/95 backdrop-blur-xl border-b border-white/10 p-5 md:p-7">

                  <div className="flex items-start justify-between gap-5">

                    <div>
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-2">
                        <BookOpen className="w-4 h-4" />
                        LEARNING MODULE
                      </div>

                      <h2 className="text-2xl md:text-3xl font-black">
                        {getSkillName(selectedStep)}
                      </h2>

                      <p className="text-sm text-gray-500 mt-2">
                        {selectedStep.description}
                      </p>
                    </div>

                    <button
                      onClick={closeModal}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>

                  </div>

                </div>

                <div className="p-5 md:p-7">

                  {/* Progress */}

                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-5 mb-7">

                    <div className="flex items-center justify-between mb-4">

                      <div>
                        <p className="font-bold">
                          Learning Progress
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Update this as you learn
                        </p>
                      </div>

                      <span className="text-2xl font-black text-indigo-400">
                        {stepProgress}%
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-white/5 overflow-hidden mb-5">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all"
                        style={{
                          width: `${stepProgress}%`,
                        }}
                      />

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={stepProgress}
                      disabled={isCompleted}
                      onChange={(e) =>
                        setStepProgress(
                          Number(e.target.value)
                        )
                      }
                      className="w-full accent-indigo-500 disabled:opacity-40"
                    />

                    <div className="flex justify-between text-[10px] text-gray-600 mt-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={
                          handleUpdateProgress
                        }
                        disabled={savingProgress}
                        className="mt-5 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
                      >
                        {savingProgress ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Progress
                          </>
                        )}
                      </button>
                    )}

                  </div>

                  {/* Resources */}

                  <div className="mb-7">

                    <div className="flex items-center gap-2 mb-4">
                      <Play className="w-5 h-5 text-red-400" />

                      <h3 className="font-bold text-lg">
                        Recommended Videos
                      </h3>
                    </div>

                    <div className="grid gap-3">

                      {resources.videos.map(
                        (video, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              openVideo(
                                video.search
                              )
                            }
                            className="group flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.025] hover:bg-red-500/[0.05] hover:border-red-500/20 transition text-left"
                          >

                            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                              <Play className="w-5 h-5 text-red-400" />
                            </div>

                            <div className="flex-1">
                              <h4 className="font-semibold group-hover:text-red-300 transition">
                                {video.title}
                              </h4>

                              <p className="text-xs text-gray-500 mt-1">
                                Find this course on YouTube
                              </p>
                            </div>

                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-red-400" />

                          </button>
                        )
                      )}

                    </div>
                  </div>

                  {/* Documentation */}

                  <button
                    type="button"
                    onClick={() =>
                      openDocs(resources.docs)
                    }
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.025] hover:bg-blue-500/[0.05] hover:border-blue-500/20 transition text-left mb-3"
                  >

                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold">
                        Official Documentation
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        Read official learning resources
                      </p>
                    </div>

                    <ExternalLink className="w-4 h-4 text-gray-600" />

                  </button>

                  {/* Project */}

                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.025]">

                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div>
                      <h4 className="font-semibold">
                        Practice Project
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        {resources.project}
                      </p>
                    </div>

                  </div>

                  {/* Complete */}

                  {!isCompleted && (
                    <button
                      onClick={
                        handleCompleteStep
                      }
                      disabled={
                        completing ||
                        savingProgress
                      }
                      className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Mark as Completed
                        </>
                      )}
                    </button>
                  )}

                  {isCompleted && (
                    <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">
                        Skill completed! 🎉
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default Roadmap;