import {
  calculateAttendancePercentage,
  calculateSafeBunks,
  calculateRecoveryClasses,
  calculateFullAttendanceMetrics,
} from "./attendance";

export type WarningSeverity = "CRITICAL" | "WARNING" | "SAFE";

export interface WarningInput {
  subjectName?: string;
  subjectCode?: string | null;
  attended: number;
  total: number;
  minimumPercentage?: number;
  warningThresholdBunks?: number;
}

export interface AttendanceWarning {
  severity: WarningSeverity;
  percentage: number;
  minimumPercentage: number;
  safeBunks: number;
  recoveryClasses: number;
  title: string;
  message: string;
  badgeText: string;
  badgeVariant: "critical" | "warning" | "safe";
  iconType: "critical" | "warning" | "safe";
  actionAdvice: string;
  subjectName?: string;
  subjectCode?: string | null;
}

/**
 * Evaluates the warning severity based on attendance percentage, minimum cutoff, and safe bunk count.
 */
export function getWarningSeverity(input: WarningInput): WarningSeverity {
  const min = input.minimumPercentage ?? 75;
  const warningBunks = input.warningThresholdBunks ?? 1;

  if (input.total === 0) return "SAFE";

  const percentage = calculateAttendancePercentage(input.attended, input.total);
  const safeBunks = calculateSafeBunks(input.attended, input.total, min);

  if (percentage < min) {
    return "CRITICAL";
  }

  if (safeBunks <= warningBunks) {
    return "WARNING";
  }

  return "SAFE";
}

/**
 * Generates an actionable, human-readable warning message tailored to the student's exact course standing.
 */
export function getWarningMessage(input: WarningInput): string {
  const min = input.minimumPercentage ?? 75;
  const name = input.subjectName ? input.subjectName : "this course";

  if (input.total === 0) {
    return `No classes conducted yet for ${name}. Attendance is in a healthy starting state.`;
  }

  const percentage = calculateAttendancePercentage(input.attended, input.total);
  const safeBunks = calculateSafeBunks(input.attended, input.total, min);
  const recovery = calculateRecoveryClasses(input.attended, input.total, min);

  if (percentage < min) {
    if (recovery === 1) {
      return `Your attendance in ${name} is ${percentage.toFixed(1)}% (below required ${min}%). You need to attend the next class to recover.`;
    }
    if (recovery === Infinity || recovery > 100) {
      return `Your attendance in ${name} is ${percentage.toFixed(1)}% (below required ${min}%). Recovery is mathematically impossible this term.`;
    }
    return `Your attendance in ${name} is ${percentage.toFixed(1)}% (below required ${min}%). You need to attend ${recovery} consecutive classes to recover.`;
  }

  if (safeBunks === 0) {
    return `You have 0 safe bunks remaining in ${name}. Missing the next class will drop your attendance below ${min}%.`;
  }

  if (safeBunks === 1) {
    return `You only have 1 safe bunk remaining in ${name}.`;
  }

  return `You are safely above the minimum requirement in ${name} with ${safeBunks} safe leaves available.`;
}

/**
 * Computes a full AttendanceWarning object containing severity, badges, messages, and actionable recovery steps.
 */
export function getAttendanceWarning(input: WarningInput): AttendanceWarning {
  const min = input.minimumPercentage ?? 75;
  const metrics = calculateFullAttendanceMetrics({
    attended: input.attended,
    total: input.total,
    minimumPercentage: min,
  });

  const severity = getWarningSeverity(input);
  const message = getWarningMessage(input);
  const subjectLabel = input.subjectName || "Course";

  if (severity === "CRITICAL") {
    return {
      severity: "CRITICAL",
      percentage: metrics.percentage,
      minimumPercentage: min,
      safeBunks: metrics.safeBunks,
      recoveryClasses: metrics.recoveryClasses,
      title: `Attendance Shortage: ${subjectLabel}`,
      message,
      badgeText: `Below ${min}% (Need ${metrics.recoveryClasses} Classes)`,
      badgeVariant: "critical",
      iconType: "critical",
      actionAdvice:
        metrics.recoveryClasses === 1
          ? "Attend the upcoming class without fail."
          : `Attend the next ${metrics.recoveryClasses} consecutive lectures/labs to restore eligibility.`,
      subjectName: input.subjectName,
      subjectCode: input.subjectCode,
    };
  }

  if (severity === "WARNING") {
    return {
      severity: "WARNING",
      percentage: metrics.percentage,
      minimumPercentage: min,
      safeBunks: metrics.safeBunks,
      recoveryClasses: 0,
      title: `Near Threshold: ${subjectLabel}`,
      message,
      badgeText: metrics.safeBunks === 0 ? "0 Bunks Left" : "1 Bunk Left",
      badgeVariant: "warning",
      iconType: "warning",
      actionAdvice:
        metrics.safeBunks === 0
          ? "Attendance is on the minimum boundary. Do not miss any upcoming classes."
          : "Exercise caution. You have only 1 discretionary leave before falling below target.",
      subjectName: input.subjectName,
      subjectCode: input.subjectCode,
    };
  }

  return {
    severity: "SAFE",
    percentage: metrics.percentage,
    minimumPercentage: min,
    safeBunks: metrics.safeBunks,
    recoveryClasses: 0,
    title: `Optimal Standing: ${subjectLabel}`,
    message,
    badgeText: `${metrics.safeBunks} Bunks Safe`,
    badgeVariant: "safe",
    iconType: "safe",
    actionAdvice: `Attendance is healthy. You can safely miss up to ${metrics.safeBunks} classes.`,
    subjectName: input.subjectName,
    subjectCode: input.subjectCode,
  };
}

/**
 * Sorts an array of attendance warnings prioritizing CRITICAL first, then WARNING, then SAFE.
 */
export function sortAttendanceWarnings(warnings: AttendanceWarning[]): AttendanceWarning[] {
  const severityWeight: Record<WarningSeverity, number> = {
    CRITICAL: 0,
    WARNING: 1,
    SAFE: 2,
  };

  return [...warnings].sort((a, b) => {
    const weightDiff = severityWeight[a.severity] - severityWeight[b.severity];
    if (weightDiff !== 0) return weightDiff;
    // Secondary sort: lower percentage first
    return a.percentage - b.percentage;
  });
}