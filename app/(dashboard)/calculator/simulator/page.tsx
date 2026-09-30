import type { Metadata } from "next";
import { getSubjects } from "@/lib/subjects/actions";
import { AttendanceSimulator } from "@/components/calculator/AttendanceSimulator";

export const metadata: Metadata = {
  title: "Attendance Goal Simulator",
  description: "Simulate future attendance scenarios and model trajectory outcomes.",
};

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const { data: subjects } = await getSubjects();
  return <AttendanceSimulator initialSubjects={subjects || []} />;
}