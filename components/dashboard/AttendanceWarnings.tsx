"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Info,
  Layers,
} from "lucide-react";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import {
  getAttendanceWarning,
  sortAttendanceWarnings,
  type AttendanceWarning,
  type WarningSeverity,
} from "@/lib/calculations/attendanceWarnings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttendanceWarningsProps {
  subjects?: SubjectWithStats[];
  atRiskSubjects?: SubjectWithStats[]; // backward compatible prop
}

export function AttendanceWarnings({ subjects, atRiskSubjects }: AttendanceWarningsProps) {
  const [filter, setFilter] = React.useState<"all" | "critical" | "warning">("all");

  // Generate and sort all warnings
  const warnings: AttendanceWarning[] = React.useMemo(() => {
    const sourceSubjects = subjects && subjects.length > 0 ? subjects : atRiskSubjects || [];
    const raw = sourceSubjects.map((sub) =>
      getAttendanceWarning({
        subjectName: sub.name,
        subjectCode: sub.code,
        attended: sub.attended_classes,
        total: sub.total_classes,
        minimumPercentage: sub.minimum_attendance,
      })
    );
    return sortAttendanceWarnings(raw);
  }, [subjects, atRiskSubjects]);

  const criticalWarnings = warnings.filter((w) => w.severity === "CRITICAL");
  const warningWarnings = warnings.filter((w) => w.severity === "WARNING");
  const actionRequiredCount = criticalWarnings.length + warningWarnings.length;

  if (actionRequiredCount === 0) {
    return (
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-foreground">
              Attendance Health Optimal
            </h4>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              All enrolled courses meet minimum target requirements with safe leave buffers available.
            </p>
          </div>
        </div>
        <Badge variant="safe" className="shrink-0 text-[10px] py-0.5 px-2 font-semibold">
          100% Eligible
        </Badge>
      </div>
    );
  }

  const displayedWarnings = warnings.filter((w) => {
    if (filter === "critical") return w.severity === "CRITICAL";
    if (filter === "warning") return w.severity === "WARNING";
    return w.severity === "CRITICAL" || w.severity === "WARNING";
  });

  return (
    <Card className="border-rose-500/30 bg-card/90 backdrop-blur-xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon className="h-4 w-4 animate-pulse" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Smart Attendance Radar
            </CardTitle>
            <Badge
              variant={criticalWarnings.length > 0 ? "critical" : "warning"}
              className="text-[10px] py-0.5 px-2 font-semibold rounded-full"
            >
              {actionRequiredCount} {actionRequiredCount === 1 ? "Course Alert" : "Course Alerts"}
            </Badge>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/80 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                filter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Alerts ({actionRequiredCount})
            </button>
            {criticalWarnings.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("critical")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                  filter === "critical"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                )}
              >
                Critical ({criticalWarnings.length})
              </button>
            )}
            {warningWarnings.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("warning")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                  filter === "warning"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                Low Buffer ({warningWarnings.length})
              </button>
            )}
          </div>
        </div>

        <CardDescription className="text-xs text-muted-foreground">
          Proactive risk telemetry highlighting course shortages and immediate recovery actions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedWarnings.map((warn, index) => {
            const isCritical = warn.severity === "CRITICAL";

            return (
              <div
                key={warn.subjectName || `warn-${index}`}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3",
                  isCritical
                    ? "border-rose-500/30 bg-rose-500/[0.05] hover:border-rose-500/50"
                    : "border-amber-500/30 bg-amber-500/[0.05] hover:border-amber-500/50"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          isCritical ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                        )}
                      />
                      <span className="font-bold text-sm text-foreground truncate">
                        {warn.subjectName}
                      </span>
                      {warn.subjectCode && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {warn.subjectCode}
                        </span>
                      )}
                    </div>

                    <Badge
                      variant={isCritical ? "critical" : "warning"}
                      className="text-[10px] py-0 px-2 rounded-full font-semibold shrink-0"
                    >
                      {warn.badgeText}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {warn.message}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-[11px] font-semibold truncate",
                      isCritical ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    ⚡ {warn.actionAdvice}
                  </span>

                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold shrink-0 gap-1 rounded-lg">
                    <Link href="/calculator">
                      Simulate <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}