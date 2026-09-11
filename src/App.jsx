import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import FloatingNav from './components/navigation/FloatingNav';

import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Dashboard from './pages/dashboard/Dashboard';
import CareerDiscovery from './pages/career/CareerDiscovery';
import MyCareer from './pages/career/MyCareer';
import Roadmap from './pages/career/Roadmap';
import Learn from './pages/learning/Learn';
import AiTutor from './pages/ai/AiTutor';
import Resume from './pages/resume/Resume';
import SkillQuizzes from './pages/jobs/SkillQuizzes';
import Interview from './pages/interview/Interview';
import Progress from './pages/profile/Progress';
import Profile from './pages/profile/Profile';

function ProtectedApp() {
  const [navCollapsed, setNavCollapsed] = useState(
    () => window.innerWidth < 768
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden bg-[#080d24] text-white">

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
          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/career-discovery"
              element={<CareerDiscovery />}
            />

            <Route
              path="/my-career"
              element={<MyCareer />}
            />

            <Route
              path="/roadmap"
              element={<Roadmap />}
            />

            <Route
              path="/learn"
              element={<Learn />}
            />

            <Route
              path="/ai-tutor"
              element={<AiTutor />}
            />

            <Route
              path="/resume"
              element={<Resume />}
            />

            <Route
              path="/skill-quizzes"
              element={<SkillQuizzes />}
            />

            <Route
              path="/interview"
              element={<Interview />}
            />

            <Route
              path="/progress"
              element={<Progress />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </main>

      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>

        <div className="min-h-screen overflow-x-hidden bg-[#080d24] text-white">

          <Routes>

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={
                <Login isRegister />
              }
            />

            <Route
              path="/forgot-password"
              element={
                <Login isForgotPassword />
              }
            />

            <Route
              path="/*"
              element={<ProtectedApp />}
            />

          </Routes>

        </div>

      </Router>
    </ThemeProvider>
  );
}

export default App;