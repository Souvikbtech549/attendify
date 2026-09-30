"use client";

import Link from "next/link";
import {
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Zap,
  Flame,
  Radio,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet
} from "lucide-react";
import { type DashboardData } from "@/lib/dashboard/actions";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceOverview } from "@/components/dashboard/AttendanceOverview";
import { AttendanceWarnings } from "@/components/dashboard/AttendanceWarnings";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DashboardGrid({ data }: { data: DashboardData }) {
  if (!data.hasSemesters) {
    return (
      <EmptyState
        icon={Calendar}
        title="Welcome to Attendify!"
        description="To get started, create your first academic semester to manage courses and track attendance."
        actionLabel="Create First Semester"
        onAction={() => (window.location.href = "/semesters")}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Active Semester Telemetry
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {data.activeSemesterName || "Student Dashboard"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Live attendance analytics, safe-bunk buffer matrix, and today&apos;s schedule.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button asChild className="gap-2 text-xs font-semibold h-10 shadow-sm bg-primary text-primary-foreground rounded-xl">
              <Link href="/attendance">
                <CalendarCheck className="h-4 w-4" /> Quick Log Today
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 text-xs font-semibold h-10 rounded-xl border-border hover:bg-muted/80">
              <Link href="/calculator">
                <Zap className="h-4 w-4 text-primary" /> Simulator
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* TODAY'S SCHEDULE & 1-CLICK ATTENDANCE */}
      <TodayClasses
        classes={data.todayClasses || []}
        todayDateStr={data.todayDateStr}
        todayDayOfWeek={data.todayDayOfWeek}
      />

      {/* Top 4 Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Standing"
          value={`${data.overallAttendancePercentage.toFixed(1)}%`}
          description={`Target goal: ${data.minimumRequired}%`}
          icon={Award}
          variant={data.overallAttendancePercentage >= data.minimumRequired ? "cyan" : "critical"}
          trend={data.overallAttendancePercentage >= data.minimumRequired ? "Passing" : "Shortage"}
        />
        <StatsCard
          title="Safe Absences"
          value={`${data.totalSafeBunks} Classes`}
          description="Total allowable leaves remaining"
          icon={CheckCircle}
          variant="safe"
        />
        <StatsCard
          title="Courses at Risk"
          value={data.atRiskSubjectsCount}
          description={data.atRiskSubjectsCount > 0 ? "Requires urgent attention" : "All courses optimal"}
          icon={AlertTriangle}
          variant={data.atRiskSubjectsCount > 0 ? "critical" : "safe"}
        />
        <StatsCard
          title="Total Attended"
          value={`${data.totalAttended} / ${data.totalConducted}`}
          description="Lectures & labs logged"
          icon={Clock}
          variant="default"
        />
      </div>

      <AttendanceWarnings atRiskSubjects={data.atRiskSubjects} />

      {/* Health Overview & Quick Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceOverview
          overallPercentage={data.overallAttendancePercentage}
          minimumRequired={data.minimumRequired}
          totalAttended={data.totalAttended}
          totalConducted={data.totalConducted}
          activeSemesterName={data.activeSemesterName}
        />

        {/* Quick Launchpad Card */}
        <div className="col-span-1 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" /> Quick Actions
              </span>
              <span className="text-xs text-muted-foreground">Fast Access</span>
            </div>

            <div className="space-y-2">
              <Link href="/attendance" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted text-xs font-semibold transition-all group">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <span>Mark Daily Attendance</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </Link>

              <Link href="/calculator" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted text-xs font-semibold transition-all group">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Bunk & Recovery Simulator</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </Link>

              <Link href="/timetable" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted text-xs font-semibold transition-all group">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Weekly Timetable Schedule</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </Link>

              <Link href="/reports" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted text-xs font-semibold transition-all group">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span>Export PDF & CSV Report</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>Security: Row Level Policy</span>
            <span className="text-emerald-500 font-semibold">Protected</span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Enrolled Course Standing</h3>
          </div>
          <Link href="/subjects" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Manage All Subjects <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.subjects.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-2xl bg-card">
            No subjects added to this semester yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.subjects.map((sub) => (
              <SubjectCard
                key={sub.id}
                subject={sub}
                onEdit={() => (window.location.href = "/subjects")}
                onArchive={() => (window.location.href = "/subjects")}
                onDelete={() => (window.location.href = "/subjects")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Recent Activity Stream</h3>
        </div>
        <AttendanceHistory records={data.recentAttendance} />
      </div>
    </div>
  );
}