import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";

const API = "http://localhost:5000/api/study-plan";

const FOCUS_LABELS = {
  "Concept revision + practice questions": { icon: "📖", color: "text-rose-600" },
  "Past papers + summaries":               { icon: "📄", color: "text-amber-600" },
  "Quick revision + notes":                { icon: "⚡", color: "text-emerald-600" },
};

export default function AIStudyPlanner() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [currentSem, setCurrentSem] = useState(() => localStorage.getItem("currentSemester") || "all");

  useEffect(() => {
    const handler = () => setCurrentSem(localStorage.getItem("currentSemester") || "all");
    window.addEventListener("semesterChange", handler);
    return () => window.removeEventListener("semesterChange", handler);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}?semester=${currentSem}`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load study plan.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [currentSem]);

  const semLabel = currentSem === "all" ? "All Semesters" : `Semester ${currentSem}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Generating your AI study plan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-slate-600 font-medium">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { productivityScore = 0, gpa = 0, plan = [], topSubjects = [], message } = data || {};

  const scoreColor = productivityScore >= 75 ? "text-emerald-600" : productivityScore >= 50 ? "text-amber-600" : "text-rose-600";
  const scoreGrad  = productivityScore >= 75 ? "from-emerald-500 to-teal-500" : productivityScore >= 50 ? "from-amber-500 to-orange-500" : "from-rose-500 to-red-500";

  return (
    <DashboardLayout>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Study Planner</h1>
          <p className="text-slate-400 text-sm mt-0.5">Smart study recommendations · <span className="text-indigo-600 font-semibold">{semLabel}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
          <span className="text-indigo-500 font-bold">🎯</span>
          <span className="text-slate-600">Showing plan for <span className="font-bold text-indigo-700">{semLabel}</span></span>
        </div>
      </div>

      {/* ===== SCORE CARDS ===== */}
      <div className="grid sm:grid-cols-3 gap-5 mb-7">
        {/* Productivity Score */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${scoreGrad} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-bold text-lg">{productivityScore}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</p>
            <p className={`text-2xl font-bold mt-0.5 ${scoreColor}`}>{productivityScore}<span className="text-sm text-slate-400 font-normal">/100</span></p>
          </div>
        </div>

        {/* GPA */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed GPA</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{Number(gpa).toFixed(2)}<span className="text-sm text-slate-400 font-normal"> / 4.00</span></p>
          </div>
        </div>

        {/* Priority Subjects */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">🔥 Top Priority Subjects</p>
          {topSubjects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topSubjects.map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No subjects found</p>
          )}
        </div>
      </div>

      {/* ===== NO DATA STATE ===== */}
      {(!plan || plan.length === 0) && (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-slate-500 font-medium mb-1">{message || "No subjects found for this semester."}</p>
          <p className="text-slate-400 text-xs">Add subjects in Semester {currentSem} to generate an AI study plan.</p>
        </div>
      )}

      {/* ===== STUDY PLAN SLOTS ===== */}
      {plan.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">📅 Recommended Study Plan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plan.map((p, i) => {
              const focusCfg = FOCUS_LABELS[p.focus] || { icon: "📘", color: "text-slate-600" };
              const slotGrads = [
                "from-indigo-500 to-violet-600",
                "from-blue-500 to-cyan-600",
                "from-rose-500 to-pink-600",
                "from-amber-500 to-orange-600",
                "from-emerald-500 to-teal-600",
              ];

              return (
                <div
                  key={p.slot}
                  className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Slot header */}
                  <div className={`px-5 py-3.5 bg-gradient-to-r ${slotGrads[i % slotGrads.length]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-xs font-semibold">Study Slot {p.slot}</span>
                      <span className="text-white font-bold text-sm bg-white/20 px-2.5 py-0.5 rounded-lg">{p.duration}</span>
                    </div>
                    <h3 className="text-white font-bold text-base mt-1 leading-tight">{p.subject}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{focusCfg.icon}</span>
                      <p className={`text-sm font-semibold ${focusCfg.color}`}>{p.focus}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Priority Score</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${slotGrads[i % slotGrads.length]} transition-all duration-700`}
                            style={{ width: `${Math.min(100, (p.priority || 0) * 5)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{(p.priority || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}