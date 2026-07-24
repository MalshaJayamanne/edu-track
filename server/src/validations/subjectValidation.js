export const validateSubject = (data) => {
  const errors = [];

  if (!data.title) errors.push("Title required");
  if (!data.code) errors.push("Code required");
  if (!data.semester) errors.push("Semester required");
  if (!data.credits) errors.push("Credits required");

  return errors;
};