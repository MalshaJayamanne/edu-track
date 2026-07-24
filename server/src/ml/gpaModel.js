export const predictGPA = (subjects) => {
  if (!subjects.length) return 0;

  let score = 0;
  let weight = 0;

  subjects.forEach((s) => {
    const gradePoint = s.gradePoint || 2.0;

    const difficultyWeight =
      s.difficulty === "Very Hard" ? 1.2 :
      s.difficulty === "Hard" ? 1.1 :
      s.difficulty === "Moderate" ? 1 :
      0.9;

    const credit = s.credits || 1;

    score += gradePoint * credit * difficultyWeight;
    weight += credit;
  });

  const baseGPA = score / weight;

  // simulate prediction trend
  const predictedGPA = baseGPA + (Math.random() * 0.2 - 0.1);

  return Number(Math.min(4.0, Math.max(0, predictedGPA)).toFixed(2));
};