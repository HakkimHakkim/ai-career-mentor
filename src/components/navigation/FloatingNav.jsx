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

    // Mobile-la page select pannumbothu navigation close
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
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

  // =========================
  // TOGGLE NAVIGATION
  // =========================

  const toggleNavigation = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
          ONLY VISIBLE WHEN NAVIGATION IS CLOSED
      ===================================================== */}

      {collapsed && (
        <button
          type="button"
          onClick={toggleNavigation}
          aria-label="Open navigation"
          className="
            fixed
            left-3
            top-3
            z-[60]

            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-2xl

            border
            border-[#E4B84A]/40

            bg-[#173B32]

            text-[#F6F1E8]

            shadow-[0_6px_20px_rgba(23,59,50,0.3)]

            transition-all
            duration-200

            hover:bg-[#1F4A3F]

            active:scale-95

            md:hidden
          "
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* =====================================================
          MOBILE BACKDROP
          ONLY WHEN NAVIGATION IS OPEN
      ===================================================== */}

      {!collapsed && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setCollapsed(true)}
          className="
            fixed
            inset-0
            z-40

            bg-[#173B32]/50

            md:hidden
          "
        />
      )}

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <aside
        className={`
          fixed
          z-50

          flex
          flex-col

          overflow-hidden

          rounded-[26px]

          border
          border-[#0F2B24]

          bg-[#173B32]

          shadow-[0_12px_40px_rgba(23,59,50,0.35)]

          transition-all
          duration-300
          ease-[cubic-bezier(.4,0,.2,1)]

          /* ================= MOBILE ================= */

          left-2
          top-2
          bottom-2
          w-[280px]

          ${
            collapsed
              ? '-translate-x-[110%] opacity-0 pointer-events-none'
              : 'translate-x-0 opacity-100 pointer-events-auto'
          }

          /* ================= DESKTOP ================= */

          md:left-4
          md:top-4
          md:bottom-4
          md:translate-x-0
          md:opacity-100
          md:pointer-events-auto

          ${
            collapsed
              ? 'md:w-[72px]'
              : 'md:w-[250px]'
          }
        `}
      >
        {/* TOP ACCENT STRIP */}

        <div className="h-1.5 w-full shrink-0 bg-[#E4B84A]" />

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className={`
            flex
            items-center

            border-b
            border-[#F6F1E8]/10

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
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center

                  rounded-xl

                  bg-[#F6F1E8]

                  text-[#173B32]
                "
              >
                <BookOpen
                  className="h-5 w-5"
                  strokeWidth={2.2}
                />
              </div>

              <div
                className="
                  absolute
                  -right-1.5
                  -top-1.5

                  flex
                  h-5
                  w-5
                  items-center
                  justify-center

                  rounded-full

                  border-2
                  border-[#173B32]

                  bg-[#D66A4A]
                "
              >
                <Sparkles
                  className="h-2.5 w-2.5 text-[#FFFDF8]"
                />
              </div>
            </div>

            {/* BRAND */}

            {!collapsed && (
              <div className="min-w-0">
                <h2
                  className="
                    text-base
                    font-bold
                    tracking-wide
                    text-[#F6F1E8]
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

                    text-[#E4B84A]
                  "
                >
                  Intelligence
                </p>
              </div>
            )}
          </div>

          {/* ================= COLLAPSE ================= */}

          <button
            type="button"
            onClick={toggleNavigation}
            aria-label={
              collapsed
                ? 'Expand navigation'
                : 'Minimize navigation'
            }
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

              rounded-lg

              border
              border-[#F6F1E8]/15

              bg-[#F6F1E8]/5

              text-[#F6F1E8]/70

              transition-colors
              duration-200

              hover:bg-[#F6F1E8]/15
              hover:text-[#F6F1E8]
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
            <div className="flex items-center gap-3">
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#F6F1E8]/45
                "
              >
                Workspace
              </span>

              <span className="h-px flex-1 bg-[#F6F1E8]/10" />
            </div>
          </div>
        )}

        {/* =====================================================
            NAVIGATION ITEMS
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
                  type="button"
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

                    transition-colors
                    duration-200

                    ${
                      collapsed
                        ? 'justify-center px-2 py-3'
                        : 'gap-3 px-3 py-2.5'
                    }

                    ${
                      active
                        ? `
                          bg-[#F6F1E8]
                          text-[#173B32]

                          shadow-[0_2px_8px_rgba(0,0,0,0.18)]
                        `
                        : `
                          text-[#F6F1E8]/70

                          hover:bg-[#F6F1E8]/10
                          hover:text-[#F6F1E8]
                        `
                    }
                  `}
                >
                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center

                      rounded-lg

                      transition-colors
                      duration-200

                      ${
                        active
                          ? `
                            bg-[#D66A4A]
                            text-[#FFFDF8]
                          `
                          : `
                            bg-[#F6F1E8]/5
                            text-[#F6F1E8]/70

                            group-hover:bg-[#F6F1E8]/10
                            group-hover:text-[#E4B84A]
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
                          text-[13px]

                          ${
                            active
                              ? 'font-bold text-[#173B32]'
                              : 'font-medium'
                          }
                        `}
                      >
                        {item.label}
                      </span>

                      {active && (
                        <ChevronRight
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-[#D66A4A]
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
        ===================================================== */}

        <div
          className="
            border-t
            border-[#F6F1E8]/10

            p-2.5
          "
        >
          <button
            type="button"
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

              border
              border-[#F6F1E8]/15

              text-[#F6F1E8]/80

              transition-colors
              duration-200

              hover:border-[#D66A4A]
              hover:bg-[#D66A4A]
              hover:text-[#FFFDF8]

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

                rounded-lg

                bg-[#F6F1E8]/5

                transition-colors
                duration-200

                group-hover:bg-[#FFFDF8]/20
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
                  text-[13px]
                  font-semibold
                "
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default FloatingNav;