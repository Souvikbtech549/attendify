"use client";

import Link from "next/link";
import {
  BookOpen,
  User,
  Award,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Edit2,
  Archive,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import { getAttendanceWarning } from "@/lib/calculations/attendanceWarnings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: SubjectWithStats;
  onEdit: (subject: SubjectWithStats) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}

export function SubjectCard({ subject, onEdit, onArchive, onDelete }: SubjectCardProps) {
  const warning = getAttendanceWarning({
    subjectName: subject.name,
    subjectCode: subject.code,
    attended: subject.attended_classes,
    total: subject.total_classes,
    minimumPercentage: subject.minimum_attendance,
  });

  const isCritical = warning.severity === "CRITICAL";
  const isWarning = warning.severity === "WARNING";
  const isSafe = warning.severity === "SAFE";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 group rounded-2xl border shadow-sm flex flex-col justify-between",
        isCritical
          ? "border-rose-500/30 bg-card hover:border-rose-500/60"
          : isWarning
          ? "border-amber-500/30 bg-card hover:border-amber-500/60"
          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30",
        subject.archived ? "opacity-60 bg-muted/30" : ""
      )}
    >
      {/* Top indicator bar matching subject accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5 duration-200"
        style={{ backgroundColor: subject.color || "#3b82f6" }}
      />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <Link href={`/subjects/${subject.id}`} className="group/link flex items-center gap-1.5">
              <CardTitle className="text-base font-bold text-foreground truncate group-hover/link:text-primary transition-colors">
                {subject.name}
              </CardTitle>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 text-primary transition-opacity" />
            </Link>
            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              {subject.code && <span className="font-semibold text-primary">{subject.code}</span>}
              {subject.teacher && <span>• {subject.teacher}</span>}
            </CardDescription>
          </div>

          {/* Accessible status badge with icon and text */}
          <Badge
            variant={warning.badgeVariant}
            className="shrink-0 flex items-center gap-1 text-[10px] py-0.5 px-2 font-semibold rounded-full"
          >
            {isCritical ? (
              <>
                <AlertOctagon className="h-3 w-3" />
                <span>Shortage</span>
              </>
            ) : isWarning ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Low Buffer</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Safe</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attendance Metric */}
        <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {warning.percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground">{subject.attended_classes}</strong> / {subject.total_classes} attended
            </span>
          </div>
          <Progress
            value={Math.min(100, warning.percentage)}
            className="h-2 rounded-full"
            indicatorClassName={
              isSafe
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                : isWarning
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-rose-500 to-red-600"
            }
          />
        </div>

        {/* Safe Bunks / Recovery Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-muted/30 border border-border/60 space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-semibold uppercase block">Safe Leaves</span>
            <span className={cn("font-bold text-xs", isSafe ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              {warning.safeBunks} {warning.safeBunks === 1 ? "Class" : "Classes"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-muted/30 border border-border/60 space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-semibold uppercase block">Recovery</span>
            <span className={cn("font-bold text-xs", isCritical ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
              {warning.recoveryClasses > 0 ? `${warning.recoveryClasses} Needed` : "0 (On Target)"}
            </span>
          </div>
        </div>

        {/* Footer info & action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">
            {subject.credits} Credits • Target {subject.minimum_attendance}%
          </span>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(subject)}
              title="Edit subject"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-amber-500"
              onClick={() => onArchive(subject.id, !subject.archived)}
              title={subject.archived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(subject.id)}
              title="Delete subject"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}