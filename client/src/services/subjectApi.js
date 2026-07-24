import API from "./api";

// GET ALL SUBJECTS
export const getSubjects = async () => {
  const res = await API.get("/subjects");
  return res.data;
};

// CREATE SUBJECT
export const createSubject = async (data) => {
  const res = await API.post("/subjects", data);
  return res.data;
};

// DELETE SUBJECT
export const deleteSubject = async (id) => {
  const res = await API.delete(`/subjects/${id}`);
  return res.data;
};

export const updateSubject = async (id, data) => {
  const res = await API.put(`/subjects/${id}`, data);
  return res.data;
};