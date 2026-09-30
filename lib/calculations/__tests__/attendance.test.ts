import { describe, it, expect } from "vitest";
import {
  calculateAttendancePercentage,
  calculateSafeBunks,
  calculateRecoveryClasses,
  getAttendanceStatus,
  calculateFullAttendanceMetrics,
} from "../attendance";

describe("Attendance Calculation Suite", () => {
  it("computes standard scenarios correctly", () => {
    // 24/30 at 75% -> 80%, safe, 2 bunks, 0 recovery
    const res1 = calculateFullAttendanceMetrics({ attended: 24, total: 30, minimumPercentage: 75 });
    expect(res1.percentage).toBe(80.0);
    expect(res1.isSafe).toBe(true);
    expect(res1.safeBunks).toBe(2);
    expect(res1.recoveryClasses).toBe(0);

    // 20/30 at 75% -> 66.67%, critical, 0 bunks, 10 recovery
    const res2 = calculateFullAttendanceMetrics({ attended: 20, total: 30, minimumPercentage: 75 });
    expect(res2.percentage).toBe(66.67);
    expect(res2.isSafe).toBe(false);
    expect(res2.safeBunks).toBe(0);
    expect(res2.recoveryClasses).toBe(10);

    // 25/30 at 75% -> 83.33%, safe, 3 bunks, 0 recovery
    const res3 = calculateFullAttendanceMetrics({ attended: 25, total: 30, minimumPercentage: 75 });
    expect(res3.percentage).toBe(83.33);
    expect(res3.isSafe).toBe(true);
    expect(res3.safeBunks).toBe(3);

    // 30/30 at 75% -> 100%, safe, 10 bunks, 0 recovery
    const res4 = calculateFullAttendanceMetrics({ attended: 30, total: 30, minimumPercentage: 75 });
    expect(res4.percentage).toBe(100.0);
    expect(res4.isSafe).toBe(true);
    expect(res4.safeBunks).toBe(10);
  });

  it("handles boundary zero and exact percentage cases", () => {
    // 0/0 -> safe, 0 bunks, 0 recovery
    const zero = calculateFullAttendanceMetrics({ attended: 0, total: 0, minimumPercentage: 75 });
    expect(zero.percentage).toBe(0.0);
    expect(zero.isSafe).toBe(true);
    expect(zero.safeBunks).toBe(0);
    expect(zero.recoveryClasses).toBe(0);

    // Exactly 75% (24/32) -> safe, 0 bunks, 0 recovery
    const exact = calculateFullAttendanceMetrics({ attended: 24, total: 32, minimumPercentage: 75 });
    expect(exact.percentage).toBe(75.0);
    expect(exact.isSafe).toBe(true);
    expect(exact.safeBunks).toBe(0);
    expect(exact.recoveryClasses).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => calculateAttendancePercentage(35, 30)).toThrow();
    expect(() => calculateAttendancePercentage(-1, 30)).toThrow();
    expect(() => calculateSafeBunks(20, 30, -5)).toThrow();
    expect(() => calculateRecoveryClasses(20, 30, 105)).toThrow();
  });
});
