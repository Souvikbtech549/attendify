"use client";

import * as React from "react";
import { Check, X, RotateCcw, FileText, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import { calculateFullAttendanceMetrics } from "@/lib/calculations/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AttendanceRowProps {
  subject: SubjectWithStats;
  currentStatus?: "present" | "absent";
  currentNotes?: string;
  onMark: (subjectId: string, status: "present" | "absent", notes?: string) => Promise<void>;
  onUnmark: (subjectId: string) => Promise<void>;
}

export function AttendanceRow({
  subject,
  currentStatus: initialStatus,
  currentNotes = "",
  onMark,
  onUnmark,
}: AttendanceRowProps) {
  // Optimistic instant state for 0ms lag
  const [status, setStatus] = React.useState<"present" | "absent" | undefined>(initialStatus);
  const [showNotes, setShowNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(currentNotes);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleMarkStatus = async (newStatus: "present" | "absent") => {
    // Optimistic immediate update
    setStatus(newStatus);
    setIsSubmitting(true);
    try {
      await onMark(subject.id, newStatus, notes);
    } catch {
      // Revert if error
      setStatus(initialStatus);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setStatus(undefined);
    setIsSubmitting(true);
    try {
      await onUnmark(subject.id);
      setNotes("");
      setShowNotes(false);
    } catch {
      setStatus(initialStatus);
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = calculateFullAttendanceMetrics({
    attended: subject.attended_classes + (status === "present" && initialStatus !== "present" ? 1 : 0),
    total: subject.total_classes + (status && !initialStatus ? 1 : 0),
    minimumPercentage: subject.minimum_attendance,
  });

  return (
    <div className={`flex flex-col p-4 rounded-2xl border transition-all duration-200 gap-3 ${
      status === "present"
        ? "bg-slate-900/90 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        : status === "absent"
        ? "bg-slate-900/90 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
        : "bg-card/70 border-white/[0.08] hover:border-white/20"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="h-10 w-1.5 rounded-full shrink-0 mt-0.5 shadow-sm"
            style={{ backgroundColor: subject.color || "#06b6d4" }}
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold truncate text-foreground">{subject.name}</h4>
              <Badge variant={metrics.isSafe ? "safe" : "critical"} className="text-[9px] py-0">
                {metrics.percentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground truncate">
              {subject.code && <span className="font-bold text-cyan-400">{subject.code} • </span>}
              {subject.attended_classes} of {subject.total_classes} attended • Safe Bunks: <strong className="text-emerald-400">{metrics.safeBunks}</strong>
            </p>
          </div>
        </div>

        {/* 0ms Interactive Toggle Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 text-xs h-9 px-4 font-bold rounded-xl transition-all duration-150 ${
              status === "present"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow-emerald hover:bg-emerald-400"
                : "border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
            }`}
            onClick={() => handleMarkStatus("present")}
          >
            <Check className="h-4 w-4 stroke-[3]" /> Present
          </Button>

          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 text-xs h-9 px-4 font-bold rounded-xl transition-all duration-150 ${
              status === "absent"
                ? "bg-rose-500 text-white border-rose-400 shadow-glow-rose hover:bg-rose-400"
                : "border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
            }`}
            onClick={() => handleMarkStatus("absent")}
          >
            <X className="h-4 w-4 stroke-[3]" /> Absent
          </Button>

          {status && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5"
              onClick={handleReset}
              title="Reset status"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-xl ${showNotes || notes ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:bg-white/5"}`}
            onClick={() => setShowNotes(!showNotes)}
            title="Add notes"
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {showNotes && (
        <div className="pt-2 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add note (e.g. Memory Management Lab, Substitute Faculty)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => status && handleMarkStatus(status)}
            className="w-full text-xs font-mono bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50 text-foreground"
          />
        </div>
      )}
    </div>
  );
}