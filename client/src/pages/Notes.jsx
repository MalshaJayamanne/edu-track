import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import MarkdownMessage from "../components/chat/MarkdownMessage";
import AIErrorBanner from "../components/common/AIErrorBanner";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api/notes";

const TAG_CFG = {
  General:    { bg: "bg-slate-100",   text: "text-slate-600" },
  Lecture:    { bg: "bg-blue-100",    text: "text-blue-700" },
  Lab:        { bg: "bg-violet-100",  text: "text-violet-700" },
  Assignment: { bg: "bg-amber-100",   text: "text-amber-700" },
  Exam:       { bg: "bg-red-100",     text: "text-red-700" },
};

const EMPTY_FORM = { title: "", subject: "", tag: "General", content: "" };

export default function Notes() {
  const { user, reloadUser } = useAuth();
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [search, setSearch]           = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sort, setSort]               = useState("Newest");

  // AI state per-note
  const [aiMode, setAiMode]           = useState(null);   // { noteId, type }
  const [aiResult, setAiResult]       = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [mcqActive, setMcqActive]     = useState({});     // { qIdx: answerIdx }
  const [flashFlipped, setFlashFlipped] = useState({});   // { idx: bool }

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API, { withCredentials: true });
      setNotes(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowModal(false);
  };

  const addNote = async () => {
    if (!form.title || !form.content) return;
    try {
      const res = await axios.post(API, form, { withCredentials: true });
      setNotes((prev) => [res.data, ...prev]);
      resetForm();
    } catch (err) { console.log(err); }
  };

  const updateNote = async () => {
    try {
      const res = await axios.put(`${API}/${editing._id}`, form, { withCredentials: true });
      setNotes((prev) => prev.map((n) => n._id === editing._id ? res.data : n));
      resetForm();
    } catch (err) { console.log(err); }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) { console.log(err); }
  };

  const togglePin = async (note) => {
    try {
      const res = await axios.put(`${API}/${note._id}`, { pinned: !note.pinned }, { withCredentials: true });
      setNotes((prev) => prev.map((n) => n._id === note._id ? res.data : n));
    } catch (err) { console.log(err); }
  };

  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title, subject: note.subject, tag: note.tag, content: note.content });
    setShowModal(true);
  };

  // ── AI actions ──
  const triggerAI = async (noteId, type) => {
    if (user?.aiCredits === 0) {
      setAiMode({ noteId, type });
      setAiResult({
        error: "Your AI credits have finished. Please refill your credits in Settings.",
      });
      return;
    }
    try {
      setAiMode({ noteId, type });
      setAiResult(null);
      setAiLoading(true);
      setMcqActive({});
      setFlashFlipped({});
      const endpoint = type === "summary" ? "summarize" : type === "mcq" ? "mcqs" : "flashcards";
      const res = await axios.post(`${API}/${noteId}/${endpoint}`, {}, { withCredentials: true });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({
        error: err.response?.data?.message || "AI generation failed. Make sure the note has content.",
      });
    } finally {
      setAiLoading(false);
      reloadUser();
    }
  };

  const subjects = useMemo(() => [...new Set(notes.map((n) => n.subject))], [notes]);

  const filtered = useMemo(() => {
    let data = [...notes];
    if (search) data = data.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedTag !== "All") data = data.filter((n) => n.tag === selectedTag);
    if (sort === "Newest") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "Oldest") data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "Pinned") data.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    return data;
  }, [notes, search, selectedTag, sort]);

  return (
    <DashboardLayout>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Notes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your AI-powered digital notebook</p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="🔍 Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm w-36 sm:w-48 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-3 sm:px-4 py-2.5 rounded-xl text-sm shadow-sm shadow-indigo-200 transition-all shrink-0"
          >
            + Note
          </button>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["All", "General", "Lecture", "Lab", "Assignment", "Exam"].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedTag === tag
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200"
            }`}
          >
            {tag}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Pinned</option>
          </select>
        </div>
      </div>

      {/* ===== AI RESULT PANEL ===== */}
      {aiMode && (
        <div className="mb-6 rounded-2xl border border-indigo-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #eef2ff, #faf5ff)" }}>
          <div className="px-5 py-4 border-b border-indigo-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs">🧠</span>
              <h3 className="text-sm font-bold text-slate-700">
                {aiMode.type === "summary" ? "AI Summary" : aiMode.type === "mcq" ? "Practice MCQs" : "Flashcards"}
              </h3>
            </div>
            <button onClick={() => { setAiMode(null); setAiResult(null); }} className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none">&times;</button>
          </div>
          <div className="p-5">
            {aiLoading ? (
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                AI is generating... please wait
              </div>
            ) : aiResult?.error ? (
              <AIErrorBanner
                message={aiResult.error}
                onRetry={() => triggerAI(aiMode.noteId, aiMode.type)}
              />
            ) : aiMode.type === "summary" && aiResult?.summary ? (
              <div className="text-sm text-slate-700">
                <MarkdownMessage text={aiResult.summary} />
              </div>
            ) : aiMode.type === "mcq" && Array.isArray(aiResult?.mcqs) ? (
              <div className="space-y-5">
                {aiResult.mcqs.map((q, qi) => (
                  <div key={qi} className="bg-white/70 rounded-xl border border-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-800 mb-3">Q{qi + 1}: {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = mcqActive[qi] === oi;
                        const isCorrect = opt === q.answer;
                        const revealed = mcqActive[qi] !== undefined;
                        return (
                          <button
                            key={oi}
                            onClick={() => !revealed && setMcqActive(prev => ({ ...prev, [qi]: oi }))}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition-all ${
                              revealed
                                ? isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold"
                                  : selected
                                    ? "bg-rose-50 border-rose-300 text-rose-700"
                                    : "bg-white border-slate-200 text-slate-500"
                                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 cursor-pointer"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}. {opt}
                            {revealed && isCorrect && " ✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : aiMode.type === "flashcards" && Array.isArray(aiResult?.flashcards) ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiResult.flashcards.map((fc, i) => (
                  <div
                    key={i}
                    onClick={() => setFlashFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="cursor-pointer min-h-[120px] rounded-xl border border-indigo-100 p-4 flex items-center justify-center text-center transition-all duration-300 hover:shadow-md"
                    style={{ background: flashFlipped[i] ? "linear-gradient(135deg, #eef2ff, #ede9fe)" : "white" }}
                  >
                    <div>
                      {!flashFlipped[i] ? (
                        <>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide mb-2">Question</p>
                          <p className="text-sm font-semibold text-slate-800">{fc.question}</p>
                          <p className="text-[10px] text-slate-400 mt-3">Click to reveal answer</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">Answer</p>
                          <p className="text-sm text-slate-700">{fc.answer}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ===== NOTE CARDS ===== */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-500 font-medium">No notes found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note) => {
            const tagCfg = TAG_CFG[note.tag] || TAG_CFG.General;
            const isAiActive = aiMode?.noteId === note._id;

            return (
              <div
                key={note._id}
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${
                  isAiActive ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-100/80"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-800 text-sm leading-tight truncate">{note.title}</h2>
                    <p className="text-xs text-indigo-500 mt-0.5 font-medium truncate">{note.subject}</p>
                  </div>
                  <button
                    onClick={() => togglePin(note)}
                    className="text-base shrink-0 hover:scale-110 transition-transform"
                    title={note.pinned ? "Unpin" : "Pin"}
                  >
                    {note.pinned ? "⭐" : "☆"}
                  </button>
                </div>

                {/* Tag */}
                <span className={`self-start text-[10px] font-bold px-2.5 py-1 rounded-lg mb-3 ${tagCfg.bg} ${tagCfg.text}`}>
                  {note.tag}
                </span>

                {/* Content preview */}
                <p className="text-sm text-slate-600 leading-relaxed flex-1 line-clamp-3">{note.content}</p>

                {/* AI Actions */}
                <div className="flex gap-1.5 mt-4 pt-3 border-t border-slate-100 flex-wrap">
                  <button
                    onClick={() => triggerAI(note._id, "summary")}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                  >
                    ✨ Summary
                  </button>
                  <button
                    onClick={() => triggerAI(note._id, "mcq")}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all"
                  >
                    🧠 MCQs
                  </button>
                  <button
                    onClick={() => triggerAI(note._id, "flashcards")}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                  >
                    🃏 Cards
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <button onClick={() => openEdit(note)} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
                      Edit
                    </button>
                    <button onClick={() => deleteNote(note._id)} className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white p-6 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Note" : "New Note"}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Chapter 3 — SQL Joins"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Database Systems"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tag</label>
                  <select name="tag" value={form.tag} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:border-indigo-500 outline-none">
                    {["General", "Lecture", "Lab", "Assignment", "Exam"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Content *</label>
                <textarea name="content" value={form.content} onChange={handleChange} rows={6}
                  placeholder="Write your note content here... (AI will use this for summaries & MCQs)"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button
                onClick={editing ? updateNote : addNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm transition-all"
              >
                {editing ? "Update Note" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}