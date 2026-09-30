"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Calculator,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Sliders,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Zap,
  Plus,
  Minus,
  Layers,
} from "lucide-react";
import {
  simulateAttendanceScenario,
  generateFutureTrajectory,
  type SimulatorResult,
  type TrajectoryPoint,
} from "@/lib/calculations/attendanceSimulator";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ScenarioPreset = "attend_all" | "miss_all" | "custom";

interface AttendanceSimulatorProps {
  initialSubjects?: SubjectWithStats[];
}

export function AttendanceSimulator({ initialSubjects = [] }: AttendanceSimulatorProps) {
  const [currentTotal, setCurrentTotal] = React.useState<number>(30);
  const [currentAttended, setCurrentAttended] = React.useState<number>(24);
  const [minimumRequired, setMinimumRequired] = React.useState<number>(75);

  const [futureTotal, setFutureTotal] = React.useState<number>(5);
  const [preset, setPreset] = React.useState<ScenarioPreset>("attend_all");
  const [customAttended, setCustomAttended] = React.useState<number>(3);

  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");

  // Derive futureAttended and futureMissed purely based on preset & futureTotal
  const futureAttended =
    preset === "attend_all"
      ? futureTotal
      : preset === "miss_all"
      ? 0
      : Math.max(0, Math.min(futureTotal, customAttended));
  const futureMissed = Math.max(0, futureTotal - futureAttended);

  const handleCustomAttendedChange = (val: number) => {
    const clamped = Math.max(0, Math.min(futureTotal, val));
    setCustomAttended(clamped);
  };

  const handleSubjectSelect = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = initialSubjects.find((s) => s.id === subId);
    if (sub) {
      setCurrentTotal(sub.total_classes);
      setCurrentAttended(sub.attended_classes);
      setMinimumRequired(sub.minimum_attendance);
    }
  };

  const handleReset = () => {
    setCurrentTotal(30);
    setCurrentAttended(24);
    setMinimumRequired(75);
    setFutureTotal(5);
    setPreset("attend_all");
    setCustomAttended(3);
    setSelectedSubjectId("");
  };

  // Run calculation simulation
  let result: SimulatorResult | null = null;
  let trajectory: TrajectoryPoint[] = [];
  let errorMsg = "";

  try {
    result = simulateAttendanceScenario({
      currentAttended,
      currentTotal,
      minimumPercentage: minimumRequired,
      futureAttended,
      futureMissed,
    });
    trajectory = generateFutureTrajectory({
      currentAttended,
      currentTotal,
      minimumPercentage: minimumRequired,
      futureAttended,
      futureMissed,
    });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Calculation error";
  }

  const isPositiveChange = (result?.percentageChange ?? 0) >= 0;

  const barComparisonData = result
    ? [
        {
          name: "Current Standing",
          percentage: result.currentPercentage,
          attended: currentAttended,
          total: currentTotal,
          fill: result.currentPercentage >= minimumRequired ? "#06b6d4" : "#f43f5e",
        },
        {
          name: "Projected Outcome",
          percentage: result.projectedPercentage,
          attended: result.projectedAttended,
          total: result.projectedTotal,
          fill: result.isSafe ? "#10b981" : "#f43f5e",
        },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Future Scenario Predictor
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                Interactive Simulator
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Attendance Goal Simulator
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Model hypothetical scenarios (e.g. &ldquo;What if I attend the next 5 classes?&rdquo; or &ldquo;What if I miss 3 classes?&rdquo;) and visualize your projected attendance trajectory in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold rounded-xl border-border hover:bg-muted">
              <Link href="/calculator">
                <ArrowLeft className="h-3.5 w-3.5" /> Standard Calculator
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Controls */}
        <Card className="lg:col-span-5 shadow-sm border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Scenario Inputs
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-semibold">
                Parameters
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Configure your baseline standing and define your future class scenario.
            </CardDescription>

            {/* Optional Course Auto-filler */}
            {initialSubjects.length > 0 && (
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Load from Enrolled Subject:
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectSelect(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Custom Simulation (Manual Values) --</option>
                  {initialSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.attended_classes}/{sub.total_classes} • {sub.minimum_attendance}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-5">
            {/* 1. Baseline Classes Conducted */}
            <div className="space-y-2 p-3 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Current Total Classes</label>
                <span className="font-mono text-sm font-bold text-foreground">{currentTotal}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setCurrentTotal((prev) => Math.max(0, prev - 1))}
                  disabled={currentTotal <= 0}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentTotal(val);
                    if (currentAttended > val) setCurrentAttended(val);
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setCurrentTotal((prev) => prev + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* 2. Baseline Classes Attended */}
            <div className="space-y-2 p-3 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Current Attended Classes</label>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {currentAttended}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setCurrentAttended((prev) => Math.max(0, prev - 1))}
                  disabled={currentAttended <= 0}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="range"
                  min="0"
                  max={Math.max(1, currentTotal)}
                  value={currentAttended}
                  onChange={(e) => setCurrentAttended(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setCurrentAttended((prev) => Math.min(currentTotal, prev + 1))}
                  disabled={currentAttended >= currentTotal}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* 3. Minimum Target % */}
            <div className="space-y-2 p-3 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Target Minimum Attendance</label>
                <span className="font-mono text-sm font-bold text-primary">{minimumRequired}%</span>
              </div>
              <div className="flex gap-2">
                {[75, 80, 85, 90].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMinimumRequired(t)}
                    className={cn(
                      "flex-1 py-1 text-xs font-bold rounded-lg border transition-colors",
                      minimumRequired === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Future Classes & Scenario Selector */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Number of Future Classes
                </label>
                <span className="font-mono text-base font-extrabold text-primary">
                  {futureTotal} Classes
                </span>
              </div>

              {/* Slider & Stepper */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setFutureTotal((prev) => Math.max(1, prev - 1))}
                  disabled={futureTotal <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={futureTotal}
                  onChange={(e) => setFutureTotal(Number(e.target.value))}
                  className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setFutureTotal((prev) => Math.min(100, prev + 1))}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Quick Scenario Mode Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">Scenario Behavior:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreset("attend_all")}
                    className={cn(
                      "py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center",
                      preset === "attend_all"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/80"
                    )}
                  >
                    Attend All ({futureTotal})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset("miss_all")}
                    className={cn(
                      "py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center",
                      preset === "miss_all"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/80"
                    )}
                  >
                    Miss All ({futureTotal})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset("custom")}
                    className={cn(
                      "py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center",
                      preset === "custom"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/80"
                    )}
                  >
                    Custom Mix
                  </button>
                </div>
              </div>

              {/* Custom Mix Sub-Slider */}
              {preset === "custom" && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Attend: <strong className="text-emerald-600 dark:text-emerald-400">{futureAttended}</strong></span>
                    <span className="text-muted-foreground">Miss: <strong className="text-rose-600 dark:text-rose-400">{futureMissed}</strong></span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={futureTotal}
                    value={futureAttended}
                    onChange={(e) => handleCustomAttendedChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>0 Attended</span>
                    <span>{futureTotal} Attended</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Live Simulated Telemetry & Visualizations */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg ? (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-500">
              {errorMsg}
            </div>
          ) : result ? (
            <>
              {/* Primary Simulation Output Card */}
              <Card className="shadow-sm border-border/80 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Simulated Telemetry Result
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Exact mathematical projection for upcoming {futureTotal} classes
                      </CardDescription>
                    </div>

                    <Badge
                      variant={result.status === "SAFE" ? "safe" : result.status === "WARNING" ? "warning" : "critical"}
                      className="text-xs py-1 px-2.5 font-bold rounded-full"
                    >
                      {result.status === "SAFE" ? "SAFE ✓" : result.status === "WARNING" ? "WARNING ⚠" : "CRITICAL ✗"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Before vs After Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Current Standing */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Current Standing
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-foreground font-mono">
                          {result.currentPercentage.toFixed(2)}%
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({currentAttended}/{currentTotal})
                        </span>
                      </div>
                      <Progress value={Math.min(100, result.currentPercentage)} className="h-2 rounded-full" />
                    </div>

                    {/* Projected Standing */}
                    <div className={cn(
                      "p-4 rounded-2xl border space-y-1.5 transition-all",
                      result.isSafe
                        ? "bg-emerald-500/[0.06] border-emerald-500/30"
                        : "bg-rose-500/[0.06] border-rose-500/30"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Projected Outcome
                        </span>
                        <span className={cn(
                          "font-mono text-xs font-bold px-2 py-0.5 rounded-md",
                          isPositiveChange
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        )}>
                          {isPositiveChange ? `+${result.percentageChange.toFixed(2)}%` : `${result.percentageChange.toFixed(2)}%`}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-2xl md:text-3xl font-bold font-mono",
                          result.isSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {result.projectedPercentage.toFixed(2)}%
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({result.projectedAttended}/{result.projectedTotal})
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, result.projectedPercentage)}
                        className="h-2 rounded-full"
                        indicatorClassName={result.isSafe ? "bg-emerald-500" : "bg-rose-500"}
                      />
                    </div>
                  </div>

                  {/* Action Summary Pill */}
                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Scenario Impact: </strong>
                      {result.summaryMessage}
                    </div>
                  </div>

                  {/* Safe Leaves Buffer or Recovery Needed Bento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Safe Leaves Available
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {result.safeBunksRemaining} {result.safeBunksRemaining === 1 ? "Class" : "Classes"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase text-rose-600 dark:text-rose-400 block">
                        Recovery Needed
                      </span>
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {result.recoveryClassesNeeded > 0 ? `${result.recoveryClassesNeeded} Classes` : "0 (On Target)"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trajectory Progression Visual Chart */}
              <Card className="shadow-sm border-border/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Projected Attendance Trajectory
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Target Line: <strong>{minimumRequired}%</strong>
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Step-by-step attendance rate curve across the next {futureTotal} classes
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trajectory} margin={{ top: 15, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} dy={5} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          domain={[
                            (dataMin: number) => Math.max(0, Math.floor(Math.min(dataMin, minimumRequired - 10) / 10) * 10),
                            (dataMax: number) => Math.min(100, Math.ceil(Math.max(dataMax, minimumRequired + 5) / 10) * 10),
                          ]}
                          tickFormatter={(v) => `${v}%`}
                          tickLine={false}
                          width={45}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            color: "#f8fafc",
                          }}
                          formatter={(value: any, name: any, item: any) => [
                            `${Number(value).toFixed(2)}% (${item.payload.attended}/${item.payload.total})`,
                            "Attendance Rate",
                          ]}
                        />
                        <ReferenceLine
                          y={minimumRequired}
                          stroke="#06b6d4"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `Target ${minimumRequired}%`,
                            fill: "#06b6d4",
                            fontSize: 10,
                            position: "insideTopRight",
                            offset: 5,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke={result.isSafe ? "#10b981" : "#f43f5e"}
                          strokeWidth={3}
                          dot={{ r: 4, fill: result.isSafe ? "#10b981" : "#f43f5e" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}