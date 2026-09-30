"use client";

import * as React from "react";
import { Plus, GraduationCap, Award, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type GradeRecord,
  getGrades,
  createGrade,
  deleteGrade,
} from "@/lib/grades/actions";
import { gradeSchema, type GradeFormValues } from "@/lib/validations/grade";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import {
  type GpaScale,
  calculateWeightedGpa,
  GRADE_POINTS_4_SCALE,
  GRADE_POINTS_10_SCALE,
} from "@/lib/calculations/gpa";
import { GradeTable } from "@/components/gpa/GradeTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface GpaCalculatorProps {
  initialGrades: GradeRecord[];
  subjects: SubjectWithStats[];
}

export function GpaCalculator({ initialGrades, subjects }: GpaCalculatorProps) {
  const [grades, setGrades] = React.useState<GradeRecord[]>(initialGrades);
  const [scale, setScale] = React.useState<GpaScale>("4.0");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      subject_id: subjects[0]?.id || "",
      credits: 3,
      grade: scale === "10.0" ? "O" : "A",
      grade_scale: scale,
    },
  });

  const refreshData = async () => {
    const res = await getGrades();
    if (res.data) setGrades(res.data);
  };

  const handleAddGrade = async (values: GradeFormValues) => {
    setIsSubmitting(true);
    try {
      await createGrade(values);
      setDialogOpen(false);
      reset();
      await refreshData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGrade(id);
    await refreshData();
  };

  const gradeItems = grades.map((g) => ({ credits: g.credits, grade: g.grade }));
  const stats = React.useMemo(() => {
    try {
      return calculateWeightedGpa(gradeItems, scale);
    } catch {
      return { gpa: 0, totalCredits: 0, totalQualityPoints: 0, scale };
    }
  }, [gradeItems, scale]);

  const availableGrades = scale === "10.0" ? Object.keys(GRADE_POINTS_10_SCALE) : Object.keys(GRADE_POINTS_4_SCALE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">GPA & Assessment Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Credit-weighted GPA calculator supporting 4.0 and 10.0 grading scales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setScale("4.0")}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                scale === "4.0" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              4.0 Scale
            </button>
            <button
              type="button"
              onClick={() => setScale("10.0")}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                scale === "10.0" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              10.0 Scale
            </button>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            disabled={subjects.length === 0}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Grade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30 shadow-sm bg-primary/5">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-primary">Cumulative GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary">{stats.gpa.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">/ {scale}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Total Enrolled Credits</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-4xl font-black text-foreground">{stats.totalCredits}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Total Quality Points</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-4xl font-black text-foreground">{stats.totalQualityPoints.toFixed(1)}</span>
          </CardContent>
        </Card>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Available"
          description="You need to add subjects before logging assessments and computing GPA."
          actionLabel="Go to Subjects"
          onAction={() => (window.location.href = "/subjects")}
        />
      ) : grades.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Grades Recorded"
          description="Add your course letter grades and credits to compute credit-weighted semester GPA."
          actionLabel="Add Grade"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <GradeTable grades={grades} scale={scale} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course Grade</DialogTitle>
            <DialogDescription>Assign a letter grade and credit count to calculate weighted GPA.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleAddGrade)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
                {...register("subject_id")}
                disabled={isSubmitting}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.credits} Credits)
                  </option>
                ))}
              </select>
              {errors.subject_id && <p className="text-[11px] text-destructive">{errors.subject_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Credits</label>
                <Input type="number" min="1" {...register("credits")} disabled={isSubmitting} />
                {errors.credits && <p className="text-[11px] text-destructive">{errors.credits.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Grade Letter</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none uppercase font-bold"
                  {...register("grade")}
                  disabled={isSubmitting}
                >
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-[11px] text-destructive">{errors.grade.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Save Grade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}