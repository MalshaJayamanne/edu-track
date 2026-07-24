import { useState } from "react";

export default function SubjectForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    code: "",
    lecturer: "",
    semester: "",
    credits: "",
    difficulty: "Moderate"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({
      title: "",
      code: "",
      lecturer: "",
      semester: "",
      credits: "",
      difficulty: "Moderate"
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input name="title" placeholder="Title" onChange={handleChange} value={form.title} />
      <input name="code" placeholder="Code" onChange={handleChange} value={form.code} />
      <input name="lecturer" placeholder="Lecturer" onChange={handleChange} value={form.lecturer} />
      <input name="semester" placeholder="Semester" onChange={handleChange} value={form.semester} />
      <input name="credits" placeholder="Credits" onChange={handleChange} value={form.credits} />

      <select name="difficulty" onChange={handleChange} value={form.difficulty}>
        <option>Easy</option>
        <option>Moderate</option>
        <option>Hard</option>
        <option>Very Hard</option>
      </select>

      <button type="submit">Add Subject</button>
    </form>
  );
}