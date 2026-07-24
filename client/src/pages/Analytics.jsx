import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useWindowSize } from "../hooks/useWindowSize";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const API = "http://localhost:5000/api/analytics/gpa";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const RISK_CFG = {
  High:   { bg: "bg-rose-50",    text: "text-rose-600",   border: "border-rose-200" },
  Medium: { bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-200" },
  Low:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
};

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toFixed ? Number(p.value).toFixed(2) : p.value : p.value}</b>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const { isMobile, isTablet } = useWindowSize();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API, { withCredentials: true });
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
            <p className="text-slate-400 text-sm">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Responsive heights
  const chartH      = isMobile ? 200 : 280;
  const pieRadius   = isMobile ? 70  : 100;
  const axisFont    = isMobile ? 10  : 12;

  const riskCfg = RISK_CFG[data.insights?.riskLevel] || RISK_CFG.Low;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-800">Academic Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">GPA trends and performance insights</p>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-5 sm:mb-8">
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overall GPA</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">{data.overallGPA}</h2>
        </div>
        <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 ${riskCfg.bg} ${riskCfg.border}`}>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Risk Level</p>
          <h2 className={`text-lg sm:text-xl font-bold mt-1 ${riskCfg.text}`}>{data.insights.riskLevel}</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Best Sem</p>
          <h2 className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">
            Sem {data.insights.bestSemester?.semester ?? "—"}
          </h2>
        </div>
      </div>

      {/* ── CHARTS GRID ── */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

        {/* GPA Trend */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100/80">
            <h2 className="text-sm font-bold text-slate-700">📈 GPA Trend</h2>
          </div>
          <div className="p-3 sm:p-5">
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={data.gpaTrend} margin={{ top: 4, right: 8, left: isMobile ? -24 : -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => isMobile ? `S${v}` : `Sem ${v}`}
                />
                <YAxis
                  domain={[0, 4]}
                  tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  name="GPA"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: isMobile ? 3 : 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Pie */}
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100/80">
            <h2 className="text-sm font-bold text-slate-700">🥧 Grade Distribution</h2>
          </div>
          <div className="p-3 sm:p-5">
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data.gradeDistribution}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={pieRadius}
                  innerRadius={isMobile ? 30 : 40}
                  paddingAngle={3}
                  /* No label prop — renders outside container on mobile */
                >
                  {data.gradeDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} subject(s)`, n]} />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: axisFont, paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── PERFORMANCE BAR CHART ── */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden mt-4 sm:mt-6">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100/80">
          <h2 className="text-sm font-bold text-slate-700">📊 Semester Performance (GPA vs Credits)</h2>
        </div>
        <div className="p-3 sm:p-5">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart
              data={data.gpaTrend}
              barSize={isMobile ? 14 : 22}
              margin={{ top: 4, right: 8, left: isMobile ? -24 : -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => isMobile ? `S${v}` : `Sem ${v}`}
              />
              <YAxis
                tick={{ fontSize: axisFont, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: axisFont, paddingTop: "8px" }}
              />
              <Bar dataKey="credits" name="Credits" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gpa"     name="GPA"     fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── INSIGHTS ── */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-6">
        <div className="bg-rose-50 border border-rose-100 p-4 sm:p-5 rounded-2xl">
          <h2 className="font-bold text-rose-600 mb-2 text-sm">⚠️ Risk Analysis</h2>
          <p className="text-sm text-slate-700">{data.insights.recommendation}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-2xl">
          <h2 className="font-bold text-indigo-600 mb-2 text-sm">🎯 Recommendation</h2>
          <p className="text-sm text-slate-700">
            Focus on improving weak semesters and maintain GPA consistency above 3.0.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}