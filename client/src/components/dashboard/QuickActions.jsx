import { useNavigate } from "react-router-dom";

const ACTIONS = [
  {
    label: "Add Subject",
    icon: "📚",
    path: "/subjects",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-700",
  },
  {
    label: "Assignment",
    icon: "📋",
    path: "/assignments",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 hover:bg-violet-100",
    text: "text-violet-700",
  },
  {
    label: "AI Study Plan",
    icon: "🧠",
    path: "/ai-study-plan",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 hover:bg-rose-100",
    text: "text-rose-700",
  },
  {
    label: "Notes",
    icon: "📝",
    path: "/notes",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-700",
  },
  {
    label: "AI Chat",
    icon: "💬",
    path: "/ai-chat",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
  },
  {
    label: "Timetable",
    icon: "📅",
    path: "/timetable",
    gradient: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50 hover:bg-cyan-100",
    text: "text-cyan-700",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
      <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
        <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-[10px]">⚡</span>
        Quick Access
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150 active:scale-95 ${a.bg} ${a.text}`}
          >
            <span className="text-lg">{a.icon}</span>
            <span className="text-[10px] font-semibold text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}