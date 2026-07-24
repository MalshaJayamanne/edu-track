import { useEffect, useRef, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import MarkdownMessage from "../components/chat/MarkdownMessage";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api/chat";
const CACHE_KEY = "aiChatHistory";

const STARTERS = [
  "What subjects should I focus on most?",
  "Give me a study schedule for this week.",
  "How can I improve my GPA?",
  "Which of my subjects is highest risk?",
];

export default function AIChat() {
  const { user, reloadUser } = useAuth();

  // ── Restore chat history from sessionStorage on mount ──
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [gpa, setGpa]         = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  const creditsFinished = user?.aiCredits === 0;

  // ── Persist chat to sessionStorage on every change ──
  useEffect(() => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(chat));
    } catch {
      // quota exceeded — silently ignore
    }
  }, [chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async (text) => {
    if (creditsFinished) return;
    const userMsg = (text || message).trim();
    if (!userMsg) return;

    setChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(API, { message: userMsg }, { withCredentials: true });
      setChat((prev) => [...prev, { role: "ai", text: res.data.reply }]);
      if (res.data.gpa !== undefined) setGpa(res.data.gpa);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to get a response. Please try again.";
      console.error("Chat request failed:", err.response?.data || err.message);
      setChat((prev) => [...prev, { role: "ai", text: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
      reloadUser();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setChat([]);
    sessionStorage.removeItem(CACHE_KEY);
  };

  return (
    <DashboardLayout>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">AI Study Assistant</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Powered by Gemini · Your personal academic advisor</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {gpa !== null && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl px-3 py-1.5 text-sm">
              <span className="text-indigo-500">📊</span>
              <span className="text-slate-600 dark:text-slate-300">GPA: <span className="font-bold text-indigo-700 dark:text-indigo-400">{gpa}</span></span>
            </div>
          )}
          {chat.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 px-3 py-1.5 rounded-xl transition-all"
              title="Clear chat history"
            >
              🗑 Clear
            </button>
          )}
        </div>
      </div>

      {/* ===== CHAT AREA ===== */}
      <div className="flex flex-col" style={{ height: "calc(100dvh - 220px)", minHeight: "360px" }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100/80 dark:border-slate-800 shadow-sm p-3 sm:p-5 space-y-4 mb-3 sm:mb-4">

          {/* Empty state */}
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-2">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-indigo-200 dark:shadow-none"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                🤖
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base sm:text-lg">Hi, I'm your AI Study Assistant!</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Ask me anything about your academics, study strategies, or GPA.</p>
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full mt-2">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    disabled={creditsFinished}
                    className="text-left text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl px-3 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chat.map((c, i) => (
            <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
              {c.role === "ai" && (
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm shrink-0 mr-2 mt-0.5 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  🤖
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm ${
                  c.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-md shadow-indigo-200 dark:shadow-none"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm"
                }`}
              >
                {c.role === "ai" ? (
                  <MarkdownMessage text={c.text} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{c.text}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                🤖
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2 sm:gap-3 shrink-0">
          {creditsFinished && (
            <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>Your AI credits have finished. You cannot chat until you refill them.</span>
              </div>
              <a
                href="/settings"
                className="shrink-0 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all"
              >
                Refill in Settings
              </a>
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <div className={`flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950/50 transition-all shadow-sm ${creditsFinished ? "opacity-60 cursor-not-allowed" : ""}`}>
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={creditsFinished ? "Credits exhausted. Please refill in Settings." : "Ask your AI study assistant..."}
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none min-w-0"
                disabled={loading || creditsFinished}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || creditsFinished || !message.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-md shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 active:scale-95 shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}