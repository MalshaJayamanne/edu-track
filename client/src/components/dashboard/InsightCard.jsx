export default function InsightCard({ insight }) {
  return (
    <div
      className="rounded-2xl p-5 border border-indigo-100 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
      }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
      />

      <div className="flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base shrink-0 shadow-md shadow-indigo-200">
          🤖
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">AI Insight</p>
          <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}
