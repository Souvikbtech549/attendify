"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Radio,
} from "lucide-react";
import { type TodayClassItem } from "@/lib/dashboard/actions";
import { logAttendance, unmarkAttendance } from "@/lib/attendance/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TodayClassCardProps {
  item: TodayClassItem;
  todayDateStr: string;
  onStatusChange?: (subjectId: string, status: "present" | "absent" | null) => void;
}

function parseTimeToMinutes(timeStr: string): number {
  try {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  } catch {
    return 0;
  }
}

function formatTimeString(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const period = (h || 0) >= 12 ? "PM" : "AM";
    const hour12 = (h || 0) % 12 || 12;
    const minStr = String(m || 0).padStart(2, "0");
    return `${hour12}:${minStr} ${period}`;
  } catch {
    return timeStr;
  }
}

export function TodayClassCard({ item, todayDateStr, onStatusChange }: TodayClassCardProps) {
  const [currentStatus, setCurrentStatus] = React.useState<"present" | "absent" | null>(
    item.attendance_status
  );
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [nowMinutes, setNowMinutes] = React.useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  React.useEffect(() => {
    setCurrentStatus(item.attendance_status);
  }, [item.attendance_status]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const startMin = parseTimeToMinutes(item.start_time);
  const endMin = parseTimeToMinutes(item.end_time);

  const isNow = nowMinutes >= startMin && nowMinutes <= endMin;
  const isUpcoming = nowMinutes < startMin;
  const isCompleted = nowMinutes > endMin;

  const handleMark = async (status: "present" | "absent") => {
    if (isUpdating) return;
    // 0ms Optimistic UI update
    setCurrentStatus(status);
    onStatusChange?.(item.subject_id, status);

    try {
      setIsUpdating(true);
      await logAttendance({
        subject_id: item.subject_id,
        date: todayDateStr,
        status,
        notes: `Quick mark from Today's Dashboard (${formatTimeString(item.start_time)})`,
      });
    } catch {
      // Revert if error
      setCurrentStatus(item.attendance_status);
      onStatusChange?.(item.subject_id, item.attendance_status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (isUpdating) return;
    setCurrentStatus(null);
    onStatusChange?.(item.subject_id, null);

    try {
      setIsUpdating(true);
      await unmarkAttendance(item.subject_id, todayDateStr);
    } catch {
      setCurrentStatus(item.attendance_status);
      onStatusChange?.(item.subject_id, item.attendance_status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm",
        isNow
          ? "border-primary bg-primary/[0.07] ring-1 ring-primary/40 shadow-md"
          : currentStatus === "present"
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : currentStatus === "absent"
          ? "border-rose-500/30 bg-rose-500/[0.04]"
          : "border-border/80 bg-card hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      {/* Left accent color indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: item.color || "#3b82f6" }}
      />

      <div className="space-y-2.5 pl-1.5">
        {/* Top meta: Time & Live Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatTimeString(item.start_time)} – {formatTimeString(item.end_time)}
            </span>
          </div>

          {isNow ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Radio className="h-3 w-3" /> Live Now
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-medium">
              Completed
            </span>
          )}
        </div>

        {/* Course Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm md:text-base text-foreground truncate">
              {item.subject_name}
            </h4>
            {item.subject_code && (
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                {item.subject_code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
            {item.room && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary/80" /> {item.room}
              </span>
            )}
            {item.teacher && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-primary/80" /> {item.teacher}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Action Section */}
      <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between gap-2 pl-1.5">
        {currentStatus === "present" ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Marked Present</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                onClick={() => handleMark("absent")}
                title="Switch to Absent"
              >
                Change to Absent
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
                title="Reset attendance"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : currentStatus === "absent" ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <XCircle className="h-4 w-4" />
              <span>Marked Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => handleMark("present")}
                title="Switch to Present"
              >
                Change to Present
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
                title="Reset attendance"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Log Attendance:</span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-8 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm gap-1.5 transition-all"
                onClick={() => handleMark("present")}
                disabled={isUpdating}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-bold rounded-xl border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 gap-1.5 transition-all"
                onClick={() => handleMark("absent")}
                disabled={isUpdating}
              >
                <XCircle className="h-3.5 w-3.5" /> Absent
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}