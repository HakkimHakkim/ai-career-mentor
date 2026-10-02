import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Map,
  Bot,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const Login = ({
  isRegister = false,
  isForgotPassword = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // IMPORTANT:
  // If already logged in, don't keep showing login page.
  // =========================================================



  // =========================================================
  // MODE
  // =========================================================

  const pageTitle = isForgotPassword
    ? 'Reset your password'
    : isRegister
    ? 'Create your account'
    : 'Welcome back';

  const pageSubtitle = isForgotPassword
    ? 'Enter your email to reset your password'
    : isRegister
    ? 'Start building your career with confidence'
    : 'Sign in to continue your career journey';

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            'Invalid email or password.'
        );
      }

      // =====================================================
      // TOKEN HANDLING
      // =====================================================

      const token =
        data?.access_token ||
        data?.token ||
        data?.data?.access_token ||
        data?.data?.token;

      if (!token) {
        throw new Error(
          'Login successful, but authentication token was not received.'
        );
      }

      localStorage.setItem(
        'ra_token',
        token
      );

      // Optional user information

      const user =
        data?.user ||
        data?.data?.user ||
        null;

      if (user) {
        localStorage.setItem(
          'ra_user',
          JSON.stringify(user)
        );
      }

      setSuccess('Login successful. Welcome back!');

      // =====================================================
      // REDIRECT
      // =====================================================

      const from =
        location.state?.from || '/dashboard';

      setTimeout(() => {
        navigate(from, {
          replace: true,
        });
      }, 500);

    } catch (err) {
      console.error('Login error:', err);

      setError(
        err?.message ||
          'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        'Please complete all required fields.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            'Registration failed.'
        );
      }

      setSuccess(
        'Account created successfully. Please sign in.'
      );

      setTimeout(() => {
        navigate('/login', {
          replace: true,
        });
      }, 1000);

    } catch (err) {
      console.error(
        'Registration error:',
        err
      );

      setError(
        err?.message ||
          'Unable to create account.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    try {
      setLoading(true);

      /*
        Keep your existing forgot-password
        endpoint here if your backend already has one.

        This UI intentionally doesn't assume
        a different backend contract.
      */

      setSuccess(
        'If this email exists, password reset instructions will be sent.'
      );

    } catch (err) {
      console.error(
        'Forgot password error:',
        err
      );

      setError(
        'Unable to process your request.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = isForgotPassword
    ? handleForgotPassword
    : isRegister
    ? handleRegister
    : handleLogin;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#173B32] lg:grid lg:grid-cols-[1.05fr_1fr]">

      {/* =====================================================
          LEFT BRAND PANEL (DESKTOP)
      ===================================================== */}

      <aside className="relative hidden overflow-hidden bg-[#173B32] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">

        {/* Subtle line pattern */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.07]
            [background-image:linear-gradient(#F6F1E8_1px,transparent_1px),linear-gradient(90deg,#F6F1E8_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />

        {/* Concentric rings */}

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full border border-[#F6F1E8]/10" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full border border-[#F6F1E8]/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-[280px] w-[280px] rounded-full border border-[#E4B84A]/30" />

        {/* Accent dots */}

        <span className="pointer-events-none absolute right-[18%] top-[16%] h-3 w-3 rounded-full bg-[#E4B84A]" />
        <span className="pointer-events-none absolute right-[30%] top-[28%] h-2 w-2 rounded-full bg-[#D66A4A]" />

        {/* ---------- BRAND ---------- */}

        <div className="relative flex items-center gap-3">

          <div className="relative">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F1E8] text-[#173B32]">
              <BookOpen
                className="h-6 w-6"
                strokeWidth={2.2}
              />
            </div>

            <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#173B32] bg-[#D66A4A]">
              <Sparkles className="h-2.5 w-2.5 text-[#FFFDF8]" />
            </div>

          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F6F1E8]">
              Career Mentor
            </h1>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E4B84A]">
              Intelligence
            </p>
          </div>

        </div>

        {/* ---------- MESSAGE ---------- */}

        <div className="relative max-w-lg">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E4B84A]/40 bg-[#E4B84A]/15 px-3 py-1.5">

            <Sparkles className="h-3.5 w-3.5 text-[#E4B84A]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E4B84A]">
              Learn · Plan · Grow
            </span>

          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#F6F1E8] xl:text-5xl">
            Build your career,
            <span className="block text-[#E4B84A]">
              one skill at a time.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#F6F1E8]/70">
            Discover the right career path, follow a personalized
            roadmap and learn with guidance made for you.
          </p>

          {/* Features */}

          <div className="mt-10 space-y-4">

            {[
              {
                icon: Compass,
                title: 'Career discovery',
                text: 'Find paths that match your skills and interests.',
              },
              {
                icon: Map,
                title: 'Personalized roadmap',
                text: 'A step-by-step plan built around your goal.',
              },
              {
                icon: Bot,
                title: 'AI tutor',
                text: 'Ask questions and get help whenever you need it.',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-[#F6F1E8]/10 bg-[#F6F1E8]/[0.06] p-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E8]/10">
                    <Icon className="h-5 w-5 text-[#E4B84A]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#F6F1E8]">
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#F6F1E8]/60">
                      {item.text}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* ---------- FOOT ---------- */}

        <div className="relative flex items-center gap-2 text-xs text-[#F6F1E8]/50">
          <ShieldCheck className="h-4 w-4" />
          Your career data stays protected
        </div>

      </aside>

      {/* =====================================================
          RIGHT FORM PANEL
      ===================================================== */}

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">

        {/* Soft corner accent */}

        <div className="pointer-events-none absolute right-0 top-0 h-2 w-full bg-[#D66A4A] lg:hidden" />

        <div className="w-full max-w-[460px]">

          {/* =================================================
              MOBILE BRAND
          ================================================= */}

          <div className="mb-8 flex justify-center lg:hidden">

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173B32]">
                  <BookOpen
                    className="h-6 w-6 text-[#F6F1E8]"
                    strokeWidth={2.2}
                  />
                </div>

                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#F6F1E8] bg-[#D66A4A]">
                  <Sparkles className="h-2.5 w-2.5 text-[#FFFDF8]" />
                </div>

              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#173B32]">
                  Career Mentor
                </h1>

                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#D66A4A]">
                  Intelligence
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              FORM CARD
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] shadow-[0_4px_20px_rgba(23,59,50,0.08)]">

            {/* Top accent */}

            <div className="flex h-1.5 w-full">
              <span className="h-full flex-1 bg-[#173B32]" />
              <span className="h-full w-16 bg-[#D66A4A]" />
              <span className="h-full w-10 bg-[#E4B84A]" />
            </div>

            <div className="p-7 sm:p-9">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-8">

                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D66A4A]">
                  Career Intelligence
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#173B32]">
                  {pageTitle}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#66736B]">
                  {pageSubtitle}
                </p>

              </div>

              {/* =================================================
                  ALERTS
              ================================================= */}

              {error && (
                <div
                  className="
                    mb-5
                    rounded-xl
                    border
                    border-[#B94F35]/30
                    bg-[#B94F35]/10
                    px-4
                    py-3
                    text-sm
                    text-[#B94F35]
                  "
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#78927A]/40
                    bg-[#78927A]/15
                    px-4
                    py-3
                    text-sm
                    text-[#173B32]
                  "
                >
                  <CheckCircle2 className="h-4 w-4 text-[#78927A]" />
                  {success}
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}

                {isRegister && (
                  <div>
                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-[#173B32]
                      "
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <BookOpen
                        className="
                          absolute
                          left-4
                          top-1/2
                          h-5
                          w-5
                          -translate-y-1/2
                          text-[#8A948D]
                        "
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        placeholder="Your name"
                        className="
                          h-14
                          w-full
                          rounded-xl
                          border
                          border-[#DED8CC]
                          bg-[#FFFDF8]
                          pl-12
                          pr-4
                          text-sm
                          text-[#173B32]
                          outline-none
                          placeholder:text-[#8A948D]
                          transition
                          focus:border-[#173B32]
                          focus:ring-4
                          focus:ring-[#173B32]/10
                        "
                      />

                    </div>
                  </div>
                )}

                {/* EMAIL */}

                <div>
                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-[#173B32]
                    "
                  >
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-5
                        w-5
                        -translate-y-1/2
                        text-[#8A948D]
                      "
                    />

                    <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  autoComplete="off"
  className="
    h-14
    w-full
    rounded-xl
    border
    border-[#DED8CC]
    bg-[#FFFDF8]
    pl-12
    pr-4
    text-sm
    text-[#173B32]
    outline-none
    placeholder:text-[#8A948D]
    transition
    focus:border-[#173B32]
    focus:ring-4
    focus:ring-[#173B32]/10
  "
/>
                  </div>
                </div>

                {/* PASSWORD */}

                {!isForgotPassword && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">

                      <label
                        className="
                          block
                          text-xs
                          font-semibold
                          text-[#173B32]
                        "
                      >
                        Password
                      </label>

                      {!isRegister && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              '/forgot-password'
                            )
                          }
                          className="
                            text-xs
                            font-medium
                            text-[#D66A4A]
                            transition
                            hover:text-[#B94F35]
                          "
                        >
                          Forgot password?
                        </button>
                      )}

                    </div>

                    <div className="relative">

                      <Lock
                        className="
                          absolute
                          left-4
                          top-1/2
                          h-5
                          w-5
                          -translate-y-1/2
                          text-[#8A948D]
                        "
                      />

                      <input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        placeholder="Enter your password"
                        autoComplete={
                          isRegister
                            ? 'new-password'
                            : 'current-password'
                        }
                        className="
                          h-14
                          w-full
                          rounded-xl
                          border
                          border-[#DED8CC]
                          bg-[#FFFDF8]
                          pl-12
                          pr-12
                          text-sm
                          text-[#173B32]
                          outline-none
                          placeholder:text-[#8A948D]
                          transition
                          focus:border-[#173B32]
                          focus:ring-4
                          focus:ring-[#173B32]/10
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-[#8A948D]
                          transition
                          hover:text-[#173B32]
                        "
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>

                    </div>
                  </div>
                )}

                {/* =================================================
                    REMEMBER
                ================================================= */}

                {!isRegister &&
                  !isForgotPassword && (
                    <label
                      className="
                        flex
                        cursor-pointer
                        items-center
                        gap-3
                        text-xs
                        text-[#66736B]
                      "
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="
                          h-4
                          w-4
                          rounded
                          border-[#DED8CC]
                          bg-[#FFFDF8]
                          accent-[#173B32]
                        "
                      />

                      Remember me
                    </label>
                  )}

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#D66A4A]
                    text-sm
                    font-bold
                    text-[#FFFDF8]
                    shadow-[0_2px_8px_rgba(214,106,74,0.3)]
                    transition-colors
                    duration-200
                    hover:bg-[#C45C3D]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        className="
                          h-5
                          w-5
                          animate-spin
                        "
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      {isForgotPassword
                        ? 'Send Reset Link'
                        : isRegister
                        ? 'Create Account'
                        : 'Sign In'}

                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  SWITCH AUTH MODE
              ================================================= */}

              <div className="mt-7 border-t border-[#DED8CC] pt-6 text-center">

                {isForgotPassword ? (
                  <button
                    onClick={() =>
                      navigate('/login')
                    }
                    className="
                      text-sm
                      font-medium
                      text-[#D66A4A]
                      hover:text-[#B94F35]
                    "
                  >
                    ← Back to sign in
                  </button>
                ) : isRegister ? (
                  <p className="text-sm text-[#66736B]">
                    Already have an account?{' '}
                    <button
                      onClick={() =>
                        navigate('/login')
                      }
                      className="
                        font-semibold
                        text-[#D66A4A]
                        hover:text-[#B94F35]
                      "
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-[#66736B]">
                    Don't have an account?{' '}
                    <button
                      onClick={() =>
                        navigate('/register')
                      }
                      className="
                        font-semibold
                        text-[#D66A4A]
                        hover:text-[#B94F35]
                      "
                    >
                      Create one
                    </button>
                  </p>
                )}

              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  text-[#8A948D]
                "
              >
                <ShieldCheck className="h-4 w-4 text-[#78927A]" />

                Secure career workspace
              </div>

            </div>

          </div>

          {/* Footer */}

          <p
            className="
              mt-6
              text-center
              text-[11px]
              tracking-wide
              text-[#8A948D]
              lg:hidden
            "
          >
            Your career data stays protected
          </p>

        </div>

      </main>

    </div>
  );
};

export default Login;