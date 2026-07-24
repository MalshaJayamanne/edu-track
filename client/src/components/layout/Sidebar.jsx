import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { title: "Dashboard",    icon: "grid", path: "/dashboard" },
      { title: "Subjects",     icon: "book", path: "/subjects" },
    ],
  },
  {
    label: "Academic",
    items: [
      { title: "Assignments",  icon: "clipboard", path: "/assignments" },
      { title: "Timetable",    icon: "calendar",  path: "/timetable" },
      { title: "Notes",        icon: "edit",      path: "/notes" },
      { title: "GPA Calculator", icon: "bar-chart", path: "/gpa" },
      { title: "Analytics",   icon: "trending-up", path: "/analytics" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { title: "AI Study Plan", icon: "cpu",       path: "/ai-study-plan" },
      { title: "AI Chat",       icon: "message",   path: "/ai-chat" },
      { title: "Productivity",  icon: "zap",       path: "/productivity" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", icon: "settings", path: "/settings" },
    ],
  },
];

const ICONS = {
  "grid": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  "book": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  "clipboard": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  "calendar": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  "edit": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  "bar-chart": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  "trending-up": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  "cpu": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  "message": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  "zap": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  "settings": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  "logout": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside
      className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-60"}`}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* BRAND */}
      <div className={`shrink-0 border-b border-white/10 ${collapsed ? "px-3 py-4" : "px-5 py-4"}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            title={collapsed ? "Expand" : "Collapse"}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <span className="text-base">🎓</span>
          </button>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white leading-tight whitespace-nowrap tracking-tight">EduTrack AI</h1>
              <p className="text-[11px] text-indigo-300 whitespace-nowrap">Academic Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <p className="px-5 py-1.5 text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 mx-2 my-0.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    collapsed ? "px-3 justify-center" : "px-3.5"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/8"
                  }`
                }
                style={({ isActive }) => isActive ? {} : {}}
              >
                <span className="shrink-0">{ICONS[item.icon]}</span>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          onClick={logout}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 py-2.5 ${
            collapsed ? "px-3 justify-center" : "px-3.5"
          }`}
        >
          <span className="shrink-0">{ICONS["logout"]}</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
