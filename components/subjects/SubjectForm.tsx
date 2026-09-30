"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, type SubjectFormValues } from "@/lib/validations/subject";
import { type SubjectWithStats } from "@/lib/subjects/actions";
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

const COLOR_PRESETS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"
];

interface SubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubjectFormValues) => Promise<void>;
  subject?: SubjectWithStats | null;
  semesters: SemesterRecord[];
  defaultSemesterId?: string;
}

export function SubjectForm({
  open,
  onOpenChange,
  onSubmit,
  subject,
  semesters,
  defaultSemesterId,
}: SubjectFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = Boolean(subject);

  const fallbackSemesterId =
    defaultSemesterId || semesters.find((s) => s.is_active)?.id || semesters[0]?.id || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name || "",
      code: subject?.code || "",
      teacher: subject?.teacher || "",
      credits: subject?.credits || 3,
      minimum_attendance: subject?.minimum_attendance || 75,
      color: subject?.color || "#3b82f6",
      semester_id: subject?.semester_id || fallbackSemesterId,
    },
  });

  const selectedColor = watch("color");

  React.useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        code: subject.code || "",
        teacher: subject.teacher || "",
        credits: subject.credits,
        minimum_attendance: subject.minimum_attendance,
        color: subject.color,
        semester_id: subject.semester_id,
      });
    } else {
      reset({
        name: "",
        code: "",
        teacher: "",
        credits: 3,
        minimum_attendance: 75,
        color: "#3b82f6",
        semester_id: fallbackSemesterId,
      });
    }
  }, [subject, fallbackSemesterId, reset, open]);

  const handleFormSubmit = async (values: SubjectFormValues) => {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogDescription>Configure subject parameters, course code, and target attendance.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 py-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Semester</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              {...register("semester_id")}
              disabled={isSubmitting}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
            {errors.semester_id && <p className="text-[11px] text-destructive">{errors.semester_id.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Subject Name</label>
            <Input placeholder="e.g., Operating Systems" {...register("name")} disabled={isSubmitting} />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Course Code</label>
              <Input placeholder="e.g., CS302" {...register("code")} disabled={isSubmitting} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Teacher / Professor</label>
              <Input placeholder="e.g., Dr. Turing" {...register("teacher")} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Credits</label>
              <Input type="number" min="1" max="20" {...register("credits")} disabled={isSubmitting} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Minimum Target %</label>
              <Input type="number" min="0" max="100" {...register("minimum_attendance")} disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Color Tag</label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue("color", c)}
                  className={`h-6 w-6 rounded-full border transition-transform ${selectedColor === c ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}