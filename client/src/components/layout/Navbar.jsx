import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../ui/NotificationBell";

const PAGE_TITLES = {
  "/dashboard":    { title: "Dashboard",        sub: "Your academic overview" },
  "/subjects":     { title: "Subjects",          sub: "Manage your modules" },
  "/assignments":  { title: "Assignments",       sub: "Track deadlines and progress" },
  "/timetable":    { title: "Timetable",         sub: "Your weekly schedule" },
  "/notes":        { title: "Notes",             sub: "Your digital notebook" },
  "/analytics":    { title: "Analytics",         sub: "Learning insights" },
  "/gpa":          { title: "GPA Calculator",    sub: "Track your academic performance" },
  "/settings":     { title: "Settings",          sub: "App preferences" },
  "/productivity": { title: "Productivity",      sub: "Daily command center" },
  "/ai-study-plan":{ title: "AI Study Planner",  sub: "Smart study recommendations" },
  "/ai-chat":      { title: "AI Study Chat",     sub: "Chat with your academic assistant" },
};

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[pathname] || { title: "EduTrack AI", sub: "" };

  const [currentSem, setCurrentSem] = useState(() => {
    return localStorage.getItem("currentSemester") || "all";
  });

  // Show AI credits warning
  const creditsEmpty = (user?.aiCredits ?? 20) === 0;

  useEffect(() => {
    const handleSemChange = () => {
      setCurrentSem(localStorage.getItem("currentSemester") || "all");
    };
    window.addEventListener("semesterChange", handleSemChange);
    return () => window.removeEventListener("semesterChange", handleSemChange);
  }, []);

  const handleSetCurrentSem = (sem) => {
    localStorage.setItem("currentSemester", sem);
    window.dispatchEvent(new Event("semesterChange"));
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  return (
    <header className="bg-white border-b border-slate-100 shrink-0 z-10">
      {/* AI credits warning banner */}
      {creditsEmpty && (
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-2 flex items-center gap-2 text-xs font-semibold text-amber-700">
          <span>⚠️</span>
          <span>Your AI credits are depleted — AI features are currently disabled.</span>
          <button
            onClick={() => navigate("/settings")}
            className="ml-auto underline hover:text-amber-900 whitespace-nowrap"
          >
            Refill in Settings →
          </button>
        </div>
      )}

      <div className="h-[64px] flex justify-between items-center px-5">
        {/* Left: hamburger + page info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-all shrink-0"
            title="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect y="2"  width="18" height="2" rx="1" />
              <rect y="8"  width="18" height="2" rx="1" />
              <rect y="14" width="18" height="2" rx="1" />
            </svg>
          </button>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 leading-tight truncate">{page.title}</h2>
            {page.sub && <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">{page.sub}</p>}
          </div>
        </div>

        {/* Right: semester selector + notification bell + avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Semester selector — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">Semester:</span>
            <select
              value={currentSem}
              onChange={(e) => handleSetCurrentSem(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>Sem {s}</option>
              ))}
            </select>
          </div>

          {/* Notification bell */}
          <NotificationBell />

          {/* Avatar */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-200">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name || "Student"}</p>
              <p className="text-xs text-slate-400 truncate max-w-[120px]">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}