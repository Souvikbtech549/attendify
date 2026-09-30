import { describe, it, expect } from "vitest";
import {
  getWarningSeverity,
  getWarningMessage,
  getAttendanceWarning,
  sortAttendanceWarnings,
  type AttendanceWarning,
} from "../attendanceWarnings";

describe("Smart Attendance Warning Engine", () => {
  describe("getWarningSeverity", () => {
    it("should return SAFE when 100% attended (10/10, min 75%)", () => {
      const severity = getWarningSeverity({ attended: 10, total: 10, minimumPercentage: 75 });
      expect(severity).toBe("SAFE");
    });

    it("should return SAFE when 90% attended (9/10, min 75%) with multiple bunks", () => {
      const severity = getWarningSeverity({ attended: 9, total: 10, minimumPercentage: 75 });
      expect(severity).toBe("SAFE");
    });

    it("should return SAFE when 80% attended (24/30, min 75%) with 2 safe bunks", () => {
      // 24 / 30 = 80%. maxTotal = Math.floor(2400/75) = 32. safeBunks = 32 - 30 = 2.
      const severity = getWarningSeverity({ attended: 24, total: 30, minimumPercentage: 75 });
      expect(severity).toBe("SAFE");
    });

    it("should return WARNING when exactly at 75% boundary (3/4, min 75%) with 0 safe bunks", () => {
      // 3/4 = 75%. maxTotal = Math.floor(300/75) = 4. safeBunks = 4 - 4 = 0.
      const severity = getWarningSeverity({ attended: 3, total: 4, minimumPercentage: 75 });
      expect(severity).toBe("WARNING");
    });

    it("should return WARNING when safe bunk = 1 (19/24, min 75%)", () => {
      // 19/24 = 79.17%. maxTotal = Math.floor(1900/75) = 25. safeBunks = 25 - 24 = 1.
      const severity = getWarningSeverity({ attended: 19, total: 24, minimumPercentage: 75 });
      expect(severity).toBe("WARNING");
    });

    it("should return CRITICAL when at 74% (37/50, min 75%)", () => {
      const severity = getWarningSeverity({ attended: 37, total: 50, minimumPercentage: 75 });
      expect(severity).toBe("CRITICAL");
    });

    it("should return CRITICAL when at 70% (7/10, min 75%)", () => {
      const severity = getWarningSeverity({ attended: 7, total: 10, minimumPercentage: 75 });
      expect(severity).toBe("CRITICAL");
    });

    it("should return CRITICAL when at 50% (5/10, min 75%)", () => {
      const severity = getWarningSeverity({ attended: 5, total: 10, minimumPercentage: 75 });
      expect(severity).toBe("CRITICAL");
    });

    it("should evaluate different minimum thresholds correctly (80% and 85%)", () => {
      // 80% threshold: 8/10 = 80% (0 bunks) -> WARNING
      expect(getWarningSeverity({ attended: 8, total: 10, minimumPercentage: 80 })).toBe("WARNING");
      // 80% threshold: 7/10 = 70% -> CRITICAL
      expect(getWarningSeverity({ attended: 7, total: 10, minimumPercentage: 80 })).toBe("CRITICAL");
      // 85% threshold: 8/10 = 80% -> CRITICAL
      expect(getWarningSeverity({ attended: 8, total: 10, minimumPercentage: 85 })).toBe("CRITICAL");
      // 85% threshold: 9/10 = 90% (0 bunks) -> WARNING
      expect(getWarningSeverity({ attended: 9, total: 10, minimumPercentage: 85 })).toBe("WARNING");
      // 85% threshold: 19/20 = 95% (2 bunks) -> SAFE
      expect(getWarningSeverity({ attended: 19, total: 20, minimumPercentage: 85 })).toBe("SAFE");
    });

    it("should return SAFE when total classes is 0", () => {
      expect(getWarningSeverity({ attended: 0, total: 0, minimumPercentage: 75 })).toBe("SAFE");
    });
  });

  describe("getWarningMessage", () => {
    it("should generate meaningful CRITICAL message with recovery count", () => {
      const msg = getWarningMessage({
        subjectName: "Computer Networks",
        attended: 21,
        total: 30,
        minimumPercentage: 75,
      });
      // 21/30 = 70%. Recovery needed: ceil((75*30 - 2100)/25) = ceil(150/25) = 6.
      expect(msg).toContain("Computer Networks");
      expect(70.0).toBe(70);
      expect(msg).toContain("70.0%");
      expect(msg).toContain("6 consecutive classes");
    });

    it("should generate single class recovery message when recovery is 1", () => {
      // 14/19 = 73.68%. Recovery: ceil((75*19 - 1400)/25) = ceil(25/25) = 1.
      const msg = getWarningMessage({
        subjectName: "Operating Systems",
        attended: 14,
        total: 19,
        minimumPercentage: 75,
      });
      expect(msg).toContain("attend the next class to recover");
    });

    it("should generate 0 safe bunks warning message", () => {
      const msg = getWarningMessage({
        subjectName: "Data Structures",
        attended: 3,
        total: 4,
        minimumPercentage: 75,
      });
      expect(msg).toContain("0 safe bunks remaining in Data Structures");
    });

    it("should generate 1 safe bunk warning message", () => {
      const msg = getWarningMessage({
        subjectName: "Algorithms",
        attended: 19,
        total: 24,
        minimumPercentage: 75,
      });
      expect(msg).toContain("only have 1 safe bunk remaining in Algorithms");
    });

    it("should generate safe standing message with bunk count", () => {
      const msg = getWarningMessage({
        subjectName: "Software Engineering",
        attended: 19,
        total: 20,
        minimumPercentage: 80,
      });
      expect(msg).toContain("safely above the minimum requirement");
      expect(msg).toContain("3 safe leaves");
    });
  });

  describe("getAttendanceWarning and sorting", () => {
    it("should generate complete warning object with accessible badge text", () => {
      const warning = getAttendanceWarning({
        subjectName: "DBMS",
        subjectCode: "CS302",
        attended: 24,
        total: 28,
        minimumPercentage: 75,
      });

      expect(warning.severity).toBe("SAFE");
      expect(warning.badgeVariant).toBe("safe");
      expect(warning.safeBunks).toBe(4);
      expect(warning.recoveryClasses).toBe(0);
      expect(warning.actionAdvice).toContain("safely miss up to 4 classes");
    });

    it("should sort warnings by Critical -> Warning -> Safe, and by percentage ascending", () => {
      const w1 = getAttendanceWarning({ subjectName: "Course Safe High", attended: 30, total: 30, minimumPercentage: 75 }); // 100%, Safe
      const w2 = getAttendanceWarning({ subjectName: "Course Critical Low", attended: 10, total: 20, minimumPercentage: 75 }); // 50%, Critical
      const w3 = getAttendanceWarning({ subjectName: "Course Warning 1", attended: 3, total: 4, minimumPercentage: 75 }); // 75%, Warning
      const w4 = getAttendanceWarning({ subjectName: "Course Critical Med", attended: 14, total: 20, minimumPercentage: 75 }); // 70%, Critical

      const sorted = sortAttendanceWarnings([w1, w2, w3, w4]);

      expect(sorted[0].subjectName).toBe("Course Critical Low"); // 50% Critical
      expect(sorted[1].subjectName).toBe("Course Critical Med"); // 70% Critical
      expect(sorted[2].subjectName).toBe("Course Warning 1");    // 75% Warning
      expect(sorted[3].subjectName).toBe("Course Safe High");    // 100% Safe
    });
  });
});