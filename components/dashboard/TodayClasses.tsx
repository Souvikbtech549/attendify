"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { type TodayClassItem } from "@/lib/dashboard/actions";
import { TodayClassCard } from "@/components/dashboard/TodayClassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TodayClassesProps {
  classes: TodayClassItem[];
  todayDateStr: string;
  todayDayOfWeek: number;
}

export function TodayClasses({ classes, todayDateStr, todayDayOfWeek }: TodayClassesProps) {
  const [classList, setClassList] = React.useState<TodayClassItem[]>(classes);

  React.useEffect(() => {
    setClassList(classes);
  }, [classes]);

  const handleStatusChange = (subjectId: string, status: "present" | "absent" | null) => {
    setClassList((prev) =>
      prev.map((c) => (c.subject_id === subjectId ? { ...c, attendance_status: status } : c))
    );
  };

  const markedCount = classList.filter((c) => c.attendance_status !== null).length;
  const totalCount = classList.length;

  let formattedDateDisplay = "";
  try {
    formattedDateDisplay = format(parseISO(todayDateStr), "EEEE, MMMM d, yyyy");
  } catch {
    formattedDateDisplay = `${DAY_NAMES[todayDayOfWeek] || "Today"}`;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Today&apos;s Class Schedule
            </h3>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 rounded-full border-border">
              {DAY_NAMES[todayDayOfWeek] || "Today"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground pl-9">
            {formattedDateDisplay}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {totalCount > 0 && (
            <div className="text-right sm:text-left">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    markedCount === totalCount ? "bg-emerald-500" : "bg-primary animate-pulse"
                  )}
                />
                <span>
                  <strong>{markedCount}</strong> of <strong>{totalCount}</strong> Marked
                </span>
              </span>
            </div>
          )}

          <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/10 gap-1 rounded-xl">
            <Link href="/timetable">
              Full Schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Class Cards Grid / Empty State */}
      {totalCount === 0 ? (
        <div className="p-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md text-center space-y-3 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-muted/80 text-muted-foreground mx-auto flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-bold text-foreground">No Classes Scheduled Today</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You have no lectures or lab sessions scheduled for {DAY_NAMES[todayDayOfWeek]}. Enjoy your free time or review your weekly schedule.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold border-border gap-1.5">
              <Link href="/timetable">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> View Weekly Timetable
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classList.map((item) => (
            <TodayClassCard
              key={item.id}
              item={item}
              todayDateStr={todayDateStr}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}