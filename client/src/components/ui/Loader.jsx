export default function Loader({ className = "", size = "md" }) {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-16 w-16 border-4"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-blue-600 border-b-blue-600 border-slate-200 ${sizes[size] || sizes.md}`}></div>
    </div>
  );
}
