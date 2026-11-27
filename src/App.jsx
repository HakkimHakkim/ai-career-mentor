
import React, { useState, lazy, Suspense } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import FloatingNav from './components/navigation/FloatingNav';

import Login from './pages/auth/Login';
import SecurityAction from './pages/auth/SecurityAction';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Landing from './pages/Landing';

// Lazy-loaded protected pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const CareerDiscovery = lazy(() => import('./pages/career/CareerDiscovery'));
const MyCareer = lazy(() => import('./pages/career/MyCareer'));
const Roadmap = lazy(() => import('./pages/career/Roadmap'));
const Learn = lazy(() => import('./pages/learning/Learn'));
const AiTutor = lazy(() => import('./pages/ai/AiTutor'));
const Resume = lazy(() => import('./pages/resume/Resume'));
const SkillQuizzes = lazy(() => import('./pages/jobs/SkillQuizzes'));
const Interview = lazy(() => import('./pages/interview/Interview'));
const Progress = lazy(() => import('./pages/profile/Progress'));
const Profile = lazy(() => import('./pages/profile/Profile'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-emerald-400">
      <div className="text-center">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />
        <p className="text-sm">Loading Career Intelligence...</p>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const [navCollapsed, setNavCollapsed] = useState(
    () => window.innerWidth < 768
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden bg-[#173B32] text-white">

        <FloatingNav
          collapsed={navCollapsed}
          setCollapsed={setNavCollapsed}
        />

        <main
          className={`
            min-h-screen
            transition-[margin]
            duration-300
            ease-in-out
            ${
              navCollapsed
                ? 'ml-0 md:ml-[88px]'
                : 'ml-0 md:ml-[262px]'
            }
          `}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/career-discovery" element={<CareerDiscovery />} />

              <Route path="/my-career" element={<MyCareer />} />

              <Route path="/roadmap" element={<Roadmap />} />

              <Route path="/learn" element={<Learn />} />

              <Route path="/ai-tutor" element={<AiTutor />} />

              <Route path="/resume" element={<Resume />} />

              <Route path="/skill-quizzes" element={<SkillQuizzes />} />

              <Route path="/interview" element={<Interview />} />

              <Route path="/progress" element={<Progress />} />

              <Route path="/profile" element={<Profile />} />

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />

            </Routes>
          </Suspense>
        </main>

      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>

        <div className="min-h-screen overflow-x-hidden bg-[#173B32] text-white">

          <Routes>

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/register"
              element={<Login isRegister />}
            />

            <Route
              path="/forgot-password"
              element={<Login isForgotPassword />}
            />

            <Route
              path="/verify-email"
              element={<SecurityAction />}
            />

            <Route
              path="/reset-password"
              element={<SecurityAction reset />}
            />

            <Route path="/*" element={<ProtectedApp />} />

          </Routes>

        </div>

      </Router>
    </ThemeProvider>
  );
}

export default App;
