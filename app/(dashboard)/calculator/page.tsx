import type { Metadata } from "next";
import { AttendanceCalculator } from "@/components/calculator/AttendanceCalculator";

export const metadata: Metadata = {
  title: "Attendance & Bunk Calculator",
  description: "Calculate safe bunks, recovery classes, and live attendance standing.",
};

export default function CalculatorPage() {
  return <AttendanceCalculator />;
}