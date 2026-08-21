export const calculateSubjectGrade = (
  theoryObtained: number,
  practicalObtained: number,
  theoryFull: number,
  practicalFull: number
) => {
  // If no exam or marks exist for the subject, return empty
  if (theoryFull === 0 && practicalFull === 0) {
    return { grade: 'N/A', gpa: 0.0 };
  }

  // NEB strict rule: must secure at least 35% in BOTH theory and practical individually
  const theoryPercent = theoryFull > 0 ? (theoryObtained / theoryFull) * 100 : 100;
  const practicalPercent = practicalFull > 0 ? (practicalObtained / practicalFull) * 100 : 100;

  if (theoryPercent < 35 || practicalPercent < 35) {
    return { grade: 'NG', gpa: 0.0 };
  }

  const totalObtained = theoryObtained + practicalObtained;
  const totalFull = theoryFull + practicalFull;
  const totalPercent = (totalObtained / totalFull) * 100;

  if (totalPercent >= 90) return { grade: 'A+', gpa: 4.0 };
  if (totalPercent >= 80) return { grade: 'A', gpa: 3.6 };
  if (totalPercent >= 70) return { grade: 'B+', gpa: 3.2 };
  if (totalPercent >= 60) return { grade: 'B', gpa: 2.8 };
  if (totalPercent >= 50) return { grade: 'C+', gpa: 2.4 };
  if (totalPercent >= 40) return { grade: 'C', gpa: 2.0 };
  if (totalPercent >= 35) return { grade: 'D', gpa: 1.6 };
  
  return { grade: 'NG', gpa: 0.0 };
};

export const calculateAggregateGPA = (
  subjectResults: { gpa: number; creditHours: number }[]
) => {
  let totalCreditHours = 0;
  let totalWeightedGPA = 0;

  for (const subject of subjectResults) {
    totalCreditHours += subject.creditHours;
    totalWeightedGPA += subject.gpa * subject.creditHours;
  }

  if (totalCreditHours === 0) return 0.0;
  return Number((totalWeightedGPA / totalCreditHours).toFixed(2));
};
