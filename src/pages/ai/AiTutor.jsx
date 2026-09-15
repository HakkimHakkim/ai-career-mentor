import React, { useEffect, useRef, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

import {

  Send,

  Bot,

  User,

  Plus,

  MessageSquare,

  Trash2,

  X,

  Menu,

  Sparkles,

  Briefcase,

  Code2,

  Lightbulb,

  MessageCircle,

} from 'lucide-react';



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-career-mentor-m2id.onrender.com';



const CHAT_STORAGE_KEY = 'ai_tutor_chats';

const ACTIVE_CHAT_KEY = 'ai_tutor_active_chat';



/* =========================================================

   DEFAULT CHAT

========================================================= */



const createNewChat = () => ({

  id: Date.now().toString(),

  title: 'New Career Chat',

  messages: [

    {

      role: 'assistant',

      content:

        "Hi! I'm your AI Career Tutor. Ask me anything about your learning path. 🚀",

    },

  ],

  createdAt: Date.now(),

  updatedAt: Date.now(),

});



/* =========================================================

   QUICK START OPTIONS

========================================================= */



const quickStartOptions = [

  {

    title: 'Career Guidance',

    subtitle: 'Ask about your career path',

    icon: Briefcase,

    prompt:

      'Help me understand the best career path for me and what skills I should learn.',

  },

  {

    title: 'Coding Help',

    subtitle: 'Get help with programming',

    icon: Code2,

    prompt:

      'I am a beginner programmer. Help me understand what I should learn and practice.',

  },

  {

    title: 'Interview Prep',

    subtitle: 'Practice interview questions',

    icon: MessageCircle,

    prompt:

      'Help me prepare for a technical interview as a fresher.',

  },

  {

    title: 'Learning Advice',

    subtitle: 'Build a better study plan',

    icon: Lightbulb,

    prompt:

      'Create a practical learning plan that will help me become job ready.',

  },

];



/* =========================================================

   COMPONENT

========================================================= */



const AiTutor = () => {

  const [chats, setChats] = useState(() => {

    try {

      const saved = localStorage.getItem(CHAT_STORAGE_KEY);



      if (saved) {

        const parsed = JSON.parse(saved);



        if (Array.isArray(parsed) && parsed.length > 0) {

          return parsed;

        }

      }

    } catch (error) {

      console.error('Failed to load chats:', error);

    }



    return [createNewChat()];

  });



  const [activeChatId, setActiveChatId] = useState(() => {

    return (

      localStorage.getItem(ACTIVE_CHAT_KEY) || null

    );

  });



  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);



  // Mobile recent chat panel

  const [showChatList, setShowChatList] = useState(false);



  const bottomRef = useRef(null);

  const textareaRef = useRef(null);



  /* =========================================================

     ENSURE ACTIVE CHAT

  ========================================================= */



  useEffect(() => {

    if (!activeChatId || !chats.some((chat) => chat.id === activeChatId)) {

      setActiveChatId(chats[0]?.id);

    }

  }, [chats, activeChatId]);



  /* =========================================================

     SAVE CHATS

  ========================================================= */



  useEffect(() => {

    localStorage.setItem(

      CHAT_STORAGE_KEY,

      JSON.stringify(chats)

    );

  }, [chats]);



  useEffect(() => {

    if (activeChatId) {

      localStorage.setItem(

        ACTIVE_CHAT_KEY,

        activeChatId

      );

    }

  }, [activeChatId]);



  /* =========================================================

     ACTIVE CHAT

  ========================================================= */



  const activeChat =

    chats.find((chat) => chat.id === activeChatId) ||

    chats[0];



  const messages = activeChat?.messages || [];



  /* =========================================================

     AUTO SCROLL

  ========================================================= */



  useEffect(() => {

    bottomRef.current?.scrollIntoView({

      behavior: 'smooth',

    });

  }, [messages, loading]);



  /* =========================================================

     CREATE NEW CHAT

  ========================================================= */



  const handleNewChat = () => {

  if (loading) return;



  const newChat = createNewChat();



  // Create and immediately switch to new chat

  setChats((prev) => [newChat, ...prev]);

  setActiveChatId(newChat.id);

  setInput('');



  // IMPORTANT: close mobile Recent Chats automatically

  setShowChatList(false);



  setTimeout(() => {

    textareaRef.current?.focus();

  }, 100);

};

  /* =========================================================

     OPEN OLD CHAT

  ========================================================= */



  const handleSelectChat = (chatId) => {

  if (loading) return;



  // Immediately switch to selected chat

  setActiveChatId(chatId);

  setInput('');



  // IMPORTANT: close mobile Recent Chats automatically

  setShowChatList(false);



  setTimeout(() => {

    textareaRef.current?.focus();

  }, 100);

};



  /* =========================================================

     DELETE CURRENT CHAT

  ========================================================= */



  const handleClearChat = () => {

    if (!activeChat) return;



    const confirmed = window.confirm(

      'Clear this conversation?'

    );



    if (!confirmed) return;



    const freshChat = {

      ...createNewChat(),

      id: activeChat.id,

    };



    setChats((prev) =>

      prev.map((chat) =>

        chat.id === activeChat.id

          ? freshChat

          : chat

      )

    );



    setInput('');

  };



  /* =========================================================

     UPDATE MESSAGES

  ========================================================= */



  const updateChatMessages = (chatId, newMessages) => {

    setChats((prev) =>

      prev.map((chat) =>

        chat.id === chatId

          ? {

              ...chat,

              messages: newMessages,

              updatedAt: Date.now(),

            }

          : chat

      )

    );

  };



  /* =========================================================

     UPDATE CHAT TITLE

  ========================================================= */



  const updateChatTitle = (chatId, firstMessage) => {

    const cleanTitle = firstMessage

      .replace(/\s+/g, ' ')

      .trim();



    const title =

      cleanTitle.length > 32

        ? `${cleanTitle.substring(0, 32)}...`

        : cleanTitle;



    setChats((prev) =>

      prev.map((chat) =>

        chat.id === chatId

          ? {

              ...chat,

              title:

                title || 'New Career Chat',

              updatedAt: Date.now(),

            }

          : chat

      )

    );

  };



  /* =========================================================

     TYPE AI RESPONSE

  ========================================================= */



  const typeOutResponse = (chatId, fullText) => {

    const words = fullText.split(' ');

    let index = 0;



    setChats((prev) =>

      prev.map((chat) =>

        chat.id === chatId

          ? {

              ...chat,

              messages: [

                ...chat.messages,

                {

                  role: 'assistant',

                  content: '',

                },

              ],

              updatedAt: Date.now(),

            }

          : chat

      )

    );



    const interval = setInterval(() => {

      index++;



      setChats((prev) =>

        prev.map((chat) => {

          if (chat.id !== chatId) {

            return chat;

          }



          const updatedMessages = [

            ...chat.messages,

          ];



          updatedMessages[

            updatedMessages.length - 1

          ] = {

            role: 'assistant',

            content: words

              .slice(0, index)

              .join(' '),

          };



          return {

            ...chat,

            messages: updatedMessages,

            updatedAt: Date.now(),

          };

        })

      );



      if (index >= words.length) {

        clearInterval(interval);

      }

    }, 25);

  };



  /* =========================================================

     SEND MESSAGE

  ========================================================= */



  const handleSend = async (customMessage = null) => {

    const userMessage = (

      customMessage ?? input

    ).trim();



    if (!userMessage || loading || !activeChat) {

      return;

    }



    const chatId = activeChat.id;



    const updatedMessages = [

      ...activeChat.messages,

      {

        role: 'user',

        content: userMessage,

      },

    ];



    updateChatMessages(

      chatId,

      updatedMessages

    );



    updateChatTitle(

      chatId,

      userMessage

    );



    setInput('');

    setLoading(true);



    try {

      const token =

        localStorage.getItem('ra_token');



      if (!token) {

        throw new Error(

          'Authentication token not found. Please login again.'

        );

      }



      const response = await fetch(

        `${API_BASE_URL}/api/v1/ai/tutor`,

        {

          method: 'POST',

          headers: {

            'Content-Type':

              'application/json',

            Accept:

              'application/json',

            Authorization:

              `Bearer ${token}`,

          },

          body: JSON.stringify({

            message: userMessage,

            language: 'en',

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

            'AI Tutor request failed'

        );

      }



      typeOutResponse(

        chatId,

        data.data.response

      );

    } catch (error) {

      console.error(

        'AI Tutor error:',

        error

      );



      updateChatMessages(

        chatId,

        [

          ...updatedMessages,

          {

            role: 'assistant',

            content:

              '⚠️ Something went wrong. Please try again.',

          },

        ]

      );

    } finally {

      setLoading(false);

    }

  };



  /* =========================================================

     ENTER KEY

  ========================================================= */



  const handleKeyDown = (e) => {

    if (

      e.key === 'Enter' &&

      !e.shiftKey

    ) {

      e.preventDefault();

      handleSend();

    }

  };



  /* =========================================================

     QUICK START

  ========================================================= */



  const handleQuickStart = (prompt) => {

    handleSend(prompt);

  };



  /* =========================================================

     FORMAT CHAT DATE

  ========================================================= */



  const formatDate = (timestamp) => {

    const date =

      new Date(timestamp);



    const today =

      new Date();



    if (

      date.toDateString() ===

      today.toDateString()

    ) {

      return 'Now';

    }



    return date.toLocaleDateString(

      'en-US',

      {

        month: 'short',

        day: '2-digit',

      }

    );

  };



  /* =========================================================

     UI

  ========================================================= */



  return (

    <div className="relative w-full h-[100dvh] min-h-0 overflow-hidden bg-[#070b22] text-white">



      {/* =====================================================

          MOBILE OVERLAY

      ===================================================== */}



      {showChatList && (

        <div

          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"

          onClick={() =>

            setShowChatList(false)

          }

        />

      )}



      {/* =====================================================

          MAIN LAYOUT

      ===================================================== */}



      <div className="flex h-full min-h-0">



        {/* ===================================================

            RECENT CHATS SIDEBAR

        =================================================== */}



        <aside

          className={`

            fixed lg:relative

            z-50 lg:z-auto

            top-0 left-0

            h-full

            w-[300px]

            shrink-0

            bg-[#0c112f]

            border-r border-white/10

            flex flex-col

            transition-transform duration-300

            ${

              showChatList

                ? 'translate-x-0'

                : '-translate-x-full lg:translate-x-0'

            }

          `}

        >



          {/* SIDEBAR HEADER */}



          <div className="h-[76px] shrink-0 px-5 border-b border-white/10 flex items-center justify-between">



            <div className="min-w-0 flex items-center gap-2 sm:gap-3">



              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">



                <Sparkles className="w-5 h-5 text-white" />



              </div>



              <div>



                <h2 className="font-bold text-white">

                  AI Tutor

                </h2>



                <p className="text-[11px] text-white/40">

                  Career Intelligence

                </p>



              </div>



            </div>



            {/* MOBILE CLOSE */}



            <button

              onClick={() =>

                setShowChatList(false)

              }

              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"

            >

              <X className="w-4 h-4" />

            </button>



          </div>



          {/* NEW CHAT */}



          <div className="p-4">



            <button

              onClick={handleNewChat}

              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-900/30 transition-all"

            >



              <Plus className="w-5 h-5" />



              New Chat



            </button>



          </div>



          {/* RECENT CHATS */}



          <div className="px-4 pb-2">



            <div className="flex items-center gap-2 px-2 mb-3">



              <MessageSquare className="w-4 h-4 text-white/40" />



              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">

                Recent Chats

              </span>



            </div>



          </div>



          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">



            <div className="space-y-2">



              {chats

                .sort(

                  (a, b) =>

                    b.updatedAt -

                    a.updatedAt

                )

                .map((chat) => {



                  const isActive =

                    chat.id ===

                    activeChatId;



                  const messageCount =

                    chat.messages.filter(

                      (message) =>

                        message.role ===

                        'user'

                    ).length;



                  return (

                    <button

                      key={chat.id}

                      onClick={() =>

                        handleSelectChat(

                          chat.id

                        )

                      }

                      className={`

                        w-full

                        text-left

                        rounded-xl

                        p-3

                        border

                        transition-all

                        ${

                          isActive

                            ? 'bg-violet-500/10 border-violet-500/30'

                            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'

                        }

                      `}

                    >



                      <div className="flex gap-3">



                        <div

                          className={`

                            w-9 h-9

                            shrink-0

                            rounded-lg

                            flex

                            items-center

                            justify-center

                            ${

                              isActive

                                ? 'bg-violet-500/20 text-violet-300'

                                : 'bg-white/5 text-white/40'

                            }

                          `}

                        >

                          <MessageSquare className="w-4 h-4" />

                        </div>



                        <div className="min-w-0 flex-1">



                          <p className="text-sm font-medium text-white truncate">

                            {chat.title}

                          </p>



                          <p className="mt-1 text-[11px] text-white/35">

                            {messageCount}{' '}

                            {messageCount === 1

                              ? 'message'

                              : 'messages'}

                            {' • '}

                            {formatDate(

                              chat.updatedAt

                            )}

                          </p>



                        </div>



                      </div>



                    </button>

                  );

                })}



            </div>



          </div>



          {/* SIDEBAR FOOTER */}



          <div className="shrink-0 p-4 border-t border-white/10">



            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">



              <div className="flex items-center gap-2">



                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />



                <span className="text-xs text-white/60">

                  AI Tutor Ready

                </span>



              </div>



              <p className="text-[11px] text-white/30 mt-2">

                Your conversations are

                saved automatically.

              </p>



            </div>



          </div>



        </aside>



        {/* ===================================================

            CHAT AREA

        =================================================== */}



        <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-[#080c27]">



          {/* =================================================

              CHAT HEADER

          ================================================= */}



          <header className="h-[68px] sm:h-[76px] shrink-0 border-b border-white/10 px-2.5 sm:px-4 md:px-7 flex items-center justify-between bg-[#090d29]/90 backdrop-blur-xl">



            <div className="flex items-center gap-3">







              <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-400/20 flex items-center justify-center">



                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-violet-300" />



              </div>



              <div>



                <div className="flex items-center gap-2">



                  <h1 className="text-[15px] sm:text-lg md:text-xl font-bold text-white truncate">

                    <span className="sm:hidden">AI Tutor</span>
                    <span className="hidden sm:inline">AI Career Tutor</span>

                  </h1>



                  <span className="shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] sm:text-[10px] font-bold">

                    ONLINE

                  </span>



                </div>



                <p className="hidden sm:block text-xs text-white/35">

                  Your personal AI learning companion

                </p>



              </div>



            </div>



            {/* MOBILE CHAT CONTROLS */}

            <div className="lg:hidden flex items-center gap-1.5 shrink-0">

              <button
                type="button"
                onClick={handleNewChat}
                disabled={loading}
                aria-label="New Chat"
                className="h-9 px-2.5 rounded-lg bg-violet-500/15 border border-violet-400/20 text-violet-200 flex items-center gap-1.5 text-[11px] font-semibold hover:bg-violet-500/25 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={() => setShowChatList(true)}
                aria-label="Recent Chats"
                className="h-9 px-2.5 rounded-lg bg-white/5 border border-white/10 text-white/75 flex items-center gap-1.5 text-[11px] font-semibold hover:bg-white/10 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chats</span>
              </button>

            </div>

            {/* CLEAR CHAT */}



            <button

              onClick={handleClearChat}

              disabled={loading}

              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 md:px-4 shrink-0 rounded-xl bg-white/[0.03] border border-white/10 text-white/45 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40"

            >



              <Trash2 className="w-4 h-4" />



              <span className="hidden sm:block text-sm">

                Clear Chat

              </span>



            </button>



          </header>



          {/* =================================================

              MESSAGES AREA

          ================================================= */}



          <div className="flex-1 min-h-0 overflow-y-auto">



            <div className="max-w-5xl mx-auto w-full px-3.5 sm:px-4 md:px-8 py-5 sm:py-6 md:py-8">



              {/* EMPTY / WELCOME */}



              {messages.length === 1 &&

                messages[0].role ===

                  'assistant' &&

                messages[0].content.startsWith(

                  "Hi! I'm your AI Career Tutor"

                ) ? (



                <div className="min-h-[calc(100dvh-180px)] md:min-h-[calc(100vh-220px)] flex flex-col justify-center">



                  <div className="text-center max-w-3xl mx-auto">



                    <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/20 flex items-center justify-center">



                      <Sparkles className="w-8 h-8 text-violet-300" />



                    </div>



                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">



                      How can I help your

                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">

                        {' '}career?

                      </span>



                    </h2>



                    <p className="text-sm md:text-base text-white/40 leading-7 max-w-2xl mx-auto">

                      Ask questions, understand

                      concepts, prepare for

                      interviews, and build the

                      skills you need for your

                      dream job.

                    </p>



                  </div>



                  {/* QUICK START */}



                  <div className="mt-10">



                    <div className="flex items-center gap-2 mb-4">



                      <Sparkles className="w-4 h-4 text-violet-400" />



                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">

                        Quick Start

                      </span>



                    </div>



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">



                      {quickStartOptions.map(

                        (item) => {



                          const Icon =

                            item.icon;



                          return (

                            <button

                              key={

                                item.title

                              }

                              onClick={() =>

                                handleQuickStart(

                                  item.prompt

                                )

                              }

                              disabled={

                                loading

                              }

                              className="group text-left p-4 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-violet-400/30 hover:bg-violet-500/[0.06] transition-all disabled:opacity-50"

                            >



                              <div className="flex items-center gap-4">



                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-400/20 transition-all">



                                  <Icon className="w-5 h-5 text-white/50 group-hover:text-violet-300" />



                                </div>



                                <div>



                                  <h3 className="font-semibold text-white/80">

                                    {item.title}

                                  </h3>



                                  <p className="text-xs text-white/30 mt-1">

                                    {

                                      item.subtitle

                                    }

                                  </p>



                                </div>



                              </div>



                            </button>

                          );

                        }

                      )}



                    </div>



                  </div>



                </div>



              ) : (



                /* =================================================

                   CHAT MESSAGES

                ================================================= */



                <div className="space-y-6">



                  {messages.map(

                    (msg, index) => {



                      const isUser =

                        msg.role ===

                        'user';



                      return (

                        <div

                          key={index}

                          className={`flex gap-3 md:gap-4 ${

                            isUser

                              ? 'justify-end'

                              : 'justify-start'

                          }`}

                        >



                          {/* AI ICON */}



                          {!isUser && (

                            <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">



                              <Bot className="w-5 h-5 text-white" />



                            </div>

                          )}



                          {/* MESSAGE */}



                          <div

                            className={`

                              max-w-[85%]

                              md:max-w-[75%]

                              rounded-2xl

                              px-4

                              md:px-5

                              py-3

                              md:py-4

                              ${

                                isUser

                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md'

                                  : 'bg-white/[0.045] border border-white/10 text-white/85 rounded-bl-md'

                              }

                            `}

                          >



                            {isUser ? (



                              <p className="text-sm md:text-[15px] leading-7 whitespace-pre-wrap">

                                {

                                  msg.content

                                }

                              </p>



                            ) : (



                              <div className="prose prose-sm prose-invert max-w-none prose-p:leading-7 prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-code:text-violet-300">



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



                          {/* USER ICON */}



                          {isUser && (

                            <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">



                              <User className="w-5 h-5 text-white/60" />



                            </div>

                          )}



                        </div>

                      );

                    }

                  )}



                  {/* LOADING */}



                  {loading && (

                    <div className="flex gap-3 md:gap-4">



                      <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">



                        <Bot className="w-5 h-5 text-white" />



                      </div>



                      <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white/[0.045] border border-white/10">



                        <div className="flex gap-1.5">



                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />



                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />



                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />



                        </div>



                      </div>



                    </div>

                  )}



                  <div ref={bottomRef} />



                </div>



              )}



            </div>



          </div>



          {/* =================================================

              FIXED BOTTOM INPUT AREA

          ================================================= */}



          <div className="shrink-0 border-t border-white/10 bg-[#080c27]/95 backdrop-blur-xl">



            <div className="max-w-5xl mx-auto w-full px-3.5 sm:px-4 md:px-8 pt-3 sm:pt-4 pb-3.5 sm:pb-4 md:pb-5">



              <div className="relative flex items-end gap-2 rounded-2xl bg-white/[0.045] border border-white/10 focus-within:border-violet-400/30 focus-within:bg-white/[0.06] transition-all p-2">



                <textarea

                  ref={textareaRef}

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

                  className="flex-1 resize-none bg-transparent px-3 py-3 text-sm md:text-[15px] text-white placeholder-white/30 focus:outline-none min-h-[46px] max-h-32 overflow-y-auto"

                />



                <button

                  onClick={() =>

                    handleSend()

                  }

                  disabled={

                    loading ||

                    !input.trim()

                  }

                  className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"

                >



                  <Send className="w-5 h-5 text-white" />



                </button>



              </div>



              <p className="text-[10px] text-white/20 text-center mt-2">

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