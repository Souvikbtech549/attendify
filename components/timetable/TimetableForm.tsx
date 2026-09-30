"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { timetableSchema, type TimetableFormValues } from "@/lib/validations/timetable";
import { type TimetableEntry } from "@/lib/timetable/actions";
import { type SubjectWithStats } from "@/lib/subjects/actions";
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

export const DAYS_OF_WEEK = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

interface TimetableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TimetableFormValues) => Promise<void>;
  entry?: TimetableEntry | null;
  subjects: SubjectWithStats[];
  defaultDay?: number;
}

export function TimetableForm({
  open,
  onOpenChange,
  onSubmit,
  entry,
  subjects,
  defaultDay = 1,
}: TimetableFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = Boolean(entry);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      subject_id: entry?.subject_id || subjects[0]?.id || "",
      day_of_week: entry?.day_of_week || defaultDay,
      start_time: entry ? entry.start_time.substring(0, 5) : "09:00",
      end_time: entry ? entry.end_time.substring(0, 5) : "10:00",
      room: entry?.room || "",
    },
  });

  React.useEffect(() => {
    if (entry) {
      reset({
        subject_id: entry.subject_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time.substring(0, 5),
        end_time: entry.end_time.substring(0, 5),
        room: entry.room || "",
      });
    } else {
      reset({
        subject_id: subjects[0]?.id || "",
        day_of_week: defaultDay,
        start_time: "09:00",
        end_time: "10:00",
        room: "",
      });
    }
  }, [entry, subjects, defaultDay, reset, open]);

  const handleFormSubmit = async (values: TimetableFormValues) => {
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
          <DialogTitle>{isEditing ? "Edit Class Slot" : "Add Timetable Slot"}</DialogTitle>
          <DialogDescription>Schedule regular recurring classes on your weekly calendar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Subject</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              {...register("subject_id")}
              disabled={isSubmitting}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </option>
              ))}
            </select>
            {errors.subject_id && <p className="text-[11px] text-destructive">{errors.subject_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Day of the Week</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              {...register("day_of_week")}
              disabled={isSubmitting}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.day_of_week && <p className="text-[11px] text-destructive">{errors.day_of_week.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Start Time</label>
              <Input type="time" {...register("start_time")} disabled={isSubmitting} />
              {errors.start_time && <p className="text-[11px] text-destructive">{errors.start_time.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">End Time</label>
              <Input type="time" {...register("end_time")} disabled={isSubmitting} />
              {errors.end_time && <p className="text-[11px] text-destructive">{errors.end_time.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Room / Venue (Optional)</label>
            <Input placeholder="e.g., Room 304 or CS Lab 2" {...register("room")} disabled={isSubmitting} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Class Slot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}