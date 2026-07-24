import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";

const RISK_CFG = {
  High:   { bg: "bg-rose-50",    text: "text-rose-600",   border: "border-rose-200",   label: "High Risk" },
  Medium: { bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-200",  label: "Medium Risk" },
  Low:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", label: "Low Risk" },
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSem, setCurrentSem] = useState(() => localStorage.getItem("currentSemester") || "all");

  const GRADE_POINTS = {
    "A+": 4.0, A: 4.0, "A-": 3.7,
    "B+": 3.3, B: 3.0, "B-": 2.7,
    "C+": 2.3, C: 2.0, F: 0.0, Ongoing: 0,
  };

  const [form, setForm] = useState({
    title: "",
    code: "",
    lecturer: "",
    credits: "",
    semester: "",
    difficulty: "Moderate",
    grade: "Ongoing",
  });

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const API = "http://localhost:5000/api/subjects";

  // ---------------- FETCH ----------------
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(API, {
        withCredentials: true,
      });
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch subjects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => setCurrentSem(localStorage.getItem("currentSemester") || "all");
    window.addEventListener("semesterChange", handler);
    return () => window.removeEventListener("semesterChange", handler);
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setForm({
      title: "",
      code: "",
      lecturer: "",
      credits: "",
      semester: "",
      difficulty: "Moderate",
      grade: "Ongoing",
    });
    setEditingId(null);
    setError(null);
  };

  // ---------------- ADD SUBJECT ----------------
  const addSubject = async () => {
    try {
      setError(null);
      const payload = {
        ...form,
        gradePoint: form.grade === "Ongoing" ? 0 : (GRADE_POINTS[form.grade] ?? 0),
      };
      await axios.post(API, payload, { withCredentials: true });
      fetchSubjects();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      const backendErr = err.response?.data?.errors?.join(", ") || err.response?.data?.message;
      setError(backendErr || "Failed to create subject. Ensure all fields are filled.");
    }
  };

  // ---------------- UPDATE SUBJECT ----------------
  const updateSubject = async () => {
    try {
      setError(null);
      const payload = {
        ...form,
        gradePoint: form.grade === "Ongoing" ? 0 : (GRADE_POINTS[form.grade] ?? 0),
      };
      await axios.put(`${API}/${editingId}`, payload, {
        withCredentials: true,
      });
      fetchSubjects();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update subject.");
    }
  };

  // ---------------- DELETE SUBJECT ----------------
  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, {
        withCredentials: true,
      });
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- EDIT CLICK ----------------
  const handleEdit = (subject) => {
    setForm({
      title: subject.title || "",
      code: subject.code || "",
      lecturer: subject.lecturer || "",
      credits: subject.credits || "",
      semester: subject.semester || "",
      difficulty: subject.difficulty || "Moderate",
      grade: subject.grade || "Ongoing",
    });

    setEditingId(subject._id);
    setShowModal(true);
    setError(null);
  };

  // Filter by current semester
  const filteredSubjects = useMemo(() => {
    if (currentSem === "all") return subjects;
    return subjects.filter(s => String(s.semester) === currentSem);
  }, [subjects, currentSem]);

  const getDifficultyBadgeClass = (diff) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Moderate":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Hard":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Very Hard":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Subjects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your semester modules</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="self-start sm:self-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 text-sm"
        >
          <span className="text-base font-bold">+</span> Add Subject
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && !showModal && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm max-w-lg mx-auto">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-slate-500 font-medium mb-4">No subjects registered yet.</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            Add Your First Subject
          </button>
        </div>
      ) : (
        /* GRID */
        filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm max-w-lg mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-500 font-medium mb-1">No subjects in Semester {currentSem}</p>
            <p className="text-slate-400 text-xs">Switch semester filter or add subjects for this semester.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((sub) => {
              const isOngoing = sub.grade === "Ongoing";
              const risk = sub.riskLevel || "Low";
              const riskCfg = RISK_CFG[risk] || RISK_CFG.Low;

              return (
                <div
                  key={sub._id}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-800 leading-tight truncate">
                          {sub.title || sub.name}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Sem {sub.semester} · {sub.credits} Credits</p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-slate-500 shrink-0">
                        {sub.code}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">👨‍🏫</span>
                        <span className="truncate">Lecturer: <span className="font-medium text-slate-700">{sub.lecturer || "Not specified"}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">📊</span>
                        {isOngoing ? (
                          <span>Status: <span className={`font-bold px-2 py-0.5 rounded-lg text-xs border ${riskCfg.bg} ${riskCfg.text} ${riskCfg.border}`}>{riskCfg.label}</span></span>
                        ) : (
                          <span>Grade: <span className="font-bold text-indigo-600">{sub.grade}</span> <span className="text-slate-400">({sub.gradePoint ?? 0} pts)</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 border rounded-lg ${getDifficultyBadgeClass(sub.difficulty)}`}>
                      {sub.difficulty}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this subject?")) deleteSubject(sub._id);
                        }}
                        className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Subject" : "Add Subject"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Subject Title
                  </label>
                  <input
                    name="title"
                    placeholder="e.g. Database Systems"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Subject Code
                    </label>
                    <input
                      name="code"
                      placeholder="e.g. CS-302"
                      value={form.code}
                      onChange={handleChange}
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Credits
                    </label>
                    <input
                      name="credits"
                      type="number"
                      placeholder="e.g. 3"
                      value={form.credits}
                      onChange={handleChange}
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Lecturer
                  </label>
                  <input
                    name="lecturer"
                    placeholder="e.g. Dr. Jane Smith"
                    value={form.lecturer}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Semester
                    </label>
                    <input
                      name="semester"
                      type="number"
                      placeholder="e.g. 1"
                      value={form.semester}
                      onChange={handleChange}
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                      className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm bg-white transition-all"
                    >
                      <option>Easy</option>
                      <option>Moderate</option>
                      <option>Hard</option>
                      <option>Very Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl p-3 text-sm bg-white transition-all"
                  >
                    <option value="Ongoing">🔄 Ongoing (In Progress)</option>
                    {["A+","A","A-","B+","B","B-","C+","C","F"].map((g) => (
                      <option key={g} value={g}>
                        {g} ({[4.0,4.0,3.7,3.3,3.0,2.7,2.3,2.0,0.0][["A+","A","A-","B+","B","B-","C+","C","F"].indexOf(g)]} pts)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {form.grade === "Ongoing"
                      ? "Risk level will be calculated from your assignments."
                      : `Grade Point: `}
                    {form.grade !== "Ongoing" && <span className="font-semibold text-slate-600">{GRADE_POINTS[form.grade] ?? 0}</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? updateSubject : addSubject}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-sm shadow-indigo-200"
              >
                {editingId ? "Update" : "Save Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}