import Subject from "../models/Subject.js";

// ---------------- GPA helper ----------------
const getGradePoint = (grade) => {
  const map = {
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
  return map[grade] ?? 2.0;
};

// ---------------- AI STUDY ENGINE ----------------
export const generateStudyPlan = async (req, res) => {
  try {
    const semester = req.query.semester;
    const query = { createdBy: req.user._id };
    if (semester && semester !== "all") {
      query.semester = Number(semester);
    }

    const subjects = await Subject.find(query);

    if (!subjects.length) {
      return res.json({
        message: "No subjects found for the selected semester",
        plan: [],
        productivityScore: 0,
        gpa: 0,
        topSubjects: [],
      });
    }

    // ---------------- GPA (based on subjects that already have a result) ----------------
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((s) => {
      if (s.grade === "Ongoing") return;
      const gp = s.gradePoint || getGradePoint(s.grade);
      totalPoints += gp * (s.credits || 0);
      totalCredits += s.credits || 0;
    });

    const gpa = totalCredits ? totalPoints / totalCredits : 0;

    // ---------------- STUDY PLAN: ONLY ONGOING SUBJECTS ----------------
    // A study plan only makes sense for subjects you're still actively studying —
    // subjects that already have a result don't need a study slot.
    const ongoingSubjects = subjects.filter((s) => s.grade === "Ongoing");

    if (!ongoingSubjects.length) {
      return res.json({
        message: "No ongoing subjects found for this semester — all subjects already have results.",
        plan: [],
        productivityScore: 0,
        gpa: Number(gpa.toFixed(2)),
        topSubjects: [],
      });
    }

    // ---------------- PRIORITY SCORE ----------------
    const enriched = ongoingSubjects.map((s) => {
      const difficultyWeight =
        s.difficulty === "Very Hard"
          ? 4
          : s.difficulty === "Hard"
          ? 3
          : s.difficulty === "Moderate"
          ? 2
          : 1;

      // All subjects here are "Ongoing" by definition, so this penalty is constant —
      // kept explicit in case ongoing subjects later carry a predicted/expected grade.
      const gradePenalty = 1.5;

      const priorityScore =
        (s.credits || 1) * difficultyWeight * gradePenalty;

      return {
        ...s._doc,
        priorityScore,
      };
    });

    // ---------------- SORT BY AI PRIORITY ----------------
    const sorted = enriched.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );

    // ---------------- GENERATE PLAN ----------------
    const plan = sorted.slice(0, 5).map((s, i) => ({
      slot: i + 1,
      subject: s.title,
      focus:
        s.difficulty === "Very Hard"
          ? "Concept revision + practice questions"
          : s.difficulty === "Hard"
          ? "Past papers + summaries"
          : "Quick revision + notes",
      duration:
        s.difficulty === "Very Hard"
          ? "2 hrs"
          : s.difficulty === "Hard"
          ? "1.5 hrs"
          : "1 hr",
      priority: s.priorityScore,
    }));

    // ---------------- PRODUCTIVITY SCORE ----------------
    const avgPriority =
      sorted.reduce((sum, s) => sum + s.priorityScore, 0) /
      sorted.length;

    const productivityScore = Math.min(
      100,
      Math.round(((gpa || 2.0) * 20 + avgPriority * 2) / 2)
    );

    res.json({
      gpa: Number(gpa.toFixed(2)),
      productivityScore,
      plan,
      topSubjects: sorted.slice(0, 3).map((s) => s.title),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};