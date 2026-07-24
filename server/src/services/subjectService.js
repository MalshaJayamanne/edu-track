import Subject from "../models/Subject.js";

// ================= GPA MAP =================
const gradeToPoint = (grade) => {
  const map = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    F: 0,
    Ongoing: 0,
  };

  return map[grade] !== undefined ? map[grade] : 0;
};

// ================= CREATE =================
export const createSubject = async (data) => {
  return await Subject.create({
    ...data,
    gradePoint: gradeToPoint(data.grade), // ✅ AUTO GPA
  });
};

// ================= READ =================
export const getSubjectsByUser = async (userId) => {
  return await Subject.find({ createdBy: userId });
};

export const getSubjectById = async (id, userId) => {
  return await Subject.findOne({ _id: id, createdBy: userId });
};

// ================= UPDATE =================
export const updateSubject = async (id, userId, data) => {
  if (data.grade) {
    data.gradePoint = gradeToPoint(data.grade); // ✅ AUTO UPDATE GPA
  }

  return await Subject.findOneAndUpdate({ _id: id, createdBy: userId }, data, { new: true });
};

// ================= DELETE =================
export const deleteSubject = async (id, userId) => {
  return await Subject.findOneAndDelete({ _id: id, createdBy: userId });
};