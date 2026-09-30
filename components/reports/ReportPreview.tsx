"use client";

import { type AttendanceReportData } from "@/lib/reports/actions";
import { Badge } from "@/components/ui/badge";

export function ReportPreview({ report }: { report: AttendanceReportData }) {
  return (
    <div className="rounded-xl border bg-card p-6 md:p-10 shadow-sm print:border-0 print:shadow-none print:p-0 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
              A
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground">Attendify</h3>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Official Student Attendance Summary Report
          </p>
        </div>

        <div className="text-left sm:text-right space-y-0.5 text-xs">
          <p className="font-semibold text-foreground">Issued: {report.generatedDate}</p>
          <p className="text-muted-foreground">Academic Term: {report.semesterName} ({report.academicYear})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Student Name</span>
          <span className="text-sm font-bold text-foreground">{report.studentName}</span>
          <p className="text-muted-foreground">{report.studentEmail}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Overall Standing</span>
          <span className="text-sm font-bold text-foreground">{report.overallPercentage.toFixed(1)}%</span>
          <p className="text-muted-foreground">{report.totalAttended} / {report.totalConducted} Classes Attended</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Compliance Status</span>
          <span className={`text-sm font-bold ${report.overallPercentage >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {report.overallPercentage >= 75 ? "Eligible for Examinations" : "Attendance Shortage Detected"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground uppercase tracking-wider text-[11px] font-bold">
              <th className="py-2.5 px-3">Subject / Course</th>
              <th className="py-2.5 px-3 text-center">Conducted</th>
              <th className="py-2.5 px-3 text-center">Attended</th>
              <th className="py-2.5 px-3 text-center">Absent</th>
              <th className="py-2.5 px-3 text-center">Current %</th>
              <th className="py-2.5 px-3 text-center">Goal %</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {report.items.map((item) => (
              <tr key={item.subjectName} className="hover:bg-muted/20">
                <td className="py-3 px-3">
                  <div className="font-semibold text-foreground">{item.subjectName}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.subjectCode && `${item.subjectCode} • `}
                    {item.teacher || "Instructor unassigned"}
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-medium">{item.totalClasses}</td>
                <td className="py-3 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{item.attended}</td>
                <td className="py-3 px-3 text-center font-semibold text-rose-600 dark:text-rose-400">{item.absent}</td>
                <td className="py-3 px-3 text-center font-bold text-foreground">{item.percentage.toFixed(1)}%</td>
                <td className="py-3 px-3 text-center text-muted-foreground">{item.minimumRequired}%</td>
                <td className="py-3 px-3 text-center">
                  <Badge variant={item.status === "Safe" ? "safe" : "critical"} className="text-[10px] py-0">
                    {item.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden print:grid grid-cols-2 pt-16 gap-12 text-xs border-t">
        <div className="border-t border-dashed pt-2">
          <p className="font-bold">Student Signature</p>
          <p className="text-muted-foreground text-[10px]">Date:</p>
        </div>
        <div className="border-t border-dashed pt-2">
          <p className="font-bold">Academic Advisor / Dean of Student Affairs</p>
          <p className="text-muted-foreground text-[10px]">Signature & Seal:</p>
        </div>
      </div>
    </div>
  );
}