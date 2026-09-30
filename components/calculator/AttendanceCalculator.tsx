"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  calculateAttendancePercentage,
  calculateSafeBunks,
  calculateRecoveryClasses,
  getAttendanceStatus,
} from "@/lib/calculations/attendance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = React.useState<number>(30);
  const [attendedClasses, setAttendedClasses] = React.useState<number>(24);
  const [minimumRequired, setMinimumRequired] = React.useState<number>(75);

  let currentPercentage = 0;
  let safeBunks = 0;
  let recoveryNeeded = 0;
  let status: "safe" | "warning" | "critical" = "safe";
  let isValid = true;
  let errorMessage = "";

  try {
    if (attendedClasses > totalClasses) {
      isValid = false;
      errorMessage = "Attended classes cannot exceed total classes conducted.";
    } else if (totalClasses < 0 || attendedClasses < 0 || minimumRequired < 0 || minimumRequired > 100) {
      isValid = false;
      errorMessage = "Please enter non-negative numbers with minimum % between 0 and 100.";
    } else {
      currentPercentage = calculateAttendancePercentage(attendedClasses, totalClasses);
      safeBunks = calculateSafeBunks(attendedClasses, totalClasses, minimumRequired);
      recoveryNeeded = calculateRecoveryClasses(attendedClasses, totalClasses, minimumRequired);
      status = getAttendanceStatus(attendedClasses, totalClasses, minimumRequired);
    }
  } catch (err) {
    isValid = false;
    errorMessage = err instanceof Error ? err.message : "Calculation error";
  }

  const handleReset = () => {
    setTotalClasses(30);
    setAttendedClasses(24);
    setMinimumRequired(75);
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, currentPercentage) / 100) * circumference;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> High-Precision Predictive Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Safe Bunk & Recovery Calculator
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Calculate exact safe leaves remaining or consecutive recovery classes needed to reach your target.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild className="gap-2 text-xs font-semibold h-10 shadow-sm bg-primary text-primary-foreground rounded-xl">
              <Link href="/calculator/simulator">
                <TrendingUp className="h-4 w-4" /> Goal Simulator <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs font-semibold h-10 rounded-xl border-border hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Try Interactive Goal Simulator Promo Banner */}
      <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-foreground">
              Want to model future what-if scenarios?
            </h4>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              Try the Attendance Goal Simulator to project attendance across upcoming classes (e.g. attend next 5 or miss 3).
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 shrink-0 gap-1.5">
          <Link href="/calculator/simulator">
            Open Goal Simulator <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Sliders & Inputs */}
        <Card className="lg:col-span-5 shadow-sm border-border/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" /> Baseline Parameters
            </CardTitle>
            <CardDescription className="text-xs">Adjust sliders or numbers to calculate in real time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Classes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Total Classes Conducted</label>
                <span className="font-mono font-bold text-primary text-sm">{totalClasses}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Input
                type="number"
                min="0"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Number(e.target.value))}
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>

            {/* Attended Classes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Attended Classes</label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{attendedClasses}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(totalClasses, 100)}
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <Input
                type="number"
                min="0"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(Number(e.target.value))}
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>

            {/* Minimum Target */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Target Minimum %</label>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{minimumRequired}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={minimumRequired}
                onChange={(e) => setMinimumRequired(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={minimumRequired}
                onChange={(e) => setMinimumRequired(Number(e.target.value))}
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Live Simulated Result Output */}
        <div className="lg:col-span-7 space-y-4">
          {!isValid ? (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-500">
              {errorMessage}
            </div>
          ) : (
            <Card className="shadow-sm border-border/80 relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Calculation Telemetry Output</CardTitle>
                  <CardDescription className="text-xs">Exact mathematical precision result</CardDescription>
                </div>
                <Badge variant={status === "safe" ? "safe" : status === "warning" ? "warning" : "critical"}>
                  {status === "safe" ? "Target Achieved" : status === "warning" ? "Warning Zone" : "Shortage Critical"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Radial Dial & Core Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="relative h-32 w-32 shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="stroke-muted"
                        strokeWidth="9"
                        fill="transparent"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="transition-all duration-300 ease-out"
                        stroke={status === "safe" ? "#10b981" : status === "warning" ? "#f59e0b" : "#f43f5e"}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
                        {currentPercentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Calculated</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:max-w-xs w-full">
                    <span className="text-xs font-semibold text-primary block">
                      Standing Overview
                    </span>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {status === "safe"
                        ? "Optimal attendance. You have buffer classes available to take off."
                        : `Shortage detected. You are currently ${(minimumRequired - currentPercentage).toFixed(1)}% below requirement.`}
                    </p>
                    <Progress value={Math.min(100, currentPercentage)} className="h-2.5 rounded-full" />
                  </div>
                </div>

                {/* Safe Bunks / Recovery Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Safe Bunks Permitted
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {safeBunks} {safeBunks === 1 ? "Class" : "Classes"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      You can miss the next {safeBunks} classes consecutively without dropping below {minimumRequired}%.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block flex items-center gap-1.5">
                      <Flame className="h-4 w-4" /> Recovery Classes Required
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                      {recoveryNeeded} {recoveryNeeded === 1 ? "Class" : "Classes"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {recoveryNeeded === 0
                        ? "You are safely meeting your threshold."
                        : `Attend the next ${recoveryNeeded} consecutive classes to raise attendance back to ${minimumRequired}%.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}