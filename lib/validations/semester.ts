import { z } from "zod";

export const semesterSchema = z.object({
  name: z.string().min(2, "Semester name must be at least 2 characters").max(50),
  academic_year: z.string().min(4, "Academic year must be specified (e.g., 2026-2027)").max(20),
  target_attendance: z.coerce.number().min(0).max(100).default(75),
  is_active: z.boolean().default(false),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type SemesterFormValues = z.infer<typeof semesterSchema>;