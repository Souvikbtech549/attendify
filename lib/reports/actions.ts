"use server";

import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { calculateFullAttendanceMetrics } from "@/lib/calculations/attendance";
import { DEMO_SUBJECTS } from "@/lib/demo/demo-data";

export interface ReportItem {
  subjectName: string;
  subjectCode: string | null;
  teacher: string | null;
  totalClasses: number;
  attended: number;
  absent: number;
  percentage: number;
  minimumRequired: number;
  status: "Safe" | "Critical";
  safeBunks: number;
  recoveryNeeded: number;
}

export interface AttendanceReportData {
  generatedDate: string;
  studentName: string;
  studentEmail: string;
  semesterName: string;
  academicYear: string;
  overallPercentage: number;
  totalAttended: number;
  totalConducted: number;
  items: ReportItem[];
}

export async function getAttendanceReport(semesterId?: string): Promise<{ data: AttendanceReportData | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      let totalAttended = 0;
      let totalConducted = 0;

      const items: ReportItem[] = DEMO_SUBJECTS.map((sub) => {
        totalAttended += sub.attended_classes;
        totalConducted += sub.total_classes;
        const metrics = calculateFullAttendanceMetrics({
          attended: sub.attended_classes,
          total: sub.total_classes,
          minimumPercentage: sub.minimum_attendance,
        });

        return {
          subjectName: sub.name,
          subjectCode: sub.code,
          teacher: sub.teacher,
          totalClasses: sub.total_classes,
          attended: sub.attended_classes,
          absent: Math.max(0, sub.total_classes - sub.attended_classes),
          percentage: metrics.percentage,
          minimumRequired: sub.minimum_attendance,
          status: metrics.isSafe ? "Safe" : "Critical",
          safeBunks: metrics.safeBunks,
          recoveryNeeded: metrics.recoveryClasses === Infinity ? 0 : metrics.recoveryClasses,
        };
      });

      return {
        data: {
          generatedDate: format(new Date(), "MMMM dd, yyyy"),
          studentName: "Souvik",
          studentEmail: "uniquesigmascholar@gmail.com",
          semesterName: "Spring 2026",
          academicYear: "2025-2026",
          overallPercentage: totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100,
          totalAttended,
          totalConducted,
          items,
        },
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    let semQuery = supabase.from("semesters").select("id, name, academic_year").eq("user_id", user.id);
    if (semesterId) {
      semQuery = semQuery.eq("id", semesterId);
    } else {
      semQuery = semQuery.eq("is_active", true);
    }

    const { data: semester } = await semQuery.maybeSingle();
    if (!semester) return { data: null, error: "Semester not found." };

    const { data: subjects } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id)
      .eq("semester_id", semester.id)
      .order("name");

    const subjectIds = (subjects || []).map((s: any) => s.id);

    const { data: records } = await supabase
      .from("attendance_records")
      .select("subject_id, status")
      .in("subject_id", subjectIds)
      .eq("user_id", user.id);

    const countsMap = new Map<string, { total: number; attended: number }>();
    let totalConducted = 0;
    let totalAttended = 0;

    (records || []).forEach((r: any) => {
      const curr = countsMap.get(r.subject_id) || { total: 0, attended: 0 };
      curr.total += 1;
      totalConducted += 1;
      if (r.status === "present") {
        curr.attended += 1;
        totalAttended += 1;
      }
      countsMap.set(r.subject_id, curr);
    });

    const items: ReportItem[] = (subjects || []).map((sub: any) => {
      const counts = countsMap.get(sub.id) || { total: 0, attended: 0 };
      const metrics = calculateFullAttendanceMetrics({
        attended: counts.attended,
        total: counts.total,
        minimumPercentage: sub.minimum_attendance,
      });

      return {
        subjectName: sub.name,
        subjectCode: sub.code,
        teacher: sub.teacher,
        totalClasses: counts.total,
        attended: counts.attended,
        absent: Math.max(0, counts.total - counts.attended),
        percentage: metrics.percentage,
        minimumRequired: sub.minimum_attendance,
        status: metrics.isSafe ? "Safe" : "Critical",
        safeBunks: metrics.safeBunks,
        recoveryNeeded: metrics.recoveryClasses === Infinity ? 0 : metrics.recoveryClasses,
      };
    });

    const overallPercentage =
      totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 100;

    return {
      data: {
        generatedDate: format(new Date(), "MMMM dd, yyyy"),
        studentName: (profile as any)?.full_name || user.email || "Student",
        studentEmail: (profile as any)?.email || user.email || "",
        semesterName: semester.name,
        academicYear: semester.academic_year,
        overallPercentage,
        totalAttended,
        totalConducted,
        items,
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to compile report." };
  }
}