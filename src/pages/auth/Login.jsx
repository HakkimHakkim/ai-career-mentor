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
    <div className="relative min-h-screen overflow-hidden bg-[#080d24] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        {/* Base gradient */}

        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-[#080d24]
            via-[#101642]
            to-[#24134d]
          "
        />

        {/* Soft glow */}

        <div
          className="
            absolute
            -left-32
            top-20
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-600/10
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            -right-32
            bottom-0
            h-[450px]
            w-[450px]
            rounded-full
            bg-indigo-600/10
            blur-[110px]
          "
        />

        {/* =================================================
            3D FLOATING OBJECTS
        ================================================= */}

        <div className="absolute inset-0 pointer-events-none">

          {/* Orb 1 */}

          <div
            className="
              absolute
              left-[10%]
              top-[18%]
              h-20
              w-20
              rounded-full
              border
              border-violet-300/10
              bg-violet-400/[0.04]
              shadow-[inset_-10px_-10px_30px_rgba(139,92,246,0.08)]
              backdrop-blur-sm
              animate-[floatOne_8s_ease-in-out_infinite]
            "
          />

          {/* Orb 2 */}

          <div
            className="
              absolute
              right-[12%]
              top-[20%]
              h-14
              w-14
              rounded-full
              border
              border-indigo-300/10
              bg-indigo-400/[0.04]
              animate-[floatTwo_10s_ease-in-out_infinite]
            "
          />

          {/* Rotating cube */}

          <div
            className="
              absolute
              left-[16%]
              bottom-[18%]
              h-16
              w-16
              rotate-45
              rounded-xl
              border
              border-violet-300/10
              bg-white/[0.025]
              backdrop-blur-sm
              animate-[rotateCube_14s_linear_infinite]
            "
          />

          {/* Diamond */}

          <div
            className="
              absolute
              right-[17%]
              bottom-[24%]
              h-20
              w-20
              rotate-45
              rounded-2xl
              border
              border-purple-300/10
              bg-purple-500/[0.035]
              backdrop-blur-sm
              animate-[floatThree_9s_ease-in-out_infinite]
            "
          />

          {/* Small particles */}

          <span
            className="
              absolute
              left-[28%]
              top-[22%]
              h-2
              w-2
              rounded-full
              bg-violet-300/30
              animate-pulse
            "
          />

          <span
            className="
              absolute
              right-[30%]
              bottom-[20%]
              h-1.5
              w-1.5
              rounded-full
              bg-indigo-300/30
              animate-pulse
            "
          />

          <span
            className="
              absolute
              right-[24%]
              top-[45%]
              h-1
              w-1
              rounded-full
              bg-purple-300/40
              animate-pulse
            "
          />

        </div>

        {/* Background grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-10
        "
      >

        <div className="w-full max-w-[470px]">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="mb-8 flex justify-center">

            <div className="flex items-center gap-3">

              {/* BOOK LOGO */}

              <div className="relative">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-violet-500
                    via-purple-500
                    to-indigo-500
                    shadow-[0_12px_35px_rgba(139,92,246,0.25)]
                  "
                >
                  <BookOpen
                    className="h-6 w-6 text-white"
                    strokeWidth={2.2}
                  />
                </div>

                <div
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#080d24]
                    bg-indigo-500
                  "
                >
                  <Sparkles
                    className="h-2.5 w-2.5 text-white"
                  />
                </div>

              </div>

              <div>
                <h1
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  Career Mentor
                </h1>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-violet-300/60
                  "
                >
                  Intelligence
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.09]
              bg-[#101633]/90
              p-7
              shadow-[0_30px_90px_rgba(0,0,0,0.38)]
              backdrop-blur-2xl
              sm:p-9
            "
          >

            {/* Card glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-48
                w-48
                rounded-full
                bg-violet-500/[0.07]
                blur-3xl
              "
            />

            <div className="relative">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-8">

                <p
                  className="
                    mb-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300/70
                  "
                >
                  Career Intelligence
                </p>

                <h2
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  {pageTitle}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
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
                    border-red-400/15
                    bg-red-500/[0.07]
                    px-4
                    py-3
                    text-sm
                    text-red-300
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
                    border-emerald-400/15
                    bg-emerald-500/[0.07]
                    px-4
                    py-3
                    text-sm
                    text-emerald-300
                  "
                >
                  <CheckCircle2 className="h-4 w-4" />
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
                        text-slate-300
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
                          text-slate-500
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
                          rounded-2xl
                          border
                          border-white/[0.08]
                          bg-[#0a1029]
                          pl-12
                          pr-4
                          text-sm
                          text-white
                          outline-none
                          placeholder:text-slate-600
                          transition
                          focus:border-violet-500/50
                          focus:bg-[#0c1230]
                          focus:ring-4
                          focus:ring-violet-500/[0.06]
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
                      text-slate-300
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
                        text-slate-500
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
    rounded-2xl
    border
    border-white/[0.08]
    bg-[#0a1029]
    pl-12
    pr-4
    text-sm
    text-white
    outline-none
    placeholder:text-slate-600
    transition
    focus:border-violet-500/50
    focus:bg-[#0c1230]
    focus:ring-4
    focus:ring-violet-500/[0.06]
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
                          text-slate-300
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
                            text-violet-400
                            transition
                            hover:text-violet-300
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
                          text-slate-500
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
                          rounded-2xl
                          border
                          border-white/[0.08]
                          bg-[#0a1029]
                          pl-12
                          pr-12
                          text-sm
                          text-white
                          outline-none
                          placeholder:text-slate-600
                          transition
                          focus:border-violet-500/50
                          focus:bg-[#0c1230]
                          focus:ring-4
                          focus:ring-violet-500/[0.06]
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
                          text-slate-500
                          transition
                          hover:text-slate-300
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
                        text-slate-400
                      "
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="
                          h-4
                          w-4
                          rounded
                          border-white/10
                          bg-[#0a1029]
                          accent-violet-500
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
                    rounded-2xl
                    bg-gradient-to-r
                    from-violet-600
                    to-indigo-600
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_12px_30px_rgba(99,102,241,0.18)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_16px_40px_rgba(99,102,241,0.25)]
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

              <div className="mt-7 text-center">

                {isForgotPassword ? (
                  <button
                    onClick={() =>
                      navigate('/login')
                    }
                    className="
                      text-sm
                      font-medium
                      text-violet-400
                      hover:text-violet-300
                    "
                  >
                    ← Back to sign in
                  </button>
                ) : isRegister ? (
                  <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <button
                      onClick={() =>
                        navigate('/login')
                      }
                      className="
                        font-semibold
                        text-violet-400
                        hover:text-violet-300
                      "
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button
                      onClick={() =>
                        navigate('/register')
                      }
                      className="
                        font-semibold
                        text-violet-400
                        hover:text-violet-300
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
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  text-slate-600
                "
              >
                <ShieldCheck className="h-4 w-4" />

                Secure career workspace
              </div>

            </div>

          </div>

          {/* Footer */}

          <p
            className="
              mt-6
              text-center
              text-[10px]
              tracking-wide
              text-slate-700
            "
          >
            Your career data stays protected
          </p>

        </div>

      </div>

      {/* =======================================================
          ANIMATION KEYFRAMES
      ======================================================= */}

      <style>{`
        @keyframes floatOne {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(18px, -22px, 0) rotate(8deg);
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-20px, 25px, 0);
          }
        }

        @keyframes floatThree {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(45deg);
          }

          50% {
            transform: translate3d(-18px, -20px, 0) rotate(65deg);
          }
        }

        @keyframes rotateCube {
          from {
            transform: rotate(45deg);
          }

          to {
            transform: rotate(405deg);
          }
        }
      `}</style>

    </div>
  );
};

export default Login;