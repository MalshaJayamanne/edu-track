import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "📚", title: "Subject Manager",    desc: "Organise modules with credits, difficulty & lecturers." },
  { icon: "📋", title: "Assignment Tracker", desc: "Track deadlines, progress & weightage in one place." },
  { icon: "📅", title: "Smart Timetable",   desc: "Weekly class grid with colour-coded session types." },
  { icon: "📊", title: "Analytics",          desc: "Charts and AI insights to guide your study strategy." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-lg tracking-tight">EduTrack AI</span>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-900/40"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
          <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-blue-400" />
          MERN Stack · Week 1–5 Complete
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Your Smart{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Academic
          </span>{" "}
          Manager
        </h1>

        <p className="text-slate-400 mt-5 max-w-xl text-lg leading-relaxed">
          Track subjects, assignments, timetables, and academic analytics — powered by AI insights.
          Built for students who take their studies seriously.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            to="/register"
            className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 text-base"
          >
            Start for Free →
          </Link>
          <Link
            to="/login"
            className="px-7 py-3.5 border border-white/10 hover:bg-white/5 font-medium rounded-xl transition-all text-slate-300 text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 max-w-5xl w-full">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-200 hover:border-blue-500/30"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold mt-3 text-base">{f.title}</h3>
              <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-xs py-6 border-t border-white/5">
        © {new Date().getFullYear()} EduTrack AI. Built with the MERN stack.
      </footer>
    </div>
  );
}