"use server";

import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import { type AttendanceHistoryItem } from "@/lib/attendance/actions";
import { calculateFullAttendanceMetrics } from "@/lib/calculations/attendance";
import { DEMO_SUBJECTS, DEMO_HISTORY, DEMO_TIMETABLE } from "@/lib/demo/demo-data";

export interface TodayClassItem {
  id: string; // timetable entry ID
  subject_id: string;
  subject_name: string;
  subject_code: string | null;
  teacher: string | null;
  room: string | null;
  color: string;
  day_of_week: number;
  start_time: string; // e.g. "09:00:00"
  end_time: string;   // e.g. "10:30:00"
  attendance_status: "present" | "absent" | null;
}

export interface DashboardData {
  hasSemesters: boolean;
  activeSemesterName: string | null;
  minimumRequired: number;
  overallAttendancePercentage: number;
  totalAttended: number;
  totalConducted: number;
  totalSafeBunks: number;
  atRiskSubjectsCount: number;
  subjects: SubjectWithStats[];
  atRiskSubjects: SubjectWithStats[];
  recentAttendance: AttendanceHistoryItem[];
  todayClasses: TodayClassItem[];
  todayDateStr: string;
  todayDayOfWeek: number;
}

export async function getDashboardData(): Promise<{ data: DashboardData | null; error?: string }> {
  try {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const todayDateStr = format(today, "yyyy-MM-dd");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      let totalAttended = 0;
      let totalConducted = 0;
      let totalSafeBunks = 0;
      const atRiskSubjects: SubjectWithStats[] = [];

      DEMO_SUBJECTS.forEach((sub) => {
        totalAttended += sub.attended_classes;
        totalConducted += sub.total_classes;
        const metrics = calculateFullAttendanceMetrics({
          attended: sub.attended_classes,
          total: sub.total_classes,
          minimumPercentage: sub.minimum_attendance,
        });
        totalSafeBunks += metrics.safeBunks;
        if (!metrics.isSafe) atRiskSubjects.push(sub);
      });

      const overall = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;

      // Filter demo timetable for today
      const todaySlots = DEMO_TIMETABLE.filter((t) => t.day_of_week === todayDayOfWeek);
      // If weekend or empty in demo, fallback to slots from day 1/2 so student can immediately test
      const activeSlots = todaySlots.length > 0 ? todaySlots : DEMO_TIMETABLE.slice(0, 3);

      const todayClasses: TodayClassItem[] = activeSlots
        .map((t) => {
          const log = DEMO_HISTORY.find((h) => h.subjects.id === t.subject_id && h.date === todayDateStr);
          return {
            id: t.id,
            subject_id: t.subject_id,
            subject_name: t.subjects.name,
            subject_code: t.subjects.code,
            teacher: t.subjects.teacher || null,
            room: t.room,
            color: t.subjects.color,
            day_of_week: t.day_of_week,
            start_time: t.start_time,
            end_time: t.end_time,
            attendance_status: log ? log.status : null,
          };
        })
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      return {
        data: {
          hasSemesters: true,
          activeSemesterName: "Spring 2026",
          minimumRequired: 75,
          overallAttendancePercentage: overall,
          totalAttended,
          totalConducted,
          totalSafeBunks,
          atRiskSubjectsCount: atRiskSubjects.length,
          subjects: DEMO_SUBJECTS,
          atRiskSubjects,
          recentAttendance: DEMO_HISTORY,
          todayClasses,
          todayDateStr,
          todayDayOfWeek,
        },
      };
    }

    const { data: activeSem } = await supabase
      .from("semesters")
      .select("id, name, target_attendance")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    const { count: semesterCount } = await supabase
      .from("semesters")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!semesterCount || semesterCount === 0) {
      return {
        data: {
          hasSemesters: false,
          activeSemesterName: null,
          minimumRequired: 75,
          overallAttendancePercentage: 0,
          totalAttended: 0,
          totalConducted: 0,
          totalSafeBunks: 0,
          atRiskSubjectsCount: 0,
          subjects: [],
          atRiskSubjects: [],
          recentAttendance: [],
          todayClasses: [],
          todayDateStr,
          todayDayOfWeek,
        },
      };
    }

    let subjectsQuery = supabase
      .from("subjects")
      .select("*, semesters(name, academic_year, is_active)")
      .eq("user_id", user.id)
      .eq("archived", false);

    if ((activeSem as any)?.id) {
      subjectsQuery = subjectsQuery.eq("semester_id", (activeSem as any).id);
    }

    const { data: rawSubjects } = await subjectsQuery;
    const subjectIds = (rawSubjects || []).map((s: any) => s.id);

    let attendanceRecords: { subject_id: string; status: string }[] = [];
    if (subjectIds.length > 0) {
      const { data: recs } = await supabase
        .from("attendance_records")
        .select("subject_id, status")
        .in("subject_id", subjectIds)
        .eq("user_id", user.id);

      attendanceRecords = recs || [];
    }

    const countsMap = new Map<string, { total: number; attended: number }>();
    attendanceRecords.forEach((r: any) => {
      const curr = countsMap.get(r.subject_id) || { total: 0, attended: 0 };
      curr.total += 1;
      if (r.status === "present") curr.attended += 1;
      countsMap.set(r.subject_id, curr);
    });

    let totalAttended = 0;
    let totalConducted = 0;
    let totalSafeBunks = 0;
    const atRiskSubjects: SubjectWithStats[] = [];

    const computedSubjects: SubjectWithStats[] = (rawSubjects || []).map((sub: any) => {
      const counts = countsMap.get(sub.id) || { total: 0, attended: 0 };
      totalAttended += counts.attended;
      totalConducted += counts.total;

      const metrics = calculateFullAttendanceMetrics({
        attended: counts.attended,
        total: counts.total,
        minimumPercentage: sub.minimum_attendance,
      });

      totalSafeBunks += metrics.safeBunks;

      const subjectWithStats: SubjectWithStats = {
        ...sub,
        total_classes: counts.total,
        attended_classes: counts.attended,
      };

      if (!metrics.isSafe && counts.total > 0) {
        atRiskSubjects.push(subjectWithStats);
      }

      return subjectWithStats;
    });

    const { data: recentLogs } = await supabase
      .from("attendance_records")
      .select("id, date, status, notes, created_at, subjects(id, name, code, color)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    // Fetch timetable entries for today
    const { data: timetableSlots } = await supabase
      .from("timetable")
      .select("id, subject_id, day_of_week, start_time, end_time, room, subjects(id, name, code, color, teacher)")
      .eq("user_id", user.id)
      .eq("day_of_week", todayDayOfWeek)
      .order("start_time", { ascending: true });

    // Fetch today's attendance logs
    const { data: todayLogs } = await supabase
      .from("attendance_records")
      .select("subject_id, status")
      .eq("user_id", user.id)
      .eq("date", todayDateStr);

    const todayLogMap = new Map<string, "present" | "absent">();
    (todayLogs || []).forEach((l: any) => {
      todayLogMap.set(l.subject_id, l.status);
    });

    const todayClasses: TodayClassItem[] = (timetableSlots || []).map((slot: any) => ({
      id: slot.id,
      subject_id: slot.subject_id,
      subject_name: slot.subjects?.name || "Subject",
      subject_code: slot.subjects?.code || null,
      teacher: slot.subjects?.teacher || null,
      room: slot.room || null,
      color: slot.subjects?.color || "#3b82f6",
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      attendance_status: todayLogMap.get(slot.subject_id) || null,
    }));

    const overallPercentage =
      totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 100;

    return {
      data: {
        hasSemesters: true,
        activeSemesterName: (activeSem as any)?.name || "Current Term",
        minimumRequired: (activeSem as any)?.target_attendance || 75,
        overallAttendancePercentage: overallPercentage,
        totalAttended,
        totalConducted,
        totalSafeBunks,
        atRiskSubjectsCount: atRiskSubjects.length,
        subjects: computedSubjects,
        atRiskSubjects,
        recentAttendance: (recentLogs as any) || [],
        todayClasses,
        todayDateStr,
        todayDayOfWeek,
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to load dashboard data." };
  }
}