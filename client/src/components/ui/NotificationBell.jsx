import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_ASSIGNMENTS = "http://localhost:5000/api/assignments";

function getDueLabel(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - now) / 86400000);
  if (diff < 0) return { label: "Overdue", color: "text-rose-600", bg: "bg-rose-50", urgent: true };
  if (diff === 0) return { label: "Due Today!", color: "text-amber-600", bg: "bg-amber-50", urgent: true };
  if (diff === 1) return { label: "Due Tomorrow", color: "text-orange-500", bg: "bg-orange-50", urgent: true };
  if (diff <= 3) return { label: `${diff}d left`, color: "text-indigo-600", bg: "bg-indigo-50", urgent: false };
  return null;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dismissedNotifs") || "[]"); } 
    catch { return []; }
  });
  const panelRef = useRef(null);

  // Fetch assignments and filter for actionable ones
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_ASSIGNMENTS, { withCredentials: true });
      const assignments = res.data || [];
      const notifs = assignments
        .filter((a) => a.status !== "Completed")
        .map((a) => {
          const due = getDueLabel(a.dueDate);
          if (!due) return null;
          return { id: a._id, title: a.title, module: a.module, ...due };
        })
        .filter(Boolean)
        .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
      setNotifications(notifs);
    } catch (e) {
      // silently ignore — bell shouldn't break layout
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const visible = notifications.filter((n) => !dismissed.includes(n.id));
  const urgentCount = visible.filter((n) => n.urgent).length;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("dismissedNotifs", JSON.stringify(next));
  };

  const dismissAll = () => {
    const ids = visible.map((n) => n.id);
    const next = [...dismissed, ...ids];
    setDismissed(next);
    localStorage.setItem("dismissedNotifs", JSON.stringify(next));
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative text-slate-400 hover:text-slate-700 transition-colors p-1"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {urgentCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 animate-pulse">
            {urgentCount > 9 ? "9+" : urgentCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          style={{ maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {urgentCount > 0 && (
                <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                  {urgentCount} urgent
                </span>
              )}
            </div>
            {visible.length > 0 && (
              <button
                onClick={dismissAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
            {visible.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-slate-600">All clear!</p>
                <p className="text-xs text-slate-400 mt-1">No upcoming deadline alerts</p>
              </div>
            ) : (
              visible.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${n.bg}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.label === "Overdue" ? "🔴" : n.label === "Due Today!" ? "🟠" : "🔵"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 truncate">{n.module || "Assignment"}</p>
                    <span className={`inline-block mt-1 text-[11px] font-bold ${n.color}`}>
                      {n.label}
                    </span>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
                    aria-label="Dismiss"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
