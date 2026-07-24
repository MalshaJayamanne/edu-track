export default function Button({ children, onClick, type = "button", variant = "primary", className = "", ...props }) {
  const baseStyle = "px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
