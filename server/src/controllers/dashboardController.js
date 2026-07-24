import Subject from "../models/Subject.js";
import Assignment from "../models/Assignment.js";
import { predictGPA } from "../ml/gpaModel.js";

// ================= GPA ENGINE =================
const calculateGPA = (subjects) => {
  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach((s) => {
    if (s.grade === "Ongoing") return;
    totalPoints += (s.gradePoint || 0) * (s.credits || 0);
    totalCredits += s.credits || 0;
  });

  return totalCredits === 0
    ? 0
    : Number((totalPoints / totalCredits).toFixed(2));
};

// ================= MAIN CONTROLLER =================
export const getDashboardStats = async (req, res) => {
  try {
    const subjects = await Subject.find({ createdBy: req.user._id });

    // ================= SEMESTER FILTER =================
    const semester = req.query.semester; // "all", "1", "2", ...
    const activeSemSubjects = semester && semester !== "all"
      ? subjects.filter((s) => s.semester === Number(semester))
      : subjects;

    // ================= BASIC KPIS =================
    const totalSubjects = activeSemSubjects.length;

    const totalCredits = activeSemSubjects.reduce(
      (sum, s) => sum + (s.grade === "Ongoing" ? 0 : (s.credits || 0)),
      0
    );

    const avgCredits =
      totalSubjects > 0
        ? Number((totalCredits / totalSubjects).toFixed(2))
        : 0;

    // ================= GPA =================
    const gpa = calculateGPA(activeSemSubjects);

    const predictedGPA = predictGPA(activeSemSubjects); //predict gpa

    // ================= DISTRIBUTIONS =================
    const difficultyCount = {
      Easy: 0,
      Moderate: 0,
      Hard: 0,
      "Very Hard": 0,
    };

    activeSemSubjects.forEach((s) => {
      difficultyCount[s.difficulty || "Moderate"]++;
    });

    const difficultyChart = Object.keys(difficultyCount).map((k) => ({
      name: k,
      value: difficultyCount[k],
    }));

    const gradeDistribution = {
      "A+": 0,
      A: 0,
      "A-": 0,
      "B+": 0,
      B: 0,
      "B-": 0,
      "C+": 0,
      C: 0,
      F: 0,
      Ongoing: 0,
    };

    activeSemSubjects.forEach((s) => {
      if (s.grade && gradeDistribution[s.grade] !== undefined) {
        gradeDistribution[s.grade]++;
      }
    });

    const gradeChart = Object.keys(gradeDistribution).map((k) => ({
      grade: k,
      count: gradeDistribution[k],
    }));

    // ================= SEMESTER =================
    const semesterMap = {};

    activeSemSubjects.forEach((s) => {
      if (s.semester) {
        semesterMap[s.semester] = (semesterMap[s.semester] || 0) + 1;
      }
    });

    const semesterChart = Object.keys(semesterMap)
      .map((s) => ({
        name: `Sem ${s}`,
        value: semesterMap[s],
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

    // ================= RISK ENGINE =================
    let riskLevel = "Low";

    if (gpa > 0 && gpa < 2.5) riskLevel = "High";
    else if (gpa > 0 && gpa < 3.0) riskLevel = "Medium";

    // ================= INSIGHT STRING =================
    let insight = "Keep maintaining consistency across all subjects.";

    if (gpa > 0 && gpa < 2.5) {
      insight = "⚠ Focus on weak subjects immediately and reduce workload.";
    } else if (gpa > 0 && gpa < 3.0) {
      insight = "📘 Improve performance in moderately difficult subjects.";
    } else if (gpa >= 3.0) {
      insight = "🚀 You are performing well — aim for higher-grade subjects.";
    } else {
      insight = "Start adding grades or ongoing subject details to view academic insights.";
    }

    // ================= COMPUTED INSIGHTS =================
    const hardestSubject = activeSemSubjects
      .filter((s) => s.difficulty === "Very Hard" || s.difficulty === "Hard")
      .sort((a, b) => (a.gradePoint || 0) - (b.gradePoint || 0))[0]?.title || "N/A";

    const focusSubject = activeSemSubjects
      .filter((s) => s.grade !== "Ongoing" && (s.gradePoint || 0) < 2.0)
      .sort((a, b) => (a.gradePoint || 0) - (b.gradePoint || 0))[0]?.title || "N/A";

    // ================= ASSIGNMENTS COUNT =================
    const userAssignments = await Assignment.find({ user: req.user._id });
    const activeSemAssignments = semester && semester !== "all"
      ? userAssignments.filter((a) => {
          const titleLower = (a.module || "").toLowerCase().trim();
          return activeSemSubjects.some((s) =>
            (s.title || "").toLowerCase().trim() === titleLower ||
            (s.code || "").toLowerCase().trim() === titleLower
          );
        })
      : userAssignments;

    const assignmentCount = activeSemAssignments.length;
    const pendingAssignments = activeSemAssignments.filter(
      (a) => a.status !== "Completed"
    ).length;

    // ================= RAW =================
    const rawSubjects = [...activeSemSubjects].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // ================= RESPONSE =================
    res.json({
      kpis: {
        totalSubjects,
        totalCredits,
        avgCredits,
        assignmentCount,
        pendingAssignments,
      },

      gpa,
      predictedGPA,

      difficultyChart,
      gradeChart,
      semesterChart,

      rawSubjects,

      // For InsightCard component (Analytics page uses data.insight)
      insight,

      // For Dashboard Academic Intelligence block
      insights: {
        hardestSubject,
        focusSubject,
        riskLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
