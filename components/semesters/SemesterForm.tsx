"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Calendar, Target, Clock, Check } from "lucide-react";
import { semesterSchema, type SemesterFormValues } from "@/lib/validations/semester";
import { type SemesterRecord } from "@/lib/semesters/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SemesterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SemesterFormValues) => Promise<void>;
  semester?: SemesterRecord | null;
}

const QUICK_SEMESTER_NAMES = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8",
  "Spring 2026", "Fall 2026", "Summer 2026"
];

const QUICK_YEARS = ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];
const QUICK_TARGETS = [75, 80, 85, 90];

export function SemesterForm({ open, onOpenChange, onSubmit, semester }: SemesterFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = Boolean(semester);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: semester?.name || "",
      academic_year: semester?.academic_year || "2025-2026",
      target_attendance: semester?.target_attendance || 75,
      is_active: semester?.is_active || false,
      start_date: semester?.start_date || "",
      end_date: semester?.end_date || "",
    },
  });

  const selectedName = watch("name");
  const selectedYear = watch("academic_year");
  const selectedTarget = watch("target_attendance");

  React.useEffect(() => {
    if (semester) {
      reset({
        name: semester.name,
        academic_year: semester.academic_year,
        target_attendance: semester.target_attendance,
        is_active: semester.is_active,
        start_date: semester.start_date || "",
        end_date: semester.end_date || "",
      });
    } else {
      reset({
        name: "",
        academic_year: "2025-2026",
        target_attendance: 75,
        is_active: false,
        start_date: "",
        end_date: "",
      });
    }
  }, [semester, reset, open]);

  const handleFormSubmit = async (values: SemesterFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Academic Semester" : "Add Semester Manually"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure your semester details, academic year, and minimum attendance threshold.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Semester Name & Quick Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Semester Name</span>
              <span className="text-[11px] text-muted-foreground font-normal">Click quick presets below:</span>
            </label>
            <Input
              placeholder="e.g. Semester 5 or Spring 2026"
              {...register("name")}
              disabled={isSubmitting}
              className="rounded-xl"
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_SEMESTER_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue("name", name, { shouldValidate: true })}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors",
                    selectedName === name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/80"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Academic Year</label>
            <Input
              placeholder="e.g., 2025-2026"
              {...register("academic_year")}
              disabled={isSubmitting}
              className="rounded-xl"
            />
            {errors.academic_year && <p className="text-[11px] text-destructive">{errors.academic_year.message}</p>}

            <div className="flex gap-2 pt-0.5">
              {QUICK_YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setValue("academic_year", year, { shouldValidate: true })}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors",
                    selectedYear === year
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/80"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Target Attendance & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" /> Minimum Attendance Target (%)
              </label>
              <span className="text-xs font-bold text-primary">{selectedTarget}%</span>
            </div>
            <Input
              type="number"
              min="0"
              max="100"
              {...register("target_attendance")}
              disabled={isSubmitting}
              className="rounded-xl"
            />
            {errors.target_attendance && <p className="text-[11px] text-destructive">{errors.target_attendance.message}</p>}

            <div className="flex gap-2 pt-0.5">
              {QUICK_TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setValue("target_attendance", target, { shouldValidate: true })}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors text-center",
                    Number(selectedTarget) === target
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/80"
                  )}
                >
                  {target}%
                </button>
              ))}
            </div>
          </div>

          {/* Optional Term Dates */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Start Date (Optional)</label>
              <Input type="date" {...register("start_date")} disabled={isSubmitting} className="rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">End Date (Optional)</label>
              <Input type="date" {...register("end_date")} disabled={isSubmitting} className="rounded-xl text-xs" />
            </div>
          </div>

          {/* Set as Active */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/80 mt-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Set as current active semester (subjects and dashboard will link to this term)
            </label>
          </div>

          <DialogFooter className="pt-4 border-t border-border/80">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl gap-1.5 font-semibold">
              <Check className="h-4 w-4" />
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Semester"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}