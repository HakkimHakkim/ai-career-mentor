import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Menu,
  PanelLeftClose,
  LogOut,
  LayoutDashboard,
  Compass,
  Briefcase,
  Map,
  BookOpen,
  Bot,
  FileText,
  Brain,
  Zap,
  TrendingUp,
  User,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const FloatingNav = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // NAVIGATION ITEMS
  // =========================

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Compass,
      label: 'Career Discovery',
      path: '/career-discovery',
    },
    {
      icon: Briefcase,
      label: 'My Career',
      path: '/my-career',
    },
    {
      icon: Map,
      label: 'Roadmap',
      path: '/roadmap',
    },
    {
      icon: BookOpen,
      label: 'Learn',
      path: '/learn',
    },
    {
      icon: Bot,
      label: 'AI Tutor',
      path: '/ai-tutor',
    },
    {
      icon: FileText,
      label: 'Resume',
      path: '/resume',
    },
    {
      icon: Brain,
      label: 'Skill Quizzes',
      path: '/skill-quizzes',
    },
    {
      icon: Zap,
      label: 'Interview',
      path: '/interview',
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      path: '/progress',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
  ];

  // =========================
  // ACTIVE PAGE
  // =========================

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    return location.pathname.startsWith(path);
  };

  // =========================
  // NAVIGATE
  // =========================

  const handleNavigate = (path) => {
    navigate(path);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('ra_token');
    localStorage.removeItem('token');
    localStorage.removeItem('ai-nexus-token');
    localStorage.removeItem('ra_user');

    navigate('/login', { replace: true });
  };

  return (
    <aside
  className={`
    fixed
    left-2
    top-2
    bottom-2
    md:left-4
    md:top-4
    md:bottom-4
    z-50

        flex
        flex-col

        rounded-[26px]

        border
        border-white/[0.07]

        bg-[#0d1330]

        shadow-[0_20px_70px_rgba(0,0,0,0.38)]

        backdrop-blur-2xl

        transition-all
        duration-300
        ease-[cubic-bezier(.4,0,.2,1)]

        ${
          collapsed
            ? 'w-[72px]'
            : 'w-[250px]'
        }
      `}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className={`
          flex
          items-center

          border-b
          border-white/[0.07]

          ${
            collapsed
              ? 'justify-center px-2 py-5'
              : 'justify-between px-4 py-5'
          }
        `}
      >
        {/* ================= LOGO ================= */}

        <div
          className={`
            flex
            items-center

            ${
              collapsed
                ? 'justify-center'
                : 'gap-3'
            }
          `}
        >
          <div className="relative shrink-0">
            <div className="relative shrink-0">
  <div
    className="
      flex h-11 w-11 items-center justify-center
      rounded-2xl
      bg-gradient-to-br
      from-violet-500
      via-purple-500
      to-indigo-500
      text-white
      shadow-[0_8px_25px_rgba(139,92,246,0.25)]
    "
  >
    <BookOpen className="h-5 w-5" strokeWidth={2.2} />
  </div>

  <div
    className="
      absolute -right-1 -top-1
      flex h-4 w-4 items-center justify-center
      rounded-full
      bg-indigo-500
      border-2 border-[#0c1230]
    "
  >
    <Sparkles className="h-2.5 w-2.5 text-white" />
  </div>

  <div
    className="
      absolute -bottom-1 -right-1
      h-3 w-3 rounded-full
      border-2 border-[#0c1230]
      bg-emerald-400
    "
  />
</div>

            {/* ONLINE INDICATOR */}

            <span
              className="
                absolute
                -bottom-1
                -right-1

                h-3
                w-3

                rounded-full

                border-2
                border-[#0d1330]

                bg-emerald-400

                shadow-[0_0_10px_rgba(52,211,153,0.5)]
              "
            />
          </div>

          {/* BRAND */}

          {!collapsed && (
            <div className="min-w-0">
              <h2
                className="
                  text-sm
                  font-bold
                  tracking-wide
                  text-white
                "
              >
                Career
              </h2>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-violet-300/60
                "
              >
                Intelligence
              </p>
            </div>
          )}
        </div>

        {/* ================= COLLAPSE ================= */}

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={
            collapsed
              ? 'Expand navigation'
              : 'Minimize navigation'
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-xl

            border
            border-white/[0.08]

            bg-white/[0.035]

            text-white/45

            transition-all
            duration-200

            hover:border-violet-400/20
            hover:bg-violet-500/10
            hover:text-white
          "
        >
          {collapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* =====================================================
          WORKSPACE
      ===================================================== */}

      {!collapsed && (
        <div className="px-5 pb-2 pt-5">
          <div className="flex items-center gap-2">
            <Sparkles
              className="
                h-3
                w-3
                text-violet-400/70
              "
            />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-white/25
              "
            >
              Workspace
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-2.5
          py-2

          scrollbar-thin
          scrollbar-thumb-white/10
          scrollbar-track-transparent
        "
      >
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                className={`
                  group
                  relative

                  flex
                  w-full
                  items-center

                  rounded-xl

                  transition-all
                  duration-200

                  ${
                    collapsed
                      ? 'justify-center px-2 py-3'
                      : 'gap-3 px-3 py-2.5'
                  }

                  ${
                    active
                      ? `
                        bg-violet-500/[0.13]
                        text-violet-200

                        shadow-[inset_0_0_20px_rgba(139,92,246,0.035)]
                      `
                      : `
                        text-white/45

                        hover:bg-white/[0.045]
                        hover:text-white/90
                      `
                  }
                `}
              >
                {/* ACTIVE LINE */}

                <span
                  className={`
                    absolute
                    left-0
                    top-1/2

                    h-6
                    w-[3px]

                    -translate-y-1/2

                    rounded-r-full

                    bg-gradient-to-b
                    from-violet-400
                    to-indigo-500

                    transition-opacity
                    duration-200

                    ${
                      active
                        ? 'opacity-100'
                        : 'opacity-0'
                    }
                  `}
                />

                {/* ICON */}

                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-violet-500/[0.15]
                          text-violet-300
                        `
                        : `
                          text-white/40

                          group-hover:bg-violet-500/[0.08]
                          group-hover:text-violet-300
                        `
                    }
                  `}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </div>

                {/* LABEL */}

                {!collapsed && (
                  <>
                    <span
                      className={`
                        flex-1
                        truncate
                        text-left
                        text-xs

                        ${
                          active
                            ? 'font-semibold text-white'
                            : 'font-medium text-white/55'
                        }
                      `}
                    >
                      {item.label}
                    </span>

                    {active && (
                      <ChevronRight
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-violet-300/70
                        "
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          FOOTER
          ONLY LOGOUT
      ===================================================== */}

      <div
        className="
          border-t
          border-white/[0.07]

          p-2.5
        "
      >
        <button
          onClick={handleLogout}
          title={
            collapsed
              ? 'Logout'
              : undefined
          }
          className={`
            group
            flex
            w-full
            items-center

            rounded-xl

            text-red-400/75

            transition-all
            duration-200

            hover:bg-red-500/[0.09]
            hover:text-red-300

            ${
              collapsed
                ? 'justify-center px-2 py-3'
                : 'gap-3 px-3 py-2.5'
            }
          `}
        >
          {/* LOGOUT ICON */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-xl

              bg-red-500/[0.06]

              text-red-400/70

              transition-all
              duration-200

              group-hover:bg-red-500/[0.12]
              group-hover:text-red-300
            "
          >
            <LogOut
              className="
                h-[17px]
                w-[17px]

                transition-transform
                duration-200

                group-hover:translate-x-0.5
              "
            />
          </div>

          {!collapsed && (
            <span
              className="
                text-xs
                font-semibold
              "
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default FloatingNav;