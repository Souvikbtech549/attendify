import { getAttendanceReport } from "@/lib/reports/actions";
import { getSemesters } from "@/lib/semesters/actions";
import { ReportContainer } from "@/components/reports/ReportContainer";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [reportRes, semestersRes] = await Promise.all([
    getAttendanceReport(),
    getSemesters(),
  ]);

  return (
    <ReportContainer
      initialReport={reportRes.data}
      semesters={semestersRes.data || []}
    />
  );
}