"use client";

import * as React from "react";
import {
  ResponsiveContainer,
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
  BarChart3,
  AlignLeft,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldAlert,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { type SubjectChartItem } from "@/lib/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "chart" | "horizontal" | "cards";
type FilterMode = "all" | "safe" | "shortage";

export function AttendanceBySubject({ data }: { data: SubjectChartItem[] }) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("chart");
  const [filterMode, setFilterMode] = React.useState<FilterMode>("all");

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">Course Standing Comparison</CardTitle>
          <CardDescription className="text-xs">No course attendance data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate high-level course metrics
  const totalCourses = data.length;
  const safeCourses = data.filter((c) => c.percentage >= c.minimum);
  const shortageCourses = data.filter((c) => c.percentage < c.minimum);
  const averagePercentage =
    data.reduce((acc, c) => acc + c.percentage, 0) / (totalCourses || 1);
  const topCourse = [...data].sort((a, b) => b.percentage - a.percentage)[0];

  const filteredData = data.filter((item) => {
    if (filterMode === "safe") return item.percentage >= item.minimum;
    if (filterMode === "shortage") return item.percentage < item.minimum;
    return true;
  });

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/80">
      <CardHeader className="pb-3 space-y-3">
        {/* Title and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">Course Standing Comparison</CardTitle>
              <Badge variant="outline" className="text-[11px] font-semibold">
                {totalCourses} Enrolled
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Comparative analysis of attendance percentage vs institutional {data[0]?.minimum || 75}% target threshold
            </CardDescription>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
                viewMode === "chart"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Bar Chart View"
            >
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Bars</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("horizontal")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
                viewMode === "horizontal"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Progress List View"
            >
              <AlignLeft className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Course Cards Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Course Summary KPI Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Average Rate</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {averagePercentage.toFixed(1)}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Target Met</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {safeCourses.length} / {totalCourses}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Shortage Alerts</span>
            <span className={cn(
              "text-sm font-bold mt-0.5 block flex items-center gap-1",
              shortageCourses.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
            )}>
              <AlertTriangle className="h-3.5 w-3.5" /> {shortageCourses.length} {shortageCourses.length === 1 ? "Course" : "Courses"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 truncate">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase block truncate">Top Standing</span>
            <span className="text-sm font-bold text-primary mt-0.5 truncate block" title={topCourse?.name}>
              {topCourse ? `${topCourse.percentage.toFixed(0)}% (${topCourse.name.slice(0, 10)}..)` : "N/A"}
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-medium mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filterMode === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
          >
            All Courses ({data.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("safe")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filterMode === "safe"
                ? "bg-emerald-600 text-white"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
          >
            Safe ≥ 75% ({safeCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("shortage")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filterMode === "shortage"
                ? "bg-rose-600 text-white"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
          >
            Shortage &lt; 75% ({shortageCourses.length})
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* VIEW 1: ENHANCED BAR CHART */}
        {viewMode === "chart" && (
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 20, right: 35, left: 0, bottom: 65 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    color: "#f8fafc",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                  formatter={(value: any, name: any, item: any) => {
                    const isSafe = item.payload.percentage >= item.payload.minimum;
                    return [
                      `${Number(value).toFixed(1)}% (${item.payload.attended}/${item.payload.total} classes) — ${
                        isSafe ? "Safe Standing" : "Attendance Shortage"
                      }`,
                      "Current Rate",
                    ];
                  }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#06b6d4"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Target 75%",
                    fill: "#06b6d4",
                    fontSize: 11,
                    fontWeight: 600,
                    position: "insideTopRight",
                    offset: 8,
                  }}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={55}>
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage >= entry.minimum ? "#06b6d4" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 2: HORIZONTAL PROGRESS LIST MATRIX */}
        {viewMode === "horizontal" && (
          <div className="space-y-3 py-1">
            {filteredData.map((course, index) => {
              const isSafe = course.percentage >= course.minimum;
              const safeLeaves = isSafe
                ? Math.floor((course.attended - (course.minimum / 100) * course.total) / (course.minimum / 100))
                : 0;
              const classesNeeded = !isSafe
                ? Math.ceil(((course.minimum / 100) * course.total - course.attended) / (1 - course.minimum / 100))
                : 0;

              return (
                <div
                  key={course.name || `course-${index}`}
                  className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">{course.name}</span>
                        {isSafe ? (
                          <Badge variant="safe" className="text-[10px] py-0 px-2 rounded-full font-semibold">
                            Safe
                          </Badge>
                        ) : (
                          <Badge variant="critical" className="text-[10px] py-0 px-2 rounded-full font-semibold">
                            Shortage
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Logged: <strong className="text-foreground">{course.attended}</strong> of{" "}
                        <strong className="text-foreground">{course.total}</strong> classes conducted
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span
                          className={cn(
                            "text-base font-extrabold block leading-none",
                            isSafe ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {course.percentage.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">Target: {course.minimum}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar with 75% Target Marker */}
                  <div className="space-y-1">
                    <div className="relative w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isSafe
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                            : "bg-gradient-to-r from-rose-500 to-amber-500"
                        )}
                        style={{ width: `${Math.min(100, Math.max(0, course.percentage))}%` }}
                      />
                      {/* Target 75% indicator notch */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/70 z-10"
                        style={{ left: `${course.minimum}%` }}
                        title={`Target: ${course.minimum}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>0%</span>
                      {isSafe ? (
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                          ✓ {safeLeaves > 0 ? `${safeLeaves} safe leaves buffer` : "On target boundary"}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          ⚠ Must attend next {classesNeeded} {classesNeeded === 1 ? "class" : "classes"} to recover
                        </span>
                      )}
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: COURSE CARDS GRID */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            {filteredData.map((course, index) => {
              const isSafe = course.percentage >= course.minimum;
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (Math.min(100, course.percentage) / 100) * circumference;

              return (
                <div
                  key={course.name || `course-card-${index}`}
                  className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{course.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {course.attended} / {course.total} classes attended
                      </p>
                    </div>

                    {/* Circular mini gauge */}
                    <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 70 70">
                        <circle
                          cx="35"
                          cy="35"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-muted/40"
                          fill="transparent"
                        />
                        <circle
                          cx="35"
                          cy="35"
                          r={radius}
                          stroke={isSafe ? "#06b6d4" : "#f43f5e"}
                          strokeWidth="5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-foreground">
                        {course.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target: {course.minimum}%</span>
                    <Badge
                      variant={isSafe ? "safe" : "critical"}
                      className="text-[10px] py-0 px-2 rounded-full font-semibold"
                    >
                      {isSafe ? "Passing" : "Shortage"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}