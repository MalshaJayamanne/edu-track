export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-slate-100/80">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
