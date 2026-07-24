import { useEffect, useState } from "react";

export default function SubjectModal({ onClose, onSubmit, editData }) {
  const [form, setForm] = useState({
    title: "",
    code: "",
    lecturer: "",
    semester: "",
    credits: "",
    difficulty: "Moderate"
  });

  // PREFILL FOR EDIT
  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

      <div className="bg-white p-6 rounded w-96">

        <h2 className="text-xl font-bold mb-4">
          {editData ? "Edit Subject" : "Add Subject"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">

          <input
            name="title"
            value={form.title}
            placeholder="Title"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="code"
            value={form.code}
            placeholder="Code"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="lecturer"
            value={form.lecturer}
            placeholder="Lecturer"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="semester"
            value={form.semester}
            placeholder="Semester"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="credits"
            value={form.credits}
            placeholder="Credits"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full border p-2"
          >
            <option>Easy</option>
            <option>Moderate</option>
            <option>Hard</option>
            <option>Very Hard</option>
          </select>

          <div className="flex justify-between mt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-3 py-1"
            >
              {editData ? "Update" : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}