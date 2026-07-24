import Subject from "../models/Subject.js";
import { calculateGPA, gradePoints } from "../utils/gpaCalculator.js";

// ====================================================
// GET /api/gpa — Full GPA analytics across all semesters
// ====================================================
export const getGPA = async (req, res) => {
  try {
    const subjects = await Subject.find({ createdBy: req.user._id });

    // ── CGPA (all semesters) ──
    const cgpa = calculateGPA(subjects);

    const totalCredits = subjects.reduce(
      (sum, s) => sum + (s.grade === "Ongoing" ? 0 : Number(s.credits || 0)),
      0
    );

    // ── Per-semester breakdown ──
    const semMap = {};

    subjects.forEach((s) => {
      const sem = s.semester || 0;
      if (!semMap[sem]) semMap[sem] = [];
      semMap[sem].push(s);
    });

    const semesterBreakdown = Object.keys(semMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((sem) => {
        const subs = semMap[sem];
        const gpa = calculateGPA(subs);
        const credits = subs.reduce((s, x) => s + (x.grade === "Ongoing" ? 0 : Number(x.credits || 0)), 0);
        return {
          semester: Number(sem),
          label: sem === "0" ? "Unassigned" : `Semester ${sem}`,
          gpa,
          credits,
          subjectCount: subs.length,
          subjects: subs.map((s) => ({
            _id: s._id,
            title: s.title,
            code: s.code,
            credits: s.credits,
            grade: s.grade,
            gradePoint: s.gradePoint,
            difficulty: s.difficulty,
          })),
        };
      });

    // ── Grade distribution (all semesters) ──
    const gradeDistribution = {};
    Object.keys(gradePoints).forEach((g) => (gradeDistribution[g] = 0));
    gradeDistribution["Ongoing"] = 0;

    subjects.forEach((s) => {
      const grade = s.grade || "Ongoing";
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    });

    const gradeChart = Object.keys(gradeDistribution).map((g) => ({
      grade: g,
      count: gradeDistribution[g],
      point: g === "Ongoing" ? 0 : gradePoints[g],
    }));

    // ── Semester GPA trend (for line chart) ──
    const gpaBySemseter = semesterBreakdown
      .filter((s) => s.semester > 0)
      .map((s) => ({
        name: `Sem ${s.semester}`,
        gpa: s.gpa,
        credits: s.credits,
      }));

    res.json({
      cgpa,
      totalCredits,
      subjectCount: subjects.length,
      semesterBreakdown,
      gradeChart,
      gpaBySemseter,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};