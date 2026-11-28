
import React from "react";
import { Link } from "react-router-dom";


const features = [
  {
    number: "01",
    icon: "🎯",
    title: "AI Career Discovery",
    description:
      "Discover suitable career opportunities through AI-powered career assessment based on your interests, skills, strengths and professional goals.",
  },
  {
    number: "02",
    icon: "🗺️",
    title: "Personalized Career Roadmaps",
    description:
      "Build a personalized career roadmap with structured learning paths, essential skills and practical steps to achieve your career goals.",
  },
  {
    number: "03",
    icon: "🤖",
    title: "AI Learning Tutor",
    description:
      "Improve your technical knowledge with an AI learning tutor that explains concepts, answers questions and supports your learning journey.",
  },
  {
    number: "04",
    icon: "📄",
    title: "AI Resume Preparation",
    description:
      "Prepare a professional resume, organize your skills and improve how you present your qualifications to potential employers.",
  },
  {
    number: "05",
    icon: "💻",
    title: "Skill Assessments",
    description:
      "Evaluate your technical knowledge through skill-based assessments and identify areas where you can improve.",
  },
  {
    number: "06",
    icon: "🎤",
    title: "AI Interview Preparation",
    description:
      "Practice interview questions, improve your answers and build confidence before applying for job opportunities.",
  },
];


export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#071510] text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-6">
        <Link to="/" className="text-xl font-bold tracking-tight sm:text-2xl">
  <span className="text-emerald-400">Lerqon</span>{" "}
  <span className="text-white">AI Career</span>
</Link>

        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          <a href="#features" className="transition hover:text-emerald-400">
            Features
          </a>
          <a href="#about" className="transition hover:text-emerald-400">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm text-gray-200 transition hover:text-emerald-400"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-full px-3 py-2 text-xs text-gray-200 transition hover:text-emerald-400 sm:px-4 sm:text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:gap-14 sm:px-6 sm:pb-24 sm:pt-20 md:grid-cols-2 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Your journey. Your future. Your intelligence.
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
  AI Career Guidance
  <span className="block text-emerald-400">
    For Your Future
  </span>
  Starts Here.
</h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:mt-7 sm:text-base sm:leading-8 md:text-lg">
  Lerqon AI Career helps students and job seekers discover
suitable career paths, explore personalized learning roadmaps,
develop in-demand skills and prepare for interviews with
AI-powered career guidance.
</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              to="/register"
              className="w-full justify-center text-center rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-[#071510] shadow-lg shadow-emerald-950/30 transition hover:-translate-y-1 hover:bg-emerald-300 sm:w-auto"
            >
              Start Your Journey →
            </Link>

            <a
              href="#features"
              className="w-full justify-center text-center rounded-xl border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-emerald-400/50 hover:bg-white/5 sm:w-auto"
            >
              Explore Features
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Learn · Plan · Grow
          </p>
        </div>

        {/* Career dashboard preview */}
        <div className="relative z-10">
          <div className="absolute -inset-5 rounded-[2rem] bg-emerald-400/10 blur-3xl" />

          <div className="relative rounded-3xl border border-white/10 bg-[#10241b] p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Your Career Journey</p>
                <h2 className="mt-1 text-xl font-semibold">
                  Welcome to your future
                </h2>
              </div>
              <div className="rounded-xl bg-emerald-400/10 p-3 text-2xl">
                ✨
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <p className="text-sm text-emerald-300">Career Development</p>
              <h3 className="mt-2 text-2xl font-bold">
                Discover. Learn. Achieve.
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Turn your career goals into a clear learning journey.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["🎯", "Career Discovery"],
                ["🗺️", "Learning Roadmap"],
                ["🤖", "AI Tutor"],
                ["🎤", "Interview Practice"],
              ].map(([icon, title]) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="text-2xl">{icon}</span>
                  <p className="mt-3 text-sm font-medium text-gray-200">
                    {title}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/[0.04] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold">One platform, one goal</p>
                <p className="text-xs text-gray-400">
                  Build a career you are confident about.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
  id="features"
  className="border-t border-white/10 bg-[#0a1b13] px-4 py-16 sm:px-6 sm:py-24"
>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              What We Offer
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Everything You Need to
              <span className="text-emerald-400"> Grow</span>
            </h2>
            <p className="mt-5 leading-7 text-gray-400">
              From choosing your career to preparing for interviews, access
              useful tools throughout your career development journey.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-white/10 bg-[#10241b] p-7 transition duration-300 hover:-translate-y-2 hover:border-emerald-400/40 hover:bg-[#132b20]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{feature.icon}</span>
                  <span className="text-sm text-gray-600">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mt-7 text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      
{/* About */}
<section id="about" className="px-4 py-16 sm:px-6 sm:py-24">
  <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-[#123322] to-[#0c1b13] px-5 py-10 text-center sm:px-10 sm:py-14 md:px-16">

    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
      About Lerqon AI Career
    </p>

    <h2 className="mt-5 text-3xl font-bold md:text-4xl">
      AI-Powered Career Guidance for a Better Future
    </h2>

    <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-400">
      Lerqon AI Career is an AI-powered career guidance platform
designed for students, graduates and job seekers. It helps users
discover suitable career opportunities, explore personalized
learning roadmaps, assess their skills, prepare professional
resumes and practice job interviews. Our goal is to make career
planning and professional development easier through intelligent
learning tools and structured guidance.
    </p>

    <Link
      to="/register"
      className="mt-8 inline-flex rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-[#071510] transition hover:bg-emerald-300"
    >
      Get Started Today →
    </Link>

  </div>
</section>

        

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-semibold">
            <span className="text-emerald-400">Lerqon</span>{" "}AI Career
          </p>
          <p className="text-sm text-gray-500">
            Learn · Plan · Grow
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Lerqon AI Career. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
