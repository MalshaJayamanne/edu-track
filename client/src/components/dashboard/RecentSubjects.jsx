const RISK_CONFIG = {
  High:   { color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   dot: "bg-rose-500",   bar: "bg-rose-500" },
  Medium: { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  bar: "bg-amber-500" },
  Low:    { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
};

export default function RecentSubjects({ subjects }) {
  const visible = subjects?.slice(0, 5) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
      <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
        <span className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px]">📖</span>
        Active Subjects
      </h2>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-400 italic text-center py-4">No subjects added yet.</p>
      ) : (
        <div className="space-y-2.5">
          {visible.map((sub) => {
            const risk = sub.riskLevel || "Low";
            const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low;
            const isOngoing = sub.grade === "Ongoing";

            return (
              <div
                key={sub._id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100/80 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sub.title || sub.name}</p>
                    <p className="text-xs text-slate-400">Sem {sub.semester} · {sub.credits} cr</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOngoing ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {risk} Risk
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5 font-mono">
                      {sub.grade}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
