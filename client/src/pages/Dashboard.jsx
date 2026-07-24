import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import InsightCard from "../components/dashboard/InsightCard";
import RecentSubjects from "../components/dashboard/RecentSubjects";
import { useWindowSize } from "../hooks/useWindowSize";

const API = "http://localhost:5000/api/dashboard";

const DIFFICULTY_COLORS = {
  Easy: "#10b981",
  Moderate: "#3b82f6",
  Hard: "#f59e0b",
  "Very Hard": "#ef4444",
};

const RISK_CONFIG = {
  High:   { gradient: "from-rose-500 to-red-600",     bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",   icon: "🚨", bar: 85 },
  Medium: { gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",  icon: "⚠️", bar: 50 },
  Low:    { gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: "✅", bar: 20 },
};

function GpaRing({ value, max = 4.0 }) {
  const pct = Math.min(Number(value) / max, 1);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct >= 0.925 ? "#10b981" : pct >= 0.75 ? "#6366f1" : pct >= 0.5 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" />
      <circle
        cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 56 56)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="56" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">
        {Number(value).toFixed(2)}
      </text>
      <text x="56" y="66" textAnchor="middle" fontSize="10" fill="#94a3b8">/ 4.00</text>
    </svg>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSem, setCurrentSem] = useState(() => localStorage.getItem("currentSemester") || "all");
  const { isMobile } = useWindowSize();

  // Responsive chart sizing
  const chartH  = isMobile ? 160 : 180;
  const axisFont = isMobile ? 10 : 11;

  // Sync semester from Navbar global event
  useEffect(() => {
    const handler = () => setCurrentSem(localStorage.getItem("currentSemester") || "all");
    window.addEventListener("semesterChange", handler);
    return () => window.removeEventListener("semesterChange", handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}?semester=${currentSem}`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentSem]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const gpaValue  = Number(data?.gpa ?? 0);
  const gpa       = gpaValue.toFixed(2);
  const totalCredits = data?.kpis?.totalCredits || 0;
  const totalSubjects = data?.kpis?.totalSubjects || 0;
  const pendingAssignments = data?.kpis?.pendingAssignments || 0;
  const riskLevel = data?.insights?.riskLevel || "Low";
  const riskCfg   = RISK_CONFIG[riskLevel] || RISK_CONFIG.Low;

  const semLabel = currentSem === "all" ? "All Semesters" : `Semester ${currentSem}`;

  const gpaStatus =
    gpaValue >= 3.7 ? "Distinction 🏆"
    : gpaValue >= 3.0 ? "Merit 🎯"
    : gpaValue >= 2.0 ? "Pass ✅"
    : gpaValue > 0   ? "At Risk ⚠️"
    : "No Data";

  const workloadStatus =
    totalCredits > 18 ? "Heavy ⚠️"
    : totalCredits > 0 ? "Balanced ⚖️"
    : "No Data";

  const diffData = (data?.difficultyChart || []).filter(d => d.value > 0);
  const semData  = data?.semesterChart || [];

  return (
    <DashboardLayout>

      {/* ============ HEADER ============ */}
      <div className="mb-5 sm:mb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">Academic Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time intelligence · <span className="font-semibold text-indigo-600">{semLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 text-xs self-start sm:self-auto">
          <span className="font-semibold text-indigo-600">📅</span>
          <span className="text-slate-700 font-bold">{semLabel}</span>
        </div>
      </div>

      {/* ============ KPI ROW ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          title="Cumulative GPA"
          value={gpaValue > 0 ? gpa : "N/A"}
          icon="📊"
          sub={gpaStatus}
          gradient="from-indigo-500 to-violet-600"
        />
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          icon="📚"
          sub={`${semLabel}`}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Credits Enrolled"
          value={totalCredits}
          icon="🎓"
          sub={workloadStatus}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingAssignments}
          icon="📋"
          sub={pendingAssignments === 0 ? "All clear! 🎉" : "assignments due"}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ===== LEFT (2-col) ===== */}
        <div className="lg:col-span-2 space-y-5">

          {/* GPA Ring + Insights Banner */}
          <div className="grid sm:grid-cols-2 gap-5">

            {/* GPA RING CARD */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5 flex items-center gap-5">
              <div className="shrink-0">
                <GpaRing value={gpaValue} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GPA Score</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{gpaValue > 0 ? gpa : "N/A"}</p>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5">{gpaStatus}</p>
                <div className="mt-3 text-xs text-slate-500">
                  <p>Predicted: <span className="font-bold text-slate-700">{Number(data?.predictedGPA ?? gpaValue).toFixed(2)}</span></p>
                </div>
              </div>
            </div>

            {/* AI RISK PANEL */}
            <div
              className={`rounded-2xl border p-5 relative overflow-hidden ${riskCfg.bg} ${riskCfg.border}`}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#10b981"}, transparent)` }}
              />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">AI Risk Assessment</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{riskCfg.icon}</span>
                <span className={`text-xl font-bold ${riskCfg.text}`}>{riskLevel} Risk</span>
              </div>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${riskCfg.gradient} transition-all duration-700`}
                  style={{ width: `${riskCfg.bar}%` }}
                />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hardest Subject</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{data?.insights?.hardestSubject || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Focus Area</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{data?.insights?.focusSubject || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIFFICULTY DISTRIBUTION */}
          {diffData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">Subject Difficulty Distribution</h3>
                <span className="text-xs text-slate-400">{totalSubjects} subjects</span>
              </div>
              <div className="p-4 sm:p-5">
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={diffData} barSize={isMobile ? 24 : 36} margin={{ top: 4, right: 4, left: isMobile ? -28 : -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {diffData.map((entry) => (
                        <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name] || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {diffData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: DIFFICULTY_COLORS[d.name] }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEMESTER WORKLOAD CHART */}
          {semData.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100/80">
                <h3 className="text-sm font-bold text-slate-700">Semester Workload</h3>
              </div>
              <div className="p-4 sm:p-5">
                <ResponsiveContainer width="100%" height={chartH}>
                  <AreaChart data={semData} margin={{ top: 4, right: 4, left: isMobile ? -28 : -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="semGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => isMobile ? v.replace("Sem ","S") : v}
                    />
                    <YAxis tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Area
                      type="monotone" dataKey="value" name="Subjects"
                      stroke="#6366f1" strokeWidth={2.5}
                      fill="url(#semGrad)"
                      dot={{ r: isMobile ? 3 : 4, fill: "#6366f1", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#6366f1" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI STUDY INTELLIGENCE */}
          <div
            className="rounded-2xl border border-indigo-100/80 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #faf5ff 0%, #eef2ff 50%, #f0fdf4 100%)" }}
          >
            <div className="px-5 py-4 border-b border-indigo-100/60 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs">🧠</div>
              <h3 className="text-sm font-bold text-slate-700">AI Academic Intelligence</h3>
              <span className="ml-auto text-[10px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">LIVE</span>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "GPA Status",
                  value: gpaValue > 0 ? gpaStatus : "No grades yet",
                  icon: "📈",
                  color: "text-indigo-700",
                },
                {
                  label: "Risk Level",
                  value: riskLevel,
                  icon: riskCfg.icon,
                  color: riskCfg.text,
                },
                {
                  label: "Hardest Module",
                  value: data?.insights?.hardestSubject || "N/A",
                  icon: "🔥",
                  color: "text-orange-600",
                },
                {
                  label: "Focus Recommendation",
                  value: data?.insights?.focusSubject || "All Good",
                  icon: "🎯",
                  color: "text-blue-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 p-3.5 flex items-center gap-3"
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                    <p className={`text-sm font-bold mt-0.5 truncate ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <QuickActions />

          {/* Insight */}
          <InsightCard insight={data?.insight || "Keep maintaining consistency across all subjects."} />

          {/* Recent / Active Subjects */}
          <RecentSubjects subjects={data?.rawSubjects || []} />

          {/* Grade Donut (if data exists) */}
          {(data?.gradeChart || []).some(g => g.count > 0 && g.grade !== "Ongoing") && (
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 140 : 160}>
                <PieChart>
                  <Pie
                    data={(data?.gradeChart || []).filter(g => g.count > 0 && g.grade !== "Ongoing")}
                    dataKey="count" nameKey="grade"
                    cx="50%" cy="50%"
                    innerRadius={isMobile ? 30 : 42} outerRadius={isMobile ? 55 : 68}
                    paddingAngle={3}
                  >
                    {(data?.gradeChart || []).filter(g => g.count > 0 && g.grade !== "Ongoing").map((entry, i) => {
                      const COLORS = ["#10b981","#22c55e","#84cc16","#3b82f6","#60a5fa","#93c5fd","#f59e0b","#fb923c","#ef4444"];
                      return <Cell key={entry.grade} fill={COLORS[i % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} subject(s)`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                {(data?.gradeChart || []).filter(g => g.count > 0 && g.grade !== "Ongoing").map((g, i) => {
                  const COLORS = ["#10b981","#22c55e","#84cc16","#3b82f6","#60a5fa","#93c5fd","#f59e0b","#fb923c","#ef4444"];
                  return (
                    <div key={g.grade} className="flex items-center gap-1 text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      {g.grade} ({g.count})
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ongoing Risk Summary */}
          {(data?.rawSubjects || []).some(s => s.grade === "Ongoing") && (
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-base">⚡</span> Ongoing Risk
              </h3>
              <div className="space-y-2">
                {(data?.rawSubjects || [])
                  .filter(s => s.grade === "Ongoing")
                  .map(s => {
                    const risk = s.riskLevel || "Low";
                    const cfg = {
                      High:   { bg: "bg-rose-50",    text: "text-rose-600",   border: "border-rose-100" },
                      Medium: { bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-100" },
                      Low:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
                    }[risk] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" };

                    return (
                      <div key={s._id} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${cfg.bg} ${cfg.border}`}>
                        <span className="font-medium text-slate-700 truncate max-w-[130px]">{s.title}</span>
                        <span className={`font-bold shrink-0 ${cfg.text}`}>{risk}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}