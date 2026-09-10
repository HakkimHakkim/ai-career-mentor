import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Send,
  Bot,
  User,
  Trash2,
  MessageSquare,
  Sparkles,
  Code2,
  BriefcaseBusiness,
  Lightbulb,
  Plus,
  Menu,
  X,
  Clock3,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const STORAGE_KEY = "ai_tutor_chat";
const RECENT_CHATS_KEY = "ai_tutor_recent_chats";

const defaultMessage = {
  role: "assistant",
  content:
    "Hi! I'm your AI Career Tutor. Ask me anything about your learning path. 🚀",
};

const quickPrompts = [
  {
    title: "Career Guidance",
    subtitle: "Ask about your career path",
    icon: BriefcaseBusiness,
    prompt: "What should I learn to become job ready?",
  },
  {
    title: "Coding Help",
    subtitle: "Get help with programming",
    icon: Code2,
    prompt: "Help me improve my coding skills as a fresher.",
  },
  {
    title: "Interview Prep",
    subtitle: "Practice interview questions",
    icon: MessageSquare,
    prompt: "Give me some interview questions for a fresher.",
  },
  {
    title: "Learning Advice",
    subtitle: "Build a better study plan",
    icon: Lightbulb,
    prompt: "Create a practical learning plan for me.",
  },
];

const createChat = () => ({
  id: Date.now().toString(),
  title: "New Career Chat",
  messages: [defaultMessage],
  updatedAt: new Date().toISOString(),
});

