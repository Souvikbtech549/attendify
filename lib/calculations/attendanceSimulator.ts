import {
  calculateAttendancePercentage,
  calculateSafeBunks,
  calculateRecoveryClasses,
} from "./attendance";

export interface SimulatorInput {
  currentAttended: number;
  currentTotal: number;
  minimumPercentage?: number;
  futureAttended: number;
  futureMissed: number;
}

export type ProjectedStatus = "SAFE" | "WARNING" | "CRITICAL";

export interface SimulatorResult {
  currentPercentage: number;
  futureTotal: number;
  projectedAttended: number;
  projectedTotal: number;
  projectedPercentage: number;
  percentageChange: number;
  isSafe: boolean;
  status: ProjectedStatus;
  safeBunksRemaining: number;
  recoveryClassesNeeded: number;
  summaryMessage: string;
}

export interface TrajectoryPoint {
  step: number;
  label: string;
  percentage: number;
  target: number;
  attended: number;
  total: number;
}

/**
 * Simulates future attendance scenarios with exact mathematical formulas.
 */
export function simulateAttendanceScenario(input: SimulatorInput): SimulatorResult {
  const {
    currentAttended,
    currentTotal,
    minimumPercentage = 75,
    futureAttended,
    futureMissed,
  } = input;

  if (
    currentAttended < 0 ||
    currentTotal < 0 ||
    currentAttended > currentTotal ||
    futureAttended < 0 ||
    futureMissed < 0 ||
    minimumPercentage < 0 ||
    minimumPercentage > 100
  ) {
    throw new Error("Invalid simulation parameters. Values must be non-negative and attended cannot exceed total.");
  }

  const currentPercentage =
    currentTotal === 0 ? 100.0 : calculateAttendancePercentage(currentAttended, currentTotal);

  const futureTotal = futureAttended + futureMissed;
  const projectedAttended = currentAttended + futureAttended;
  const projectedTotal = currentTotal + futureTotal;

  const projectedPercentage =
    projectedTotal === 0
      ? 100.0
      : Number(((projectedAttended / projectedTotal) * 100).toFixed(2));

  const percentageChange = Number((projectedPercentage - currentPercentage).toFixed(2));
  const isSafe = projectedPercentage >= minimumPercentage;

  const safeBunksRemaining = calculateSafeBunks(
    projectedAttended,
    projectedTotal,
    minimumPercentage
  );

  const recoveryClassesNeeded = calculateRecoveryClasses(
    projectedAttended,
    projectedTotal,
    minimumPercentage
  );

  let status: ProjectedStatus = "SAFE";
  if (!isSafe) {
    status = "CRITICAL";
  } else if (safeBunksRemaining <= 1) {
    status = "WARNING";
  } else {
    status = "SAFE";
  }

  let summaryMessage = "";
  if (status === "CRITICAL") {
    summaryMessage = `Projected at ${projectedPercentage.toFixed(2)}% (drops ${Math.abs(percentageChange).toFixed(2)}%). You will need ${recoveryClassesNeeded} recovery classes to restore eligibility.`;
  } else if (status === "WARNING") {
    summaryMessage = `Projected at ${projectedPercentage.toFixed(2)}%. Near threshold boundary with ${safeBunksRemaining} safe leaves remaining.`;
  } else {
    summaryMessage = `Projected at ${projectedPercentage.toFixed(2)}% (${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(2)}%). Safely meeting ${minimumPercentage}% goal with ${safeBunksRemaining} safe bunks left.`;
  }

  return {
    currentPercentage,
    futureTotal,
    projectedAttended,
    projectedTotal,
    projectedPercentage,
    percentageChange,
    isSafe,
    status,
    safeBunksRemaining,
    recoveryClassesNeeded,
    summaryMessage,
  };
}

/**
 * Generates a step-by-step trajectory curve for chart visualization.
 */
export function generateFutureTrajectory(input: SimulatorInput): TrajectoryPoint[] {
  const {
    currentAttended,
    currentTotal,
    minimumPercentage = 75,
    futureAttended,
    futureMissed,
  } = input;

  const futureTotal = futureAttended + futureMissed;
  const trajectory: TrajectoryPoint[] = [];

  const startPct = currentTotal === 0 ? 100 : Number(((currentAttended / currentTotal) * 100).toFixed(2));
  trajectory.push({
    step: 0,
    label: "Now",
    percentage: startPct,
    target: minimumPercentage,
    attended: currentAttended,
    total: currentTotal,
  });

  if (futureTotal === 0) return trajectory;

  // Simulate progress step by step
  let runningAttended = currentAttended;
  let runningTotal = currentTotal;

  // Sequence: attended classes first, then missed classes (or proportional)
  for (let i = 1; i <= futureTotal; i++) {
    if (i <= futureAttended) {
      runningAttended += 1;
    }
    runningTotal += 1;

    const pct = Number(((runningAttended / runningTotal) * 100).toFixed(2));
    trajectory.push({
      step: i,
      label: `+${i}`,
      percentage: pct,
      target: minimumPercentage,
      attended: runningAttended,
      total: runningTotal,
    });
  }

  return trajectory;
}