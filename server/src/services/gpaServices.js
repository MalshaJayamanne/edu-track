import Subject from "../models/Subject.js";

export const calculateGPA = (subjects) => {
  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach((s) => {
    const gradePoint = Number(s.gradePoint || 0);
    const credits = Number(s.credits || 0);

    totalPoints += gradePoint * credits;
    totalCredits += credits;
  });

  if (totalCredits === 0) return 0;

  return Number((totalPoints / totalCredits).toFixed(2));
};