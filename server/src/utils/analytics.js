export const calculateKPIs = (subjects) => {
  const totalSubjects = subjects.length;

  const totalCredits = subjects.reduce(
    (sum, s) => sum + (s.credits || 0),
    0
  );

  const avgCredits =
    totalSubjects === 0 ? 0 : totalCredits / totalSubjects;

  return {
    totalSubjects,
    totalCredits,
    avgCredits: avgCredits.toFixed(2),
  };
};

// ---------------- DIFFICULTY CHART ----------------
export const difficultyChart = (subjects) => {
  const map = {
    Easy: 0,
    Moderate: 0,
    Hard: 0,
    "Very Hard": 0,
  };

  subjects.forEach((s) => {
    map[s.difficulty]++;
  });

  return Object.keys(map).map((key) => ({
    name: key,
    value: map[key],
  }));
};

// ---------------- SEMESTER CHART ----------------
export const semesterChart = (subjects) => {
  const map = {};

  subjects.forEach((s) => {
    map[s.semester] = (map[s.semester] || 0) + 1;
  });

  return Object.keys(map).map((sem) => ({
    name: `Sem ${sem}`,
    value: map[sem],
  }));
};

// ---------------- INSIGHTS ----------------
export const generateInsights = (subjects) => {
  if (subjects.length === 0) {
    return {
      hardestSubject: "N/A",
      focusSubject: "N/A",
      riskLevel: "Low",
    };
  }

  const hardest = [...subjects].sort((a, b) => {
    const order = { Easy: 1, Moderate: 2, Hard: 3, "Very Hard": 4 };
    return order[b.difficulty] - order[a.difficulty];
  })[0];

  const focus = subjects[subjects.length - 1];

  const hardCount = subjects.filter(
    (s) => s.difficulty === "Hard" || s.difficulty === "Very Hard"
  ).length;

  const riskLevel =
    hardCount > subjects.length / 2
      ? "High"
      : hardCount > subjects.length / 3
      ? "Medium"
      : "Low";

  return {
    hardestSubject: hardest?.name,
    focusSubject: focus?.name,
    riskLevel,
  };
};