export interface AttendanceInput {
  attended: number;
  total: number;
  minimumPercentage?: number;
}

export interface AttendanceResult {
  percentage: number;
  isSafe: boolean;
  safeBunks: number;
  recoveryClasses: number;
}

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (attended < 0 || total < 0 || attended > total) throw new Error("Invalid attended or total classes");
  if (total === 0) return 0.0;
  return Number(((attended / total) * 100).toFixed(2));
}

export function calculateSafeBunks(attended: number, total: number, minimumPercentage: number = 75): number {
  if (attended < 0 || total < 0 || attended > total || minimumPercentage < 0 || minimumPercentage > 100) throw new Error("Invalid parameters");
  if (minimumPercentage === 0) return Infinity;
  const maxTotal = Math.floor((attended * 100) / minimumPercentage);
  return Math.max(0, maxTotal - total);
}

export function calculateRecoveryClasses(attended: number, total: number, minimumPercentage: number = 75): number {
  if (attended < 0 || total < 0 || attended > total || minimumPercentage < 0 || minimumPercentage > 100) throw new Error("Invalid parameters");
  if (total === 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct >= minimumPercentage) return 0;
  if (minimumPercentage >= 100) return Infinity;
  const numerator = (minimumPercentage * total) - (100 * attended);
  const denominator = 100 - minimumPercentage;
  return Math.max(0, Math.ceil(numerator / denominator));
}

export function getAttendanceStatus(attended: number, total: number, minimumPercentage: number = 75): "safe" | "warning" | "critical" {
  if (total === 0) return "safe";
  const pct = (attended / total) * 100;
  if (pct >= minimumPercentage) return "safe";
  if (pct >= minimumPercentage - 5) return "warning";
  return "critical";
}

export function calculateFullAttendanceMetrics(input: AttendanceInput): AttendanceResult {
  const min = input.minimumPercentage ?? 75;
  const percentage = calculateAttendancePercentage(input.attended, input.total);
  const isSafe = input.total === 0 || percentage >= min;
  const safeBunks = calculateSafeBunks(input.attended, input.total, min);
  const recoveryClasses = calculateRecoveryClasses(input.attended, input.total, min);
  return { percentage, isSafe, safeBunks, recoveryClasses };
}
