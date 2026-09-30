"use client";

import { Calendar, CheckCircle2, Edit2, Trash2, Target, Clock } from "lucide-react";
import { type SemesterRecord } from "@/lib/semesters/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SemesterCardProps {
  semester: SemesterRecord;
  onEdit: (semester: SemesterRecord) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
}

export function SemesterCard({ semester, onEdit, onDelete, onSetActive }: SemesterCardProps) {
  return (
    <Card
      className={cn(
        "relative transition-all duration-200 shadow-sm rounded-2xl border flex flex-col justify-between overflow-hidden",
        semester.is_active
          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-md"
          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">{semester.name}</CardTitle>
              {semester.is_active ? (
                <Badge variant="safe" className="text-[10px] py-0.5 px-2 rounded-full font-semibold">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active Term
                </Badge>
              ) : null}
            </div>
            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Academic Year: <span className="font-semibold text-foreground">{semester.academic_year}</span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => onEdit(semester)}
              title="Edit semester"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(semester.id)}
              title="Delete semester"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Target and Dates */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Minimum Target</span>
            <span className="font-bold text-primary flex items-center gap-1 mt-0.5">
              <Target className="h-3.5 w-3.5" /> {semester.target_attendance}%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Timeline</span>
            <span className="font-medium text-foreground text-[11px] truncate block mt-0.5">
              {semester.start_date || semester.end_date
                ? `${semester.start_date || "Start"} → ${semester.end_date || "End"}`
                : "Standard Term"}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground">
            {semester.is_active ? "Default tracking semester" : "Inactive term"}
          </span>
          {!semester.is_active && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold rounded-lg border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
              onClick={() => onSetActive(semester.id)}
            >
              Set as Active
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}