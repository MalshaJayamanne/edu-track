import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useWindowSize } from "../hooks/useWindowSize";
import AcademicReportModal from "../components/ui/AcademicReportModal";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const API_GPA         = "http://localhost:5000/api/gpa";
const API_SUBJECTS    = "http://localhost:5000/api/subjects";
const API_ASSIGNMENTS = "http://localhost:5000/api/assignments";

const GRADE_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, F: 0.0, Ongoing: null,
};

// Grades selectable in the What-If calculator — excludes "Ongoing" since a
// hypothetical subject with no grade yet can't project a meaningful GPA impact.
const WHATIF_GRADES = Object.keys(GRADE_POINTS).filter((g) => g !== "Ongoing");

const GRADE_COLORS = {
  "A+": "#10b981", A: "#22c55e", "A-": "#84cc16",
  "B+": "#3b82f6", B: "#60a5fa", "B-": "#93c5fd",
  "C+": "#f59e0b", C: "#fb923c", F: "#ef4444",
  Ongoing: "#8b5cf6",
};

const PIE_COLORS = ["#10b981","#22c55e","#84cc16","#3b82f6","#60a5fa","#93c5fd","#f59e0b","#fb923c","#ef4444"];

function GPABadge({ gpa }) {
  const num = Number(gpa);
  if (!gpa || num === 0) return <span className="text-slate-400 font-medium">No Graded Data</span>;
  if (num >= 3.7) return <span className="text-emerald-600 font-bold">Distinction 🏆</span>;
  if (num >= 3.0) return <span className="text-blue-600 font-bold">Merit 🎯</span>;
  if (num >= 2.0) return <span className="text-amber-600 font-bold">Pass ✅</span>;
  return <span className="text-rose-600 font-bold">At Risk ⚠️</span>;
}

function GpaRing({ value, max = 4.0, size = 120 }) {
  const pct = Math.min(Number(value) / max, 1);
  const r   = 48;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct >= 0.925 ? "#10b981" : pct >= 0.75 ? "#6366f1" : pct >= 0.5 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 56 56)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="56" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{Number(value).toFixed(2)}</text>
      <text x="56" y="68" textAnchor="middle" fontSize="10" fill="#94a3b8">/ 4.00</text>
    </svg>
  );
}

