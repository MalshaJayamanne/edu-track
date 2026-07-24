import Subject from "../models/Subject.js";

// GPA mapping (same logic as frontend)
const gradePoints = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  F: 0.0,
};

// GPA calculator per dataset
const calculateGPA = (subjects) => {
  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach((s) => {
    if (s.grade === "Ongoing") return;
    const gp = s.gradePoint ?? gradePoints[s.grade] ?? 0;
    const cr = s.credits || 0;

    totalPoints += gp * cr;
    totalCredits += cr;
  });

  return totalCredits === 0
    ? 0
    : Number((totalPoints / totalCredits).toFixed(2));
};

// MAIN CONTROLLER
export const getGPAAnalytics = async (req, res) => {
  try {
    const subjects = await Subject.find({ createdBy: req.user._id });

    // ================= GPA =================
    const overallGPA = calculateGPA(subjects);

    // ================= GPA BY SEMESTER (TREND) =================
    const semesterMap = {};

    subjects.forEach((s) => {
      const sem = s.semester || "Unknown";

      if (!semesterMap[sem]) {
        semesterMap[sem] = {
          subjects: [],
        };
      }

      semesterMap[sem].subjects.push(s);
    });

    const gpaTrend = Object.keys(semesterMap)
      .map((sem) => {
        const semSubjects = semesterMap[sem].subjects;

        return {
          semester: `Sem ${sem}`,
          gpa: calculateGPA(semSubjects),
          credits: semSubjects.reduce(
            (sum, s) => sum + (s.grade === "Ongoing" ? 0 : (s.credits || 0)),
            0
          ),
          subjects: semSubjects.length,
        };
      })
      .sort((a, b) =>
        a.semester.localeCompare(b.semester, undefined, {
          numeric: true,
        })
      );

    // ================= GRADE DISTRIBUTION =================
    const gradeCount = {
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

    subjects.forEach((s) => {
      const grade = s.grade || "Ongoing";
      if (gradeCount[grade] !== undefined) {
        gradeCount[grade]++;
      }
    });

    const gradeDistribution = Object.keys(gradeCount).map((g) => ({
      grade: g,
      count: gradeCount[g],
    }));

    // ================= PERFORMANCE INSIGHTS =================
    const bestSemester = gpaTrend.reduce((max, cur) =>
      cur.gpa > max.gpa ? cur : max,
      gpaTrend[0] || { semester: "N/A", gpa: 0 }
    );

    const worstSemester = gpaTrend.reduce((min, cur) =>
      cur.gpa < min.gpa ? cur : min,
      gpaTrend[0] || { semester: "N/A", gpa: 0 }
    );

    // ================= RISK ENGINE =================
    let riskLevel = "Low";

    if (overallGPA < 2.5) riskLevel = "High";
    else if (overallGPA < 3.0) riskLevel = "Medium";

    let recommendation = "Keep up your performance.";

    if (riskLevel === "High") {
      recommendation =
        "Critical risk detected. Focus on improving weak subjects immediately.";
    } else if (riskLevel === "Medium") {
      recommendation =
        "You are slightly below optimal performance. Improve C-grade subjects.";
    } else if (overallGPA >= 3.5) {
      recommendation =
        "Excellent performance. Maintain consistency and aim for A+ subjects.";
    }

    // ================= RESPONSE =================
    res.json({
      overallGPA,

      gpaTrend,

      gradeDistribution,

      insights: {
        bestSemester,
        worstSemester,
        riskLevel,
        recommendation,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
