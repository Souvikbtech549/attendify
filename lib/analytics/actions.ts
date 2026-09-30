"use server";

import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SUBJECTS, DEMO_HISTORY } from "@/lib/demo/demo-data";

export interface SubjectChartItem {
  name: string;
  code: string | null;
  percentage: number;
  attended: number;
  total: number;
  minimum: number;
  color: string;
}

export interface TrendChartItem {
  date: string;
  formattedDate: string;
  percentage: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  subjectBarData: SubjectChartItem[];
  trendLineData: TrendChartItem[];
  presentVsAbsentData: DistributionItem[];
  riskDistributionData: DistributionItem[];
  overallPercentage: number;
  totalAttended: number;
  totalAbsent: number;
  totalConducted: number;
  hasData: boolean;
}

function getAttendanceMetrics(attended: number, total: number, minimum: number) {
  const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;
  const isSafe = percentage >= minimum;
  const tier = isSafe ? "safe" : percentage >= minimum - 10 ? "warning" : "critical";
  return { percentage, isSafe, tier };
}

export async function getAnalyticsData(semesterId?: string): Promise<{ data: AnalyticsData | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      let totalAttended = 0;
      let totalConducted = 0;
      let safeCount = 0;
      let warningCount = 0;
      let criticalCount = 0;

      const subjectBarData: SubjectChartItem[] = DEMO_SUBJECTS.map((sub) => {
        totalAttended += sub.attended_classes;
        totalConducted += sub.total_classes;
        const pct = sub.total_classes > 0 ? Number(((sub.attended_classes / sub.total_classes) * 100).toFixed(1)) : 100;
        const metrics = getAttendanceMetrics(sub.attended_classes, sub.total_classes, sub.minimum_attendance);
        if (metrics.tier === "safe") safeCount++;
        else if (metrics.tier === "warning") warningCount++;
        else criticalCount++;

        return {
          name: sub.name,
          code: sub.code,
          percentage: pct,
          attended: sub.attended_classes,
          total: sub.total_classes,
          minimum: sub.minimum_attendance,
          color: sub.color,
        };
      });

      const totalAbsent = Math.max(0, totalConducted - totalAttended);

      const trendLineData: TrendChartItem[] = [
        { date: "2026-02-01", formattedDate: "Feb 01", percentage: 100 },
        { date: "2026-02-10", formattedDate: "Feb 10", percentage: 92.5 },
        { date: "2026-02-20", formattedDate: "Feb 20", percentage: 86.4 },
        { date: "2026-03-01", formattedDate: "Mar 01", percentage: 82.1 },
        { date: "2026-03-10", formattedDate: "Mar 10", percentage: 84.8 },
      ];

      return {
        data: {
          subjectBarData,
          trendLineData,
          presentVsAbsentData: [
            { name: "Attended", value: totalAttended, color: "#10b981" },
            { name: "Missed / Absent", value: totalAbsent, color: "#ef4444" },
          ],
          riskDistributionData: [
            { name: "Safe Tier", value: safeCount, color: "#10b981" },
            { name: "Warning Tier", value: warningCount, color: "#f59e0b" },
            { name: "Critical Tier", value: criticalCount, color: "#ef4444" },
          ],
          overallPercentage: totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 100,
          totalAttended,
          totalAbsent,
          totalConducted,
          hasData: true,
        },
      };
    }

    let targetSemesterId = semesterId;
    if (!targetSemesterId) {
      const { data: activeSem } = await supabase
        .from("semesters")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      targetSemesterId = (activeSem as any)?.id;
    }

    let subjectsQuery = supabase
      .from("subjects")
      .select("id, name, code, color, minimum_attendance")
      .eq("user_id", user.id)
      .eq("archived", false);

    if (targetSemesterId) {
      subjectsQuery = subjectsQuery.eq("semester_id", targetSemesterId);
    }

    const { data: subjects, error: subError } = await subjectsQuery;
    if (subError || !subjects) return { data: null, error: subError?.message || "Failed to fetch subjects." };

    const subjectIds = (subjects as any[]).map((s: any) => s.id);
    if (subjectIds.length === 0) {
      return {
        data: {
          subjectBarData: [],
          trendLineData: [],
          presentVsAbsentData: [],
          riskDistributionData: [],
          overallPercentage: 100,
          totalAttended: 0,
          totalAbsent: 0,
          totalConducted: 0,
          hasData: false,
        },
      };
    }

    const { data: records, error: recError } = await supabase
      .from("attendance_records")
      .select("id, subject_id, date, status")
      .in("subject_id", subjectIds)
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (recError || !records) return { data: null, error: recError?.message || "Failed to fetch logs." };

    const subjectMap = new Map<string, { attended: number; total: number }>();
    let totalAttended = 0;
    let totalAbsent = 0;

    (records as any[]).forEach((r: any) => {
      const current = subjectMap.get(r.subject_id) || { attended: 0, total: 0 };
      current.total += 1;
      if (r.status === "present") {
        current.attended += 1;
        totalAttended += 1;
      } else {
        totalAbsent += 1;
      }
      subjectMap.set(r.subject_id, current);
    });

    let safeCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    const subjectBarData: SubjectChartItem[] = (subjects as any[]).map((sub: any) => {
      const counts = subjectMap.get(sub.id) || { attended: 0, total: 0 };
      const pct = counts.total > 0 ? Number(((counts.attended / counts.total) * 100).toFixed(1)) : 100;

      const metrics = getAttendanceMetrics(counts.attended, counts.total, sub.minimum_attendance);
      if (metrics.tier === "safe") safeCount += 1;
      else if (metrics.tier === "warning") warningCount += 1;
      else criticalCount += 1;

      return {
        name: sub.name,
        code: sub.code,
        percentage: pct,
        attended: counts.attended,
        total: counts.total,
        minimum: sub.minimum_attendance,
        color: sub.color,
      };
    });

    const dateMap = new Map<string, { attended: number; total: number }>();
    (records as any[]).forEach((r: any) => {
      const current = dateMap.get(r.date) || { attended: 0, total: 0 };
      current.total += 1;
      if (r.status === "present") current.attended += 1;
      dateMap.set(r.date, current);
    });

    let rollingAttended = 0;
    let rollingTotal = 0;
    const trendLineData: TrendChartItem[] = Array.from(dateMap.entries()).map(([dateStr, dayCounts]) => {
      rollingAttended += dayCounts.attended;
      rollingTotal += dayCounts.total;
      const pct = Number(((rollingAttended / rollingTotal) * 100).toFixed(1));

      let formattedDate = dateStr;
      try {
        formattedDate = format(parseISO(dateStr), "MMM dd");
      } catch {
        formattedDate = dateStr;
      }

      return {
        date: dateStr,
        formattedDate,
        percentage: pct,
      };
    });

    const totalConducted = totalAttended + totalAbsent;
    const overallPercentage =
      totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 100;

    const presentVsAbsentData: DistributionItem[] = [
      { name: "Attended", value: totalAttended, color: "#10b981" },
      { name: "Missed / Absent", value: totalAbsent, color: "#ef4444" },
    ];

    const riskDistributionData: DistributionItem[] = [
      { name: "Safe Tier", value: safeCount, color: "#10b981" },
      { name: "Warning Tier", value: warningCount, color: "#f59e0b" },
      { name: "Critical Tier", value: criticalCount, color: "#ef4444" },
    ];

    return {
      data: {
        subjectBarData,
        trendLineData,
        presentVsAbsentData,
        riskDistributionData,
        overallPercentage,
        totalAttended,
        totalAbsent,
        totalConducted,
        hasData: totalConducted > 0 || subjects.length > 0,
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to compute analytics." };
  }
}