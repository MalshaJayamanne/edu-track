import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { showToast } from "../utils/toast";

const API = "http://localhost:5000/api/timetable";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TYPE_CFG = {
  Lecture: { cls: "bg-blue-50 text-blue-700 border-blue-100", icon: "📖" },
  Lab:     { cls: "bg-violet-50 text-violet-700 border-violet-100", icon: "🧪" },
  Study:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "📝" },
  Exam:    { cls: "bg-rose-50 text-rose-700 border-rose-100", icon: "⏱️" },
};

const EMPTY_FORM = { subject: "", day: "Monday", startTime: "", endTime: "", type: "Lecture" };

const getToday = () => DAYS[(new Date().getDay() + 6) % 7];

export default function Timetable() {
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState(EMPTY_FORM);
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const today = getToday();

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { withCredentials: true });
      setSlots(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addSlot = async () => {
    if (!form.subject || !form.startTime || !form.endTime) {
      const msg = "Subject, Start Time and End Time are required.";
      setError(msg);
      showToast.error(msg);
      return;
    }
    if (form.startTime >= form.endTime) {
      const msg = "End time must be after start time.";
      setError(msg);
      showToast.error(msg);
      return;
    }
    try {
      setError(null);
      setSaving(true);
      await axios.post(API, form, { withCredentials: true });
      showToast.success("Timetable slot added!");
      setForm(EMPTY_FORM);
      await fetchSlots();
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to add slot.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      showToast.success("Slot removed");
      fetchSlots();
    } catch (e) {
      showToast.error("Failed to remove slot");
    }
  };

  // ===== EDIT MODE =====
  const startEdit = (slot) => {
    setEditingId(slot._id);
    setEditForm({
      subject: slot.subject,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError(null);
  };

  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEdit = async (id) => {
    if (!editForm.subject || !editForm.startTime || !editForm.endTime) {
      setEditError("Subject, Start and End are required.");
      showToast.error("Subject, Start and End are required.");
      return;
    }
    if (editForm.startTime >= editForm.endTime) {
      setEditError("End time must be after start time.");
      showToast.error("End time must be after start time.");
      return;
    }
    try {
      setEditError(null);
      setEditSaving(true);
      await axios.put(`${API}/${id}`, editForm, { withCredentials: true });
      showToast.success("Slot updated!");
      setEditingId(null);
      await fetchSlots();
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to update slot.";
      setEditError(msg);
      showToast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Timetable</h1>
        <p className="text-slate-500 text-sm mt-1">Your weekly class & study schedule</p>
      </div>

      {/* Add Slot Form */}
      <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm p-5 mb-8">
        <h2 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Add New Slot</h2>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl mb-4">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Subject spans full width */}
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject *</label>
            <input
              name="subject"
              placeholder="e.g. Data Structures"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Day</label>
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            >
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start *</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">End *</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            >
              {Object.keys(TYPE_CFG).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={addSlot}
          disabled={saving}
          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm disabled:opacity-60"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-base font-bold">+</span>
          )}
          Add Slot
        </button>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col gap-2 animate-pulse">
              <div className="bg-slate-200 h-8 rounded-xl" />
              <div className="bg-slate-100 h-16 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const isToday = day === today;
            const daySlots = slots.filter((s) => s.day === day).sort(
              (a, b) => a.startTime.localeCompare(b.startTime)
            );

            return (
              <div key={day} className="flex flex-col gap-2">
                {/* Day Header */}
                <div
                  className={`text-center text-xs font-bold uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    isToday
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {daySlots.length > 0 && (
                    <span className="opacity-70 font-normal normal-case">({daySlots.length})</span>
                  )}
                </div>

                {/* Slots */}
                {daySlots.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-300 italic border border-dashed border-slate-200 rounded-xl">
                    Free
                  </div>
                ) : (
                  daySlots.map((s) => {
                    const cfg = TYPE_CFG[s.type] || { cls: "bg-slate-50 text-slate-600 border-slate-100", icon: "📌" };
                    const isEditing = editingId === s._id;

                    if (isEditing) {
                      return (
                        <div
                          key={s._id}
                          className="bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-md space-y-2"
                        >
                          {editError && (
                            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-1.5 rounded-lg">
                              {editError}
                            </p>
                          )}
                          <input
                            name="subject"
                            value={editForm.subject}
                            onChange={handleEditChange}
                            placeholder="Subject"
                            className="w-full border border-slate-200 rounded-lg p-1.5 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                          <select
                            name="day"
                            value={editForm.day}
                            onChange={handleEditChange}
                            className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            {DAYS.map((d) => <option key={d}>{d}</option>)}
                          </select>
                          <div className="flex gap-1.5">
                            <input
                              type="time"
                              name="startTime"
                              value={editForm.startTime}
                              onChange={handleEditChange}
                              className="w-1/2 border border-slate-200 rounded-lg p-1.5 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <input
                              type="time"
                              name="endTime"
                              value={editForm.endTime}
                              onChange={handleEditChange}
                              className="w-1/2 border border-slate-200 rounded-lg p-1.5 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditChange}
                            className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            {Object.keys(TYPE_CFG).map((t) => <option key={t}>{t}</option>)}
                          </select>
                          <div className="flex gap-1.5 pt-1">
                            <button
                              onClick={() => saveEdit(s._id)}
                              disabled={editSaving}
                              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold py-1.5 rounded-lg disabled:opacity-60"
                            >
                              {editSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={s._id}
                        className={`bg-white border rounded-xl p-3 shadow-sm group relative transition-all hover:shadow-md ${
                          isToday ? "border-indigo-100" : "border-slate-100"
                        }`}
                      >
                        <p className="font-bold text-slate-800 text-sm leading-tight truncate pr-9">{s.subject}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.startTime} – {s.endTime}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border mt-1.5 ${cfg.cls}`}>
                          <span>{cfg.icon}</span>
                          {s.type}
                        </span>

                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1 text-slate-400 hover:text-indigo-600 text-xs leading-none rounded hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="Edit slot"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteSlot(s._id)}
                            className="p-1 text-slate-400 hover:text-rose-500 text-sm font-bold leading-none rounded hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="Remove slot"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}