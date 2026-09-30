export type GpaScale = "4.0" | "10.0";
export interface GradeItem { credits: number; grade: string; }

export const GRADE_POINTS_4_SCALE: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
};

export const GRADE_POINTS_10_SCALE: Record<string, number> = {
  "O": 10.0, "A+": 9.0, "A": 8.0, "B+": 7.0, "B": 6.0, "C": 5.0, "P": 4.0, "F": 0.0,
};

export function getGradePoints(grade: string, scale: GpaScale = "4.0"): number {
  const norm = grade.trim().toUpperCase();
  const map = scale === "10.0" ? GRADE_POINTS_10_SCALE : GRADE_POINTS_4_SCALE;
  if (norm in map) return map[norm];
  const num = parseFloat(norm);
  if (!isNaN(num)) return num;
  throw new Error(`Invalid grade "${grade}"`);
}

export function calculateWeightedGpa(items: GradeItem[], scale: GpaScale = "4.0") {
  if (items.length === 0) return { gpa: 0, totalCredits: 0, totalQualityPoints: 0, scale };
  let totalCredits = 0;
  let totalQualityPoints = 0;
  for (const item of items) {
    if (!Number.isFinite(item.credits) || item.credits <= 0) throw new Error("Credits must be > 0");
    const points = getGradePoints(item.grade, scale);
    totalCredits += item.credits;
    totalQualityPoints += points * item.credits;
  }
  const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
  return { gpa, totalCredits, totalQualityPoints: Number(totalQualityPoints.toFixed(2)), scale };
}
