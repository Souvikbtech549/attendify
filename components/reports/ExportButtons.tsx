"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { type AttendanceReportData } from "@/lib/reports/actions";
import { Button } from "@/components/ui/button";

export function ExportButtons({ report }: { report: AttendanceReportData }) {
  const semesterSlug = report.semesterName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  const handleExportCsv = () => {
    const headers = [
      "Student Name", "Semester", "Subject", "Subject Code", "Teacher",
      "Total Classes", "Attended", "Absent", "Attendance %", "Minimum %",
      "Status", "Safe Bunks", "Recovery Needed"
    ];

    const rows = report.items.map((item) => [
      `"${report.studentName}"`,
      `"${report.semesterName}"`,
      `"${item.subjectName}"`,
      `"${item.subjectCode || "N/A"}"`,
      `"${item.teacher || "N/A"}"`,
      item.totalClasses,
      item.attended,
      item.absent,
      `"${item.percentage.toFixed(1)}%"`,
      `"${item.minimumRequired}%"`,
      `"${item.status}"`,
      item.safeBunks,
      item.recoveryNeeded,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance-report-${semesterSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCsv}
        className="gap-1.5 text-xs h-9"
      >
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
      </Button>
      <Button
        size="sm"
        onClick={handleExportPdf}
        className="gap-1.5 text-xs h-9 shadow-sm"
      >
        <Printer className="h-4 w-4" /> Print / Save PDF
      </Button>
    </div>
  );
}