import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import MarkdownMessage from "../components/chat/MarkdownMessage";
import AIErrorBanner from "../components/common/AIErrorBanner";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api/assignments";

const STATUS_CFG = {
  Pending:       { bg: "bg-slate-100",   text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" },
  "In Progress": { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400" },
  Completed:     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const EMPTY_FORM = { title: "", module: "", dueDate: "", weightage: "", progress: 0 };

export default function Assignments() {
  const { user, reloadUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [open, setOpen]               = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("All");
  const [aiPanel, setAiPanel]         = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState(null);
  const [currentSem, setCurrentSem]   = useState(() => localStorage.getItem("currentSemester") || "all");

  useEffect(() => {
    const handler = () => setCurrentSem(localStorage.getItem("currentSemester") || "all");
    window.addEventListener("semesterChange", handler);
    return () => window.removeEventListener("semesterChange", handler);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { withCredentials: true });
      setAssignments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.module || !form.dueDate) {
      setError("Title, Module and Due Date are required.");
      return;
    }
    try {
      setError(null);
      await axios.post(API, form, { withCredentials: true });
      setForm(EMPTY_FORM);
      setOpen(false);
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create assignment.");
    }
  };

  const updateProgress = async (id, progress) => {
    await axios.put(`${API}/${id}`, { progress: Number(progress) }, { withCredentials: true });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await axios.delete(`${API}/${id}`, { withCredentials: true });
    fetchData();
  };

  const fetchAIPrioritization = async () => {
    if (user?.aiCredits === 0) {
      setAiError("Your AI credits have finished. Please refill your credits in Settings.");
      setAiPanel(null);
      return;
    }
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await axios.get(`${API}/ai-prioritization`, { withCredentials: true });
      setAiPanel(res.data);
    } catch (e) {
      setAiError(e.response?.data?.message || "Failed to generate AI prioritization. Please try again.");
      setAiPanel(null);
    } finally {
      setAiLoading(false);
      reloadUser();
    }
  };

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff < 0) return { label: "Overdue!", cls: "text-rose-600 font-bold" };
    if (diff === 0) return { label: "Due today!", cls: "text-amber-600 font-bold" };
    if (diff <= 3) return { label: `${diff}d left`, cls: "text-orange-600 font-semibold" };
    return { label: `${diff}d left`, cls: "text-slate-500" };
  };

  const filtered = useMemo(() => {
    if (filter === "All") return assignments;
    return assignments.filter(a => a.status === filter);
  }, [assignments, filter]);

  const counts = useMemo(() => ({
    All: assignments.length,
    Pending: assignments.filter(a => a.status === "Pending").length,
    "In Progress": assignments.filter(a => a.status === "In Progress").length,
    Completed: assignments.filter(a => a.status === "Completed").length,
  }), [assignments]);

  return (
    <DashboardLayout>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track deadlines and submission progress</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={fetchAIPrioritization}
            disabled={aiLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all text-sm disabled:opacity-60"
          >
            {aiLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🧠</span>
            )}
            <span className="hidden sm:inline">AI Prioritize</span>
          </button>
          <button
            onClick={() => { setOpen(true); setError(null); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all text-sm"
          >
            <span className="font-bold">+</span>
            <span className="hidden xs:inline sm:inline">New</span> Assignment
          </button>
        </div>
      </div>

      {/* ===== AI ERROR BANNER ===== */}
      {aiError && (
        <div className="mb-6">
          <AIErrorBanner
            message={aiError}
            onRetry={fetchAIPrioritization}
            onDismiss={() => setAiError(null)}
          />
        </div>
      )}

      {/* ===== AI PANEL ===== */}
      {aiPanel && (
        <div className="mb-6 rounded-2xl border border-indigo-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #eef2ff, #faf5ff)" }}>
          <div className="px-5 py-4 border-b border-indigo-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs">🧠</span>
              <h3 className="text-sm font-bold text-slate-700">AI Assignment Prioritization</h3>
            </div>
            <button onClick={() => setAiPanel(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
          </div>
          <div className="p-5">
            <div className="text-sm text-slate-700 mb-4">
              <MarkdownMessage text={aiPanel.recommendations} />
            </div>
            {aiPanel.prioritized?.length > 0 && (
              <div className="space-y-2">
                {aiPanel.prioritized.map((a, i) => (
                  <div key={a._id} className="flex items-center gap-3 bg-white/70 rounded-xl border border-white/80 px-3 py-2.5">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.module} · {a.daysLeft}d left · {a.weightage}%</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-indigo-600">P: {a.priorityScore?.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== STATUS FILTER TABS ===== */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["All", "Pending", "In Progress", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === tab
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-200"
                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {tab} <span className="ml-1 opacity-70">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* ===== CARDS ===== */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-slate-400 text-sm">Loading assignments...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium mb-1">{filter === "All" ? "No assignments yet." : `No ${filter} assignments.`}</p>
          {filter === "All" && (
            <button onClick={() => setOpen(true)} className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold underline">
              Add your first assignment
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((a) => {
            const days = getDaysLeft(a.dueDate);
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.Pending;
            const progressColor = a.progress >= 100 ? "bg-emerald-500" : a.progress >= 50 ? "bg-indigo-500" : "bg-amber-400";

            return (
              <div key={a._id} className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {/* Top */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-800 text-base leading-tight truncate">{a.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{a.module}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {a.status}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-3 text-xs mb-4">
                  <span className="text-slate-500">📅 {new Date(a.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className={days.cls}>{days.label}</span>
                  {a.weightage > 0 && <span className="text-slate-500">⚖️ {a.weightage}%</span>}
                </div>

                {/* Progress bar */}
                <div className="mb-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-slate-700">{a.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${a.progress}%` }}
                    />
                  </div>
                  <input
                    type="range" min="0" max="100" value={a.progress}
                    onChange={(e) => updateProgress(a._id, e.target.value)}
                    className="w-full mt-2 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">New Assignment</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">{error}</p>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input name="title" placeholder="e.g. Research Report" value={form.title} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Module *</label>
                <input name="module" placeholder="e.g. Database Systems" value={form.module} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Due Date *</label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Weightage %</label>
                  <input type="number" name="weightage" placeholder="e.g. 25" value={form.weightage} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm transition-all">
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}