import { describe, it, expect } from "vitest";
import { calculateWeightedGpa, getGradePoints } from "../gpa";

describe("GPA Calculation Engine", () => {
  it("calculates 4.0 scale GPA correctly with multiple courses", () => {
    const items = [
      { credits: 4, grade: "A" },
      { credits: 3, grade: "B+" },
      { credits: 3, grade: "B" },
      { credits: 2, grade: "A-" },
    ];
    const res = calculateWeightedGpa(items, "4.0");
    expect(res.totalCredits).toBe(12);
    expect(res.gpa).toBe(3.52);
  });

  it("calculates 10.0 scale GPA correctly", () => {
    const items = [
      { credits: 4, grade: "O" },
      { credits: 4, grade: "A+" },
      { credits: 3, grade: "A" },
      { credits: 3, grade: "B+" },
    ];
    const res = calculateWeightedGpa(items, "10.0");
    expect(res.totalCredits).toBe(14);
    expect(res.gpa).toBe(8.64);
  });

  it("handles single course and empty items safely", () => {
    const single = calculateWeightedGpa([{ credits: 4, grade: "A" }], "4.0");
    expect(single.gpa).toBe(4.0);

    const empty = calculateWeightedGpa([], "4.0");
    expect(empty.gpa).toBe(0);
  });

  it("throws error for credits <= 0 or invalid grade", () => {
    expect(() => calculateWeightedGpa([{ credits: 0, grade: "A" }], "4.0")).toThrow();
    expect(() => calculateWeightedGpa([{ credits: 3, grade: "XYZ" }], "4.0")).toThrow();
  });
});
