/**
 * Build student academic context for AI
 */
export const buildStudentContext = (subjects, gpa) => {
  const subjectText = subjects
    .map(
      (s) =>
        `${s.title || "Untitled"} | Credits: ${s.credits ?? "N/A"} | Difficulty: ${s.difficulty || "N/A"} | Grade: ${s.grade || "N/A"}`
    )
    .join("\n");

  return `
You are an AI Academic Advisor for university students.

RULES:
- Give short, clear answers
- Focus on study improvement
- Be strict if GPA is low
- Prioritize weak subjects

STUDENT DATA:
GPA: ${gpa}

SUBJECTS:
${subjectText || "No subjects added yet."}
`;
};