"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";
import { type AnalyticsData, getAnalyticsData } from "@/lib/analytics/actions";
import { type SemesterRecord } from "@/lib/semesters/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

const AttendanceBySubject = dynamic(
  () => import("@/components/analytics/AttendanceBySubject").then((m) => m.AttendanceBySubject),
  { ssr: false, loading: () => <Skeleton className="h-[380px] w-full rounded-2xl" /> }
);

const AttendanceTrend = dynamic(
  () => import("@/components/analytics/AttendanceTrend").then((m) => m.AttendanceTrend),
  { ssr: false, loading: () => <Skeleton className="h-[360px] w-full rounded-2xl" /> }
);

const AttendanceDistribution = dynamic(
  () => import("@/components/analytics/AttendanceDistribution").then((m) => m.AttendanceDistribution),
  { ssr: false, loading: () => <Skeleton className="h-[340px] w-full rounded-2xl" /> }
);

const RiskChart = dynamic(
  () => import("@/components/analytics/RiskChart").then((m) => m.RiskChart),
  { ssr: false, loading: () => <Skeleton className="h-[340px] w-full rounded-2xl" /> }
);

export function AnalyticsContainer({
  initialData,
  semesters,
}: {
  initialData: AnalyticsData | null;
  semesters: SemesterRecord[];
}) {
  const [data, setData] = React.useState<AnalyticsData | null>(initialData);
  const activeSemesterId = semesters.find((s) => s.is_active)?.id || semesters[0]?.id || "";
  const [selectedSemester, setSelectedSemester] = React.useState<string>(activeSemesterId);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSemesterChange = React.useCallback(async (semId: string) => {
    setSelectedSemester(semId);
    setIsLoading(true);
    const res = await getAnalyticsData(semId);
    if (res.data) setData(res.data);
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Visual Trends</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deep academic breakdown of attendance trajectories, subject comparisons, and risk metrics.
          </p>
        </div>

        {semesters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} {sem.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingState text="Compiling chart metrics..." />
      ) : !data || !data.hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No Attendance Data Available"
          description="Log daily class attendance to view visual trend charts, distribution graphs, and performance breakdowns."
          actionLabel="Log Attendance"
          onAction={() => (window.location.href = "/attendance")}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttendanceBySubject data={data.subjectBarData} />
            <AttendanceDistribution data={data.presentVsAbsentData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttendanceTrend data={data.trendLineData} />
            <RiskChart data={data.riskDistributionData} />
          </div>
        </div>
      )}
    </div>
  );
}