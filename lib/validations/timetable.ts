import { z } from "zod";

export const timetableSchema = z
  .object({
    subject_id: z.string().uuid("Please select a valid subject"),
    day_of_week: z.coerce.number().min(1).max(7),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Format must be HH:MM"),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Format must be HH:MM"),
    room: z.string().max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_time && data.end_time && data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["end_time"],
      });
    }
  });

export type TimetableFormValues = z.infer<typeof timetableSchema>;
