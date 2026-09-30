import { describe, it, expect } from "vitest";
import {
  simulateAttendanceScenario,
  generateFutureTrajectory,
} from "../attendanceSimulator";

describe("Attendance Goal Simulator Engine", () => {
  it("Scenario 1: 24/30 + 5 attended -> 29/35 = 82.86%, change +2.86%", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 24,
      currentTotal: 30,
      minimumPercentage: 75,
      futureAttended: 5,
      futureMissed: 0,
    });

    expect(result.currentPercentage).toBe(80.0);
    expect(result.projectedAttended).toBe(29);
    expect(result.projectedTotal).toBe(35);
    expect(result.projectedPercentage).toBe(82.86);
    expect(result.percentageChange).toBe(2.86);
    expect(result.isSafe).toBe(true);
    expect(result.status).toBe("SAFE");
    // maxTotal = floor(29*100/75) = floor(38.66) = 38. safeBunks = 38 - 35 = 3.
    expect(result.safeBunksRemaining).toBe(3);
    expect(result.recoveryClassesNeeded).toBe(0);
  });

  it("Scenario 2: 24/30 + 5 missed -> 24/35 = 68.57%, change -11.43%", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 24,
      currentTotal: 30,
      minimumPercentage: 75,
      futureAttended: 0,
      futureMissed: 5,
    });

    expect(result.currentPercentage).toBe(80.0);
    expect(result.projectedAttended).toBe(24);
    expect(result.projectedTotal).toBe(35);
    expect(result.projectedPercentage).toBe(68.57);
    expect(result.percentageChange).toBe(-11.43);
    expect(result.isSafe).toBe(false);
    expect(result.status).toBe("CRITICAL");
    // Recovery needed: ceil((75*35 - 2400) / 25) = ceil((2625 - 2400)/25) = ceil(225/25) = 9 classes
    expect(result.recoveryClassesNeeded).toBe(9);
  });

  it("Scenario 3: 20/30 + 10 attended -> 30/40 = 75.00%, change +8.33%", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 20,
      currentTotal: 30,
      minimumPercentage: 75,
      futureAttended: 10,
      futureMissed: 0,
    });

    expect(result.currentPercentage).toBe(66.67);
    expect(result.projectedAttended).toBe(30);
    expect(result.projectedTotal).toBe(40);
    expect(result.projectedPercentage).toBe(75.0);
    expect(result.percentageChange).toBe(8.33);
    expect(result.isSafe).toBe(true);
    // At exactly 75%, safeBunks = 0 -> WARNING
    expect(result.status).toBe("WARNING");
    expect(result.safeBunksRemaining).toBe(0);
  });

  it("Scenario 4: 20/30 + 10 missed -> 20/40 = 50.00%, change -16.67%", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 20,
      currentTotal: 30,
      minimumPercentage: 75,
      futureAttended: 0,
      futureMissed: 10,
    });

    expect(result.currentPercentage).toBe(66.67);
    expect(result.projectedAttended).toBe(20);
    expect(result.projectedTotal).toBe(40);
    expect(result.projectedPercentage).toBe(50.0);
    expect(result.percentageChange).toBe(-16.67);
    expect(result.isSafe).toBe(false);
    expect(result.status).toBe("CRITICAL");
  });

  it("Scenario 5: 100% attendance (10/10 + 5 attended -> 15/15 = 100%)", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 10,
      currentTotal: 10,
      minimumPercentage: 75,
      futureAttended: 5,
      futureMissed: 0,
    });

    expect(result.currentPercentage).toBe(100.0);
    expect(result.projectedPercentage).toBe(100.0);
    expect(result.percentageChange).toBe(0.0);
    expect(result.isSafe).toBe(true);
    expect(result.status).toBe("SAFE");
  });

  it("Scenario 6: 0 classes conducted yet (0/0 + 5 attended -> 5/5 = 100%)", () => {
    const result = simulateAttendanceScenario({
      currentAttended: 0,
      currentTotal: 0,
      minimumPercentage: 75,
      futureAttended: 5,
      futureMissed: 0,
    });

    expect(result.currentPercentage).toBe(100.0);
    expect(result.projectedPercentage).toBe(100.0);
    expect(result.isSafe).toBe(true);
  });

  it("Scenario 7: invalid values throw validation errors", () => {
    // attended > total
    expect(() =>
      simulateAttendanceScenario({
        currentAttended: 35,
        currentTotal: 30,
        futureAttended: 0,
        futureMissed: 0,
      })
    ).toThrow();

    // negative values
    expect(() =>
      simulateAttendanceScenario({
        currentAttended: -1,
        currentTotal: 30,
        futureAttended: 5,
        futureMissed: 0,
      })
    ).toThrow();

    // invalid minimumPercentage > 100
    expect(() =>
      simulateAttendanceScenario({
        currentAttended: 20,
        currentTotal: 30,
        minimumPercentage: 110,
        futureAttended: 5,
        futureMissed: 0,
      })
    ).toThrow();
  });

  it("generateFutureTrajectory produces step-by-step chart points", () => {
    const points = generateFutureTrajectory({
      currentAttended: 24,
      currentTotal: 30,
      minimumPercentage: 75,
      futureAttended: 3,
      futureMissed: 2,
    });

    expect(points.length).toBe(6); // Step 0 (Now) + 5 future steps
    expect(points[0].label).toBe("Now");
    expect(points[0].percentage).toBe(80.0);
    expect(points[5].label).toBe("+5");
    expect(points[5].percentage).toBe(77.14); // 27/35 = 77.14%
  });
});