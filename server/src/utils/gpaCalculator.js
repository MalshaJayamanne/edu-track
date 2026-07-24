export const gradePoints = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "F": 0.0,
};

export const calculateGPA = (subjects) => {
  if (!subjects || subjects.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach((sub) => {
    if (sub.grade === "Ongoing") return;
    const gp = gradePoints[sub.grade] ?? 0;
    const credits = Number(sub.credits || 0);

    totalPoints += gp * credits;
    totalCredits += credits;
  });

  if (totalCredits === 0) return 0;

  return Number((totalPoints / totalCredits).toFixed(2));
};