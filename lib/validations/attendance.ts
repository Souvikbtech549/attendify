import { z } from "zod";

export const attendanceRecordSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["present", "absent"]),
  notes: z.string().max(200).optional().or(z.literal("")),
});

export type AttendanceRecordFormValues = z.infer<typeof attendanceRecordSchema>;
