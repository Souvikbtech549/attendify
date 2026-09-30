import { z } from "zod";

export const gradeSchema = z.object({
  subject_id: z.string().uuid("Please select a valid subject"),
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
  grade: z.string().min(1, "Grade is required").max(5),
  grade_scale: z.enum(["4.0", "10.0"]).default("4.0"),
});

export type GradeFormValues = z.infer<typeof gradeSchema>;
