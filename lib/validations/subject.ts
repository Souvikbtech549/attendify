import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters").max(100),
  code: z.string().max(20).optional().or(z.literal("")),
  teacher: z.string().max(100).optional().or(z.literal("")),
  credits: z.coerce.number().min(1, "Credits must be at least 1").max(20).default(3),
  minimum_attendance: z.coerce.number().min(0, "Minimum % must be >= 0").max(100, "Minimum % must be <= 100").default(75),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").default("#3b82f6"),
  semester_id: z.string().uuid("Please select a valid semester"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