const AiTutor = () => {
  // =========================================================
  // CHAT HISTORY
  // =========================================================

  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem(
        RECENT_CHATS_KEY
      );

      if (savedChats) {
        const parsed = JSON.parse(savedChats);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          return parsed;
        }
      }

      const oldMessages =
        localStorage.getItem(STORAGE_KEY);

      if (oldMessages) {
        const parsedOldMessages =
          JSON.parse(oldMessages);

        if (
          Array.isArray(parsedOldMessages) &&
          parsedOldMessages.length > 0
        ) {
          return [
            {
              id: "legacy-chat",
              title: "Career Discussion",
              messages: parsedOldMessages,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      }
    } catch (error) {
      console.error(
        "Chat restore error:",
        error
      );
    }

    return [createChat()];
  });

  // =========================================================
  // ACTIVE CHAT
  // =========================================================

  const [activeChatId, setActiveChatId] = useState(
    () => {
      try {
        const savedChats =
          localStorage.getItem(
            RECENT_CHATS_KEY
          );

        if (savedChats) {
          const parsed =
            JSON.parse(savedChats);

          if (
            Array.isArray(parsed) &&
            parsed.length > 0
          ) {
            return parsed[0].id;
          }
        }
      } catch (error) {
        console.error(
          "Active chat restore error:",
          error
        );
      }

      return null;
    }
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // =========================================================
  // ACTIVE CHAT SAFETY
  // =========================================================

  useEffect(() => {
    if (!chats.length) {
      const newChat = createChat();
      setChats([newChat]);
      setActiveChatId(newChat.id);
      return;
    }

    const activeExists = chats.some(
      (chat) => chat.id === activeChatId
    );

    if (!activeExists) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) || chats[0];

  const messages =
    activeChat?.messages || [];

  // =========================================================
  // SAVE CHATS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        RECENT_CHATS_KEY,
        JSON.stringify(chats)
      );

      if (activeChat) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            activeChat.messages
          )
        );
      }
    } catch (error) {
      console.error(
        "Chat save error:",
        error
      );
    }
  }, [chats, activeChat]);

  // =========================================================
  // SCROLL
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  // =========================================================
  // NEW CHAT
  // =========================================================

  const handleNewChat = () => {
    const newChat = createChat();

    setChats((prev) => [
      newChat,
      ...prev,
    ]);

    setActiveChatId(newChat.id);
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  // =========================================================
  // OPEN CHAT
  // =========================================================

  const handleOpenChat = (chatId) => {
    setActiveChatId(chatId);
    setInput("");

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // =========================================================
  // DELETE CHAT
  // =========================================================

  const handleDeleteChat = (chatId) => {
    setChats((prev) => {
      const filtered = prev.filter(
        (chat) => chat.id !== chatId
      );

      if (filtered.length === 0) {
        const newChat = createChat();

        setTimeout(() => {
          setActiveChatId(newChat.id);
        }, 0);

        return [newChat];
      }

      if (chatId === activeChatId) {
        setTimeout(() => {
          setActiveChatId(
            filtered[0].id
          );
        }, 0);
      }

      return filtered;
    });
  };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const handleClearChat = () => {
    if (!activeChat) return;

    const confirmed = window.confirm(
      "Clear this conversation?"
    );

    if (!confirmed) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: "New Career Chat",
              messages: [
                defaultMessage,
              ],
              updatedAt:
                new Date().toISOString(),
            }
          : chat
      )
    );

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // =========================================================
  // UPDATE ACTIVE CHAT
  // =========================================================

  const updateActiveChat = (updater) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (
          chat.id !== activeChatId
        ) {
          return chat;
        }

        const updates =
          typeof updater === "function"
            ? updater(chat)
            : updater;

        return {
          ...chat,
          ...updates,
          updatedAt:
            new Date().toISOString(),
        };
      })
    );
  };

  // =========================================================
  // TYPE RESPONSE
  // =========================================================

  const typeOutResponse = (fullText) => {
    const words =
      fullText.split(" ");

    updateActiveChat((chat) => ({
      messages: [
        ...chat.messages,
        {
          role: "assistant",
          content: "",
        },
      ],
    }));

    let i = 0;

    const interval = setInterval(() => {
      i++;

      updateActiveChat((chat) => {
        const updatedMessages = [
          ...chat.messages,
        ];

        updatedMessages[
          updatedMessages.length - 1
        ] = {
          role: "assistant",
          content: words
            .slice(0, i)
            .join(" "),
        };

        return {
          messages: updatedMessages,
        };
      });

      if (i >= words.length) {
        clearInterval(interval);
      }
    }, 25);
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSend = async (
    messageOverride = null
  ) => {
    const userMessage = (
      messageOverride !== null
        ? messageOverride
        : input
    ).trim();

    if (!userMessage || loading)
      return;

    const currentChat = activeChat;

    if (!currentChat) return;

    const userMsg = {
      role: "user",
      content: userMessage,
    };

    const currentUserMessages =
      currentChat.messages.filter(
        (msg) => msg.role === "user"
      );

    const shouldUpdateTitle =
      currentUserMessages.length === 0;

    updateActiveChat((chat) => ({
      title: shouldUpdateTitle
        ? userMessage.length > 32
          ? `${userMessage.substring(
              0,
              32
            )}...`
          : userMessage
        : chat.title,

      messages: [
        ...chat.messages,
        userMsg,
      ],
    }));

    setInput("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem(
          "ra_token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/ai/tutor`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: userMessage,
            language: "en",
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.detail ||
            "AI Tutor request failed"
        );
      }

      typeOutResponse(
        data.data.response
      );
    } catch (error) {
      console.error(
        "AI Tutor error:",
        error
      );

      updateActiveChat((chat) => ({
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            content:
              "⚠️ Something went wrong. Please try again.",
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ENTER
  // =========================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  // =========================================================
  // TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const chatDate = new Date(date);

    const diff =
      now - chatDate;

    if (diff < 60000) {
      return "Now";
    }

    if (diff < 3600000) {
      return `${Math.floor(
        diff / 60000
      )}m`;
    }

    if (diff < 86400000) {
      return `${Math.floor(
        diff / 3600000
      )}h`;
    }

    return chatDate.toLocaleDateString(
      [],
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    /*
      IMPORTANT:
      DO NOT USE fixed inset-0 HERE.

      This component lives INSIDE your existing
      application navigation/content layout.
    */

    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-[#070b20] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute right-[-150px] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* =====================================================
          CONTENT LAYOUT
      ====================================================== */}

      <div className="relative flex h-full min-h-0 w-full overflow-hidden">
        {/* ===================================================
            RECENT CHAT SIDEBAR
        ==================================================== */}

        <aside
          className={`
            absolute inset-y-0 left-0 z-50
            flex w-[310px] shrink-0 flex-col
            border-r border-white/[0.07]
            bg-[#0b102b]/98
            backdrop-blur-2xl

            transition-transform
            duration-300
            ease-out

            lg:relative
            lg:z-20
            lg:translate-x-0

            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* SIDEBAR HEADER */}

          <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold">
                  AI Tutor
                </h2>

                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                  Career Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2 text-white/40 hover:bg-white/[0.08] hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* NEW CHAT */}

          <div className="shrink-0 p-4">
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold shadow-[0_10px_30px_rgba(99,102,241,0.18)] transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-blue-500"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* RECENT TITLE */}

          <div className="shrink-0 px-5 pb-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-violet-300/60" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Recent Chats
              </span>
            </div>
          </div>

          {/* CHAT LIST */}

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
            <div className="space-y-2">
              {chats.map((chat) => {
                const isActive =
                  chat.id ===
                  activeChatId;

                const messageCount =
                  chat.messages.filter(
                    (m) =>
                      m.role === "user"
                  ).length;

                return (
                  <div
                    key={chat.id}
                    className={`
                      group relative rounded-2xl border
                      transition-all duration-200

                      ${
                        isActive
                          ? "border-violet-400/20 bg-violet-500/[0.10]"
                          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
                      }
                    `}
                  >
                    <button
                      onClick={() =>
                        handleOpenChat(
                          chat.id
                        )
                      }
                      className="w-full px-4 py-3.5 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            mt-0.5 flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-xl

                            ${
                              isActive
                                ? "bg-violet-500/15 text-violet-300"
                                : "bg-white/[0.04] text-white/30"
                            }
                          `}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1 pr-5">
                          <p
                            className={`
                              truncate text-sm font-medium

                              ${
                                isActive
                                  ? "text-white"
                                  : "text-white/65"
                              }
                            `}
                          >
                            {chat.title}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-white/25">
                              {messageCount}{" "}
                              messages
                            </span>

                            <span className="text-white/15">
                              •
                            </span>

                            <span className="text-[10px] text-white/25">
                              {formatTime(
                                chat.updatedAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteChat(
                          chat.id
                        )
                      }
                      aria-label="Delete chat"
                      className="absolute right-3 top-3 hidden rounded-lg p-1.5 text-white/20 transition hover:bg-red-500/10 hover:text-red-400 group-hover:block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ===================================================
            MOBILE OVERLAY
        ==================================================== */}

        {sidebarOpen && (
          <div
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ===================================================
            CHAT WORKSPACE
        ==================================================== */}

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* =================================================
              HEADER
          ================================================== */}

          <header className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#080c24]/90 px-4 backdrop-blur-2xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {/* MOBILE MENU */}

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-white/50 hover:bg-white/[0.08] hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* ICON */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.08]">
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                    AI Career Tutor
                  </h1>

                  <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    Online
                  </span>
                </div>

                <p className="truncate text-[11px] text-white/30">
                  Your personal AI learning companion
                </p>
              </div>
            </div>

            {/* CLEAR */}

            <button
              onClick={handleClearChat}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-medium text-white/40 transition hover:border-red-400/20 hover:bg-red-500/[0.06] hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />

              <span className="hidden sm:block">
                Clear Chat
              </span>
            </button>
          </header>

          {/* =================================================
              CHAT MESSAGES
          ================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-40 sm:px-6 lg:px-8">
              {/* WELCOME */}

              {messages.length === 1 &&
                messages[0].role ===
                  "assistant" &&
                messages[0].content ===
                  defaultMessage.content && (
                  <div className="mb-10">
                    <div className="mx-auto max-w-3xl py-8 text-center sm:py-12">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-blue-500/10 shadow-[0_0_60px_rgba(139,92,246,0.14)]">
                        <Bot className="h-9 w-9 text-violet-300" />
                      </div>

                      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        How can I help your career?
                      </h2>

                      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/35 sm:text-base">
                        Ask questions,
                        understand concepts,
                        prepare for
                        interviews, and
                        build the skills
                        you need for your
                        dream job.
                      </p>
                    </div>

                    {/* QUICK START */}

                    <div className="mx-auto max-w-4xl">
                      <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet-300/60" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                          Quick Start
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {quickPrompts.map(
                          (item) => {
                            const Icon =
                              item.icon;

                            return (
                              <button
                                key={
                                  item.title
                                }
                                onClick={() =>
                                  handleSend(
                                    item.prompt
                                  )
                                }
                                disabled={
                                  loading
                                }
                                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/15 hover:bg-violet-500/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-violet-300/70 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white/75 group-hover:text-white">
                                    {
                                      item.title
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-white/25">
                                    {
                                      item.subtitle
                                    }
                                  </p>
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* =================================================
                  MESSAGES
              ================================================== */}

              <div className="space-y-7">
                {messages.map(
                  (msg, idx) => {
                    if (
                      idx === 0 &&
                      msg.role ===
                        "assistant" &&
                      msg.content ===
                        defaultMessage.content
                    ) {
                      return null;
                    }

                    const isUser =
                      msg.role === "user";

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 sm:gap-4 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.10]">
                            <Bot className="h-4 w-4 text-violet-300" />
                          </div>
                        )}

                        <div
                          className={`
                            max-w-[88%]
                            sm:max-w-[75%]

                            ${
                              isUser
                                ? "rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-white"
                                : "rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4 text-white/80 backdrop-blur-xl"
                            }
                          `}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {
                                msg.content
                              }
                            </p>
                          ) : (
                            <div className="prose prose-sm prose-invert max-w-none text-sm leading-7">
                              <ReactMarkdown
                                remarkPlugins={[
                                  remarkGfm,
                                ]}
                              >
                                {
                                  msg.content
                                }
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.07]">
                            <User className="h-4 w-4 text-white/60" />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {/* LOADING */}

                {loading && (
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.10]">
                      <Bot className="h-4 w-4 text-violet-300" />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.15s]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.3s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div
                  ref={bottomRef}
                  className="h-1"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              NORMAL BOTTOM CHAT BOX
          ================================================== */}

          <div className="shrink-0 border-t border-white/[0.05] bg-[#070b20]/95 px-4 pb-4 pt-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="relative flex items-end gap-2 rounded-2xl border border-white/[0.10] bg-[#111633]/95 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all focus-within:border-violet-400/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) =>
                    setInput(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Ask your AI tutor anything..."
                  disabled={loading}
                  rows={1}
                  className="max-h-32 min-h-[46px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed"
                />

                <button
                  onClick={() =>
                    handleSend()
                  }
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[0_8px_25px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-0.5 hover:from-violet-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-center text-[9px] text-white/15">
                AI Tutor can make mistakes.
                Verify important information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiTutor;