import { getSubjects } from "@/lib/subjects/actions";
import { getRecentAttendance } from "@/lib/attendance/actions";
import { AttendanceLogger } from "@/components/attendance/AttendanceLogger";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [subjectsRes, historyRes] = await Promise.all([
    getSubjects(),
    getRecentAttendance(15),
  ]);

  return (
    <AttendanceLogger
      subjects={subjectsRes.data || []}
      initialHistory={historyRes.data || []}
    />
  );
}