export default function GPA() {
  const [gpaData, setGpaData]         = useState(null);
  const [subjects, setSubjects]       = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeSem, setActiveSem]     = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { isMobile } = useWindowSize();

  // Responsive chart values
  const chartH    = isMobile ? 170 : 200;
  const axisFont  = isMobile ? 10  : 11;
  const pieOuter  = isMobile ? 60  : 72;
  const pieInner  = isMobile ? 32  : 45;

  // Current semester: prefer localStorage, otherwise will auto-detect highest
  const [currentSem, setCurrentSem] = useState(() => {
    const saved = localStorage.getItem("currentSemester");
    return saved ? Number(saved) : null;
  });

  // What-if calculator state
  const [whatIf, setWhatIf]         = useState({ subject: "", grade: "A", credits: "" });
  const [whatIfResult, setWhatIfResult] = useState(null);

  // ── Fetch ──
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [gpaRes, subRes, asgRes] = await Promise.all([
        axios.get(API_GPA, { withCredentials: true }),
        axios.get(API_SUBJECTS, { withCredentials: true }),
        axios.get(API_ASSIGNMENTS, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);
      const gData = gpaRes.data;
      const sData = subRes.data;
      setGpaData(gData);
      setSubjects(sData);
      setAssignments(asgRes.data || []);

      // Auto-detect: set active tab to first semester
      if (!activeSem && gData.semesterBreakdown?.length > 0) {
        // Open the highest-numbered real semester tab by default
        const real = gData.semesterBreakdown.filter(s => s.semester > 0);
        if (real.length > 0) setActiveSem(real[real.length - 1].semester);
        else setActiveSem(gData.semesterBreakdown[0].semester);
      }

      // Auto-set current semester to highest if not previously saved
      setCurrentSem(prev => {
        if (prev !== null) return prev; // already set by user
        // Find highest semester among subjects
        const sems = sData.map(s => Number(s.semester || 0)).filter(s => s > 0);
        const highest = sems.length > 0 ? Math.max(...sems) : 1;
        localStorage.setItem("currentSemester", highest);
        window.dispatchEvent(new Event("semesterChange"));
        return highest;
      });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load GPA data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Set current semester ──
  const handleSetCurrentSem = (sem) => {
    setCurrentSem(sem);
    localStorage.setItem("currentSemester", sem);
    window.dispatchEvent(new Event("semesterChange"));
  };

  // ── Active semester data ──
  const activeSemData = useMemo(() => {
    if (!gpaData) return null;
    return gpaData.semesterBreakdown?.find((s) => s.semester === activeSem) || null;
  }, [gpaData, activeSem]);

  // ── What-if calculation ──
  // Only include subjects with a real grade point (exclude Ongoing) to match CGPA formula
  const runWhatIf = () => {
    if (!whatIf.subject || !whatIf.credits) {
      return; // validation: need name and credits
    }
    const credits = Number(whatIf.credits);
    if (isNaN(credits) || credits <= 0) return;
    const newGradePoint = GRADE_POINTS[whatIf.grade];
    if (newGradePoint === null || newGradePoint === undefined) return;

    // Base: graded subjects only (exclude Ongoing)
    const gradedBase = subjects.filter(s => s.grade !== "Ongoing" && GRADE_POINTS[s.grade] !== null && GRADE_POINTS[s.grade] !== undefined);
    const basePts = gradedBase.reduce((sum, x) => sum + (GRADE_POINTS[x.grade] ?? 0) * Number(x.credits || 0), 0);
    const baseCrd = gradedBase.reduce((sum, x) => sum + Number(x.credits || 0), 0);

    const totalPts = basePts + newGradePoint * credits;
    const totalCrd = baseCrd + credits;
    const newGpa   = totalCrd > 0 ? (totalPts / totalCrd).toFixed(2) : "0.00";
    const prevGpa  = gpaData?.cgpa ?? 0;
    setWhatIfResult({ newGpa, diff: (Number(newGpa) - Number(prevGpa)).toFixed(2) });
  };

  if (loading) return (
    <DashboardLayout>
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl">{error}</div>
    </DashboardLayout>
  );

  const semesters   = gpaData?.semesterBreakdown || [];
  const gradeChart  = gpaData?.gradeChart        || [];
  const trendData   = gpaData?.gpaBySemseter     || [];
  const cgpa        = gpaData?.cgpa              ?? 0;
  const totalCredits = gpaData?.totalCredits     ?? 0;
  const subjectCount = gpaData?.subjectCount     ?? 0;

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">GPA Calculator</h1>
          <p className="text-slate-500 text-sm mt-1">Multi-semester academic performance analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Export PDF Report Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all text-sm"
          >
            <span>📄</span>
            <span>Export Report (PDF)</span>
          </button>

          {/* Current Semester Badge */}
          <div className="flex items-center gap-2 sm:gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">📍 Current Sem:</span>
            <select
              value={currentSem ?? ""}
              onChange={(e) => handleSetCurrentSem(Number(e.target.value))}
              className="text-sm font-bold text-indigo-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {[1,2,3,4,5,6,7,8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            <span className="text-xs text-emerald-600 font-semibold hidden sm:inline">✓ Auto-detected</span>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        {[
          { label: "CGPA",          value: Number(cgpa).toFixed(2), icon: "📊", sub: <GPABadge gpa={cgpa} />,                                          color: "bg-gradient-to-br from-indigo-500 to-violet-600" },
          { label: "Total Credits", value: totalCredits,            icon: "🎓", sub: <span className="text-slate-400 text-xs">Earned</span>,           color: "bg-violet-600" },
          { label: "Subjects",      value: subjectCount,            icon: "📚", sub: <span className="text-slate-400 text-xs">All semesters</span>,    color: "bg-emerald-600" },
          { label: "Semesters",     value: semesters.filter(s => s.semester > 0).length, icon: "📅", sub: <span className="text-slate-400 text-xs">Completed</span>, color: "bg-amber-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-5 flex items-center gap-3">
            <div className={`${kpi.color} text-white w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-2xl shrink-0`}>
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">{kpi.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">{kpi.value}</p>
              <div className="text-xs mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-7">

        {/* LEFT: GPA Ring + Semester Tabs + Subject Table */}
        <div className="lg:col-span-2 space-y-7">

          {/* CGPA Ring Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            {/* On mobile: ring on top, chart below. On sm+: side-by-side */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 shrink-0 w-full sm:w-auto">
                <GpaRing value={cgpa} />
                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-slate-600">Cumulative GPA</p>
                  <GPABadge gpa={cgpa} />
                </div>
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-2 sm:mb-3">Semester GPA Trend</h3>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={isMobile ? 140 : 160}>
                    <LineChart data={trendData} margin={{ top: 4, right: 8, left: isMobile ? -28 : -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                        tickFormatter={(v) => isMobile ? v.replace("Sem ","S") : v}
                      />
                      <YAxis domain={[0, 4]} tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickCount={5} />
                      <Tooltip formatter={(v) => [Number(v).toFixed(2), "GPA"]} />
                      <Line type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={2.5}
                        dot={{ r: isMobile ? 3 : 4, fill: "#6366f1", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#6366f1" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[120px] sm:h-[160px] flex items-center justify-center text-slate-400 text-sm text-center">
                    Add subjects with semester numbers to see the trend
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Semester Tabs */}
          {semesters.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Tab header */}
              <div className="flex overflow-x-auto border-b border-slate-100 px-4 pt-4 gap-1">
                {semesters.map((s) => (
                  <button
                    key={s.semester}
                    onClick={() => setActiveSem(s.semester)}
                    className={`shrink-0 px-4 py-2 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
                      activeSem === s.semester
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {s.semester === 0 ? "Unassigned" : `Sem ${s.semester}`}
                    {s.semester === currentSem && (
                      <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Current</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              {activeSemData && (
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <GpaRing value={activeSemData.gpa} size={80} />
                      <div>
                        <p className="text-xs text-slate-500">Semester GPA</p>
                        <p className="text-2xl font-bold text-slate-800">{Number(activeSemData.gpa).toFixed(2)}</p>
                        <GPABadge gpa={activeSemData.gpa} />
                      </div>
                    </div>
                    <div className="flex gap-4 ml-auto text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{activeSemData.credits}</p>
                        <p className="text-xs text-slate-500">Credits</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{activeSemData.subjectCount}</p>
                        <p className="text-xs text-slate-500">Subjects</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-100 -mx-2 sm:mx-0">
                    <table className="w-full text-sm" style={{ minWidth: "480px" }}>
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-3 font-semibold">Subject</th>
                          <th className="text-center px-4 py-3 font-semibold">Code</th>
                          <th className="text-center px-4 py-3 font-semibold">Credits</th>
                          <th className="text-center px-4 py-3 font-semibold">Grade</th>
                          <th className="text-center px-4 py-3 font-semibold">Points</th>
                          <th className="text-center px-4 py-3 font-semibold">Weighted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSemData.subjects.map((s, i) => (
                          <tr key={s._id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="px-4 py-3 font-medium text-slate-800">{s.title}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">{s.code || "—"}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{s.credits}</td>
                            <td className="px-4 py-3 text-center">
                              {s.grade === "Ongoing" ? (
                                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700">Ongoing</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                                  style={{ background: (GRADE_COLORS[s.grade] || "#94a3b8") + "20", color: GRADE_COLORS[s.grade] || "#64748b" }}>
                                  {s.grade || "—"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                              {s.grade === "Ongoing" ? (
                                <span className="text-slate-400 italic text-xs">in progress</span>
                              ) : (
                                (s.gradePoint ?? 0).toFixed(1)
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-700">
                              {s.grade === "Ongoing" ? "—" : ((s.gradePoint || 0) * (s.credits || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grade Distribution Bar Chart */}
          {gradeChart.some(g => g.count > 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">📊 Grade Distribution</h3>
              </div>
              <div className="p-3 sm:p-6">
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={gradeChart} barSize={isMobile ? 18 : 28}
                    margin={{ top: 4, right: 4, left: isMobile ? -28 : -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="grade" tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: axisFont, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [v, "Subjects"]} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {gradeChart.map((entry) => (
                        <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Donut + What-if + Sem overview */}
        <div className="space-y-7">

          {/* Grade Donut */}
          {gradeChart.some(g => g.count > 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Grade Breakdown</h3>
              </div>
              <div className="p-3 sm:p-6">
                <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
                  <PieChart>
                    <Pie data={gradeChart.filter(g => g.count > 0)} dataKey="count" nameKey="grade"
                      cx="50%" cy="50%"
                      innerRadius={pieInner} outerRadius={pieOuter}
                      paddingAngle={3}>
                      {gradeChart.filter(g => g.count > 0).map((entry, i) => (
                        <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} subject(s)`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                  {gradeChart.filter(g => g.count > 0).map((g) => (
                    <div key={g.grade} className="flex items-center gap-1 text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GRADE_COLORS[g.grade] }} />
                      {g.grade} ({g.count})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* What-if Calculator */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">🔮 What-If Calculator</h3>
            <p className="text-xs text-slate-500 mb-4">Simulate adding a new subject to see how it affects your CGPA.</p>

            <div className="space-y-3">
              <input
                placeholder="Subject name"
                value={whatIf.subject}
                onChange={(e) => setWhatIf({ ...whatIf, subject: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={whatIf.grade}
                  onChange={(e) => setWhatIf({ ...whatIf, grade: e.target.value })}
                  className="border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:border-indigo-500 outline-none"
                >
                  {WHATIF_GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
                <input
                  type="number" placeholder="Credits" min="1" max="6"
                  value={whatIf.credits}
                  onChange={(e) => setWhatIf({ ...whatIf, credits: e.target.value })}
                  className="border border-slate-200 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={runWhatIf}
                disabled={!whatIf.subject || !whatIf.credits}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔮 Calculate Impact
              </button>
              {(!whatIf.subject || !whatIf.credits) && (
                <p className="text-xs text-slate-400 text-center">Enter a subject name and credits to simulate</p>
              )}
            </div>

            {whatIfResult && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Projected CGPA</p>
                  <button onClick={() => setWhatIfResult(null)} className="text-slate-300 hover:text-slate-500 text-xs">✕ Reset</button>
                </div>
                <p className="text-4xl font-black text-indigo-700 mb-1">{whatIfResult.newGpa}</p>
                <p className={`text-sm font-semibold ${Number(whatIfResult.diff) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {Number(whatIfResult.diff) >= 0 ? "▲ +" : "▼ "}{Math.abs(Number(whatIfResult.diff)).toFixed(2)} from current CGPA ({Number(gpaData?.cgpa ?? 0).toFixed(2)})
                </p>
              </div>
            )}
          </div>

          {/* Semester Overview Cards */}
          {semesters.filter(s => s.semester > 0).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Semester Summary</h3>
              <div className="space-y-3">
                {semesters.filter(s => s.semester > 0).map((s) => (
                  <div key={s.semester}
                    onClick={() => setActiveSem(s.semester)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${s.semester === currentSem ? "bg-emerald-500" : "bg-slate-400"}`}>
                        {s.semester}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Semester {s.semester}
                          {s.semester === currentSem && <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Current</span>}
                        </p>
                        <p className="text-xs text-slate-400">{s.subjectCount} subjects · {s.credits} credits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">{Number(s.gpa).toFixed(2)}</p>
                      <GPABadge gpa={s.gpa} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {semesters.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-slate-500 font-medium mb-2">No data yet</p>
              <p className="text-slate-400 text-xs">Add subjects with semester numbers and grades in the Subjects page to see your GPA analytics here.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== ACADEMIC REPORT TRANSCRIPT MODAL ===== */}
      <AcademicReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        gpaData={gpaData}
        subjects={subjects}
        assignments={assignments}
      />
    </DashboardLayout>
  );
}