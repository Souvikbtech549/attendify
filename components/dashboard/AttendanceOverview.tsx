"use client";

import { CheckCircle2, ShieldAlert, Sparkles, Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AttendanceOverviewProps {
  overallPercentage: number;
  minimumRequired: number;
  totalAttended: number;
  totalConducted: number;
  activeSemesterName: string | null;
}

export function AttendanceOverview({
  overallPercentage,
  minimumRequired,
  totalAttended,
  totalConducted,
  activeSemesterName,
}: AttendanceOverviewProps) {
  const isSafe = overallPercentage >= minimumRequired;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, overallPercentage) / 100) * circumference;

  return (
    <Card className="col-span-1 lg:col-span-2 relative overflow-hidden group">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-lg font-bold text-foreground">
              {activeSemesterName || "Current Semester"} Health Index
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">Real-time aggregate telemetry across all enrolled courses</CardDescription>
        </div>

        <Badge variant={isSafe ? "safe" : "critical"}>
          {isSafe ? "Optimal Standing" : "Shortage Warning"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-5">
            {/* Circular Radial Meter */}
            <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="transition-all duration-1000 ease-out"
                  stroke={isSafe ? "#06b6d4" : "#f43f5e"}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                  {overallPercentage.toFixed(0)}%
                </span>
                <span className="font-mono text-[9px] uppercase text-muted-foreground font-bold">Standing</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Total Attendance Metric
              </span>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {overallPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{totalAttended}</strong> attended of <strong className="text-foreground">{totalConducted}</strong> conducted sessions
              </p>
            </div>
          </div>

          <div className="space-y-2 sm:max-w-xs w-full">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Goal Target</span>
              <span className="font-bold text-cyan-400">{minimumRequired}%</span>
            </div>
            <Progress value={Math.min(100, overallPercentage)} className="h-2.5" />
            <p className="text-[11px] text-muted-foreground italic">
              {isSafe
                ? "You are comfortably above your minimum target attendance."
                : "Immediate attendance recovery needed to avoid examination bar."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
            <span className="font-mono text-[9px] text-muted-foreground uppercase font-bold block">Target Cutoff</span>
            <span className="font-mono text-base font-bold text-foreground">{minimumRequired}%</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
            <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold block">Attended</span>
            <span className="font-mono text-base font-bold text-emerald-400">{totalAttended} Classes</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-1">
            <span className="font-mono text-[9px] text-rose-400 uppercase font-bold block">Missed</span>
            <span className="font-mono text-base font-bold text-rose-400">{Math.max(0, totalConducted - totalAttended)} Classes</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 space-y-1">
            <span className="font-mono text-[9px] text-cyan-400 uppercase font-bold block">Total Sessions</span>
            <span className="font-mono text-base font-bold text-cyan-400">{totalConducted} Sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}