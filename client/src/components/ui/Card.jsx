export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
