export default function StatCard({ title, value, icon, sub, gradient, trend, trendLabel }) {
  const defaultGradient = gradient || "from-indigo-500 to-violet-600";
  const isPositiveTrend = trend === undefined ? null : trend >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
      {/* Subtle BG glow */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-br ${defaultGradient}`}
        style={{ opacity: "0.06" }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 leading-none truncate">
            {value ?? "—"}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{sub}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${isPositiveTrend ? "text-emerald-600" : "text-rose-500"}`}>
              <span>{isPositiveTrend ? "▲" : "▼"}</span>
              <span>{Math.abs(trend)}% {trendLabel || "vs last sem"}</span>
            </div>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${defaultGradient} flex items-center justify-center text-xl shadow-md shadow-indigo-200 shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}