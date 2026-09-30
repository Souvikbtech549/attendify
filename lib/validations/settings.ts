import { z } from "zod";

export const profileSettingsSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  target_attendance_percentage: z.coerce.number().min(0).max(100).default(75),
  active_semester_id: z.string().uuid().optional().or(z.literal("")),
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;
