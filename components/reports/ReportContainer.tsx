"use client";

import * as React from "react";
import { type AttendanceReportData, getAttendanceReport } from "@/lib/reports/actions";
import { type SemesterRecord } from "@/lib/semesters/actions";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { FileText } from "lucide-react";

export function ReportContainer({
  initialReport,
  semesters,
}: {
  initialReport: AttendanceReportData | null;
  semesters: SemesterRecord[];
}) {
  const [report, setReport] = React.useState<AttendanceReportData | null>(initialReport);
  const activeSemesterId = semesters.find((s) => s.is_active)?.id || semesters[0]?.id || "";
  const [selectedSemester, setSelectedSemester] = React.useState<string>(activeSemesterId);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSemesterChange = async (semId: string) => {
    setSelectedSemester(semId);
    setIsLoading(true);
    const res = await getAttendanceReport(semId);
    if (res.data) setReport(res.data);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Reports</h2>
          <p className="text-sm text-muted-foreground">
            Generate and export official attendance reports for semesters and examinations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {semesters.length > 0 && (
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          )}

          {report && <ExportButtons report={report} />}
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Compiling report data..." />
      ) : !report || report.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Report Data Available"
          description="Log daily attendance to generate verifiable official semester reports."
          actionLabel="Log Attendance"
          onAction={() => (window.location.href = "/attendance")}
        />
      ) : (
        <ReportPreview report={report} />
      )}
    </div>
  );
}