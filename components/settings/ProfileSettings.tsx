"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Award, Calendar, CheckCircle2 } from "lucide-react";
import {
  profileSettingsSchema,
  type ProfileSettingsFormValues,
} from "@/lib/validations/settings";
import { type UserSettingsData, updateProfileSettings } from "@/lib/settings/actions";
import { type SemesterRecord } from "@/lib/semesters/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSettingsProps {
  settings: UserSettingsData;
  semesters: SemesterRecord[];
}

export function ProfileSettings({ settings, semesters }: ProfileSettingsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      full_name: settings.full_name,
      avatar_url: settings.avatar_url || "",
      target_attendance_percentage: settings.target_attendance_percentage || 75,
      active_semester_id: settings.active_semester_id || (semesters.find((s) => s.is_active)?.id || ""),
    },
  });

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage(false);
    setErrorMessage(null);

    const res = await updateProfileSettings(values);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to update profile.");
    } else {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Profile & Academic Preferences
        </CardTitle>
        <CardDescription>
          Update your student display name, target minimum attendance threshold, and active academic term.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Profile settings saved successfully!
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-semibold text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              placeholder="e.g., Alex Rivera"
              {...register("full_name")}
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="text-[11px] text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
            </label>
            <Input
              value={settings.email}
              disabled
              className="bg-muted/50 cursor-not-allowed text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground">Managed via Supabase Auth</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" /> Default Minimum Attendance Target (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              {...register("target_attendance_percentage")}
              disabled={isSubmitting}
            />
            {errors.target_attendance_percentage && (
              <p className="text-[11px] text-destructive">
                {errors.target_attendance_percentage.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Current Active Semester
            </label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none"
              {...register("active_semester_id")}
              disabled={isSubmitting}
            >
              <option value="">No Active Semester Selected</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} ({sem.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="text-xs h-9">
              {isSubmitting ? "Saving..." : "Save Profile Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}