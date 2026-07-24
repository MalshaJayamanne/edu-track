import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";

const API_TIMETABLE = "http://localhost:5000/api/timetable";
const API_ASSIGNMENTS = "http://localhost:5000/api/assignments";
const API_NOTES = "http://localhost:5000/api/notes";
const API_GPA = "http://localhost:5000/api/gpa";

export default function ProductivityDashboard() {
  const [todayClasses, setTodayClasses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [gpa, setGpa] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayDay = daysOfWeek[new Date().getDay()];

        const [timetableRes, assignmentsRes, notesRes, gpaRes] = await Promise.all([
          axios.get(API_TIMETABLE, { withCredentials: true }),
          axios.get(API_ASSIGNMENTS, { withCredentials: true }),
          axios.get(API_NOTES, { withCredentials: true }),
          axios.get(API_GPA, { withCredentials: true }).catch(() => ({ data: { cgpa: 0 } }))
        ]);

        // Filter and sort today's classes
        const filteredClasses = (timetableRes.data || [])
          .filter((s) => s.day === todayDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTodayClasses(filteredClasses);

        // Filter and sort assignments (not completed, closest due dates first)
        const pendingDeadlines = (assignmentsRes.data || [])
          .filter((a) => a.status !== "Completed")
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);
        setDeadlines(pendingDeadlines);

        // Set recent notes (first 5)
        setNotes((notesRes.data || []).slice(0, 4));

        // Set overall CGPA
        setGpa(gpaRes.data?.cgpa ?? 0);
      } catch (err) {
        console.error(err);
        setError("Failed to sync some academic stats. Please ensure you are logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDaysLeftLabel = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff < 0) return { label: "Overdue", cls: "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded" };
    if (diff === 0) return { label: "Due today!", cls: "text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded" };
    return { label: `${diff}d left`, cls: "text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100" };
  };

  const gpaTarget = 3.70;
  const gpaPercentage = Math.min(100, Math.round((gpa / gpaTarget) * 105)); // relative calculation scale

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Productivity Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your daily academic command center
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* TODAY'S CLASSES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[300px]">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📅</span> Today’s Schedule
          </h2>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm italic">
              <span className="text-2xl mb-1">🌴</span>
              No classes scheduled for today!
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[220px]">
              {todayClasses.map((c) => (
                <div key={c._id} className="flex justify-between items-center py-2.5 px-3 border border-slate-50 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.subject}</p>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full uppercase">{c.type}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-medium shrink-0">{c.startTime} – {c.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DEADLINES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[300px]">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>⏳</span> Upcoming Deadlines
          </h2>

          {deadlines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm italic">
              <span className="text-2xl mb-1">🎉</span>
              No pending assignments!
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[220px]">
              {deadlines.map((d) => {
                const days = getDaysLeftLabel(d.dueDate);
                return (
                  <div key={d._id} className="flex justify-between items-center py-2.5 px-3 border border-slate-50 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{d.title}</p>
                      <p className="text-xs text-slate-400 truncate">{d.module}</p>
                    </div>
                    <span className={`text-xs shrink-0 font-medium ${days.cls}`}>{days.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GPA PROGRESS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[300px]">
          <div>
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📊</span> GPA Progress
            </h2>

            <div className="text-center py-4">
              <div className="text-5xl font-extrabold text-blue-600">{Number(gpa).toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Current Cumulative CGPA
              </p>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Progress to target ({gpaTarget.toFixed(2)})</span>
              <span className="font-semibold text-slate-700">{gpaPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-700" style={{ width: `${gpaPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* RECENT NOTES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📝</span> Recent Notes
          </h2>

          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm italic py-4">No notes created yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {notes.map((n) => (
                <div key={n._id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{n.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{n.content}</p>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full truncate max-w-[120px]">{n.subject}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full">{n.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MINI CALENDAR (STATIC UI) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📆</span> Monthly Calendar
          </h2>

          <div className="grid grid-cols-7 text-[10px] text-center gap-1">
            {["S","M","T","W","T","F","S"].map((d,i)=>(
              <div key={i} className="font-bold text-slate-400 uppercase">{d}</div>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === new Date().getDate();
              return (
                <div
                  key={i}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isToday
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}