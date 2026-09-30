"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { subjectSchema, type SubjectFormValues } from "@/lib/validations/subject";
import { DEMO_SUBJECTS } from "@/lib/demo/demo-data";

export interface SubjectWithStats {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string | null;
  teacher: string | null;
  credits: number;
  minimum_attendance: number;
  color: string;
  archived: boolean;
  total_classes: number;
  attended_classes: number;
  created_at: string;
  updated_at: string;
  semesters?: {
    name: string;
    academic_year: string;
    is_active: boolean;
  };
}

export async function getSubjects(semesterId?: string, includeArchived = false): Promise<{ data: SubjectWithStats[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: DEMO_SUBJECTS };
    }

    let query = supabase
      .from("subjects")
      .select("*, semesters(name, academic_year, is_active)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (semesterId) {
      query = query.eq("semester_id", semesterId);
    }

    if (!includeArchived) {
      query = query.eq("archived", false);
    }

    const { data: rawSubjects, error } = await query;
    if (error || !rawSubjects || rawSubjects.length === 0) return { data: DEMO_SUBJECTS };

    const subjectIds = (rawSubjects || []).map((s: any) => s.id);
    let attendanceMap = new Map<string, { total: number; attended: number }>();

    if (subjectIds.length > 0) {
      const { data: records } = await supabase
        .from("attendance_records")
        .select("subject_id, status")
        .in("subject_id", subjectIds)
        .eq("user_id", user.id);

      (records || []).forEach((r: any) => {
        const current = attendanceMap.get(r.subject_id) || { total: 0, attended: 0 };
        current.total += 1;
        if (r.status === "present") current.attended += 1;
        attendanceMap.set(r.subject_id, current);
      });
    }

    const result: SubjectWithStats[] = (rawSubjects || []).map((sub: any) => {
      const stats = attendanceMap.get(sub.id) || { total: 0, attended: 0 };
      return {
        ...sub,
        total_classes: stats.total,
        attended_classes: stats.attended,
      };
    });

    return { data: result };
  } catch {
    return { data: DEMO_SUBJECTS };
  }
}

export async function createSubject(rawValues: SubjectFormValues) {
  try {
    const validated = subjectSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/subjects");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        user_id: user.id,
        semester_id: validated.semester_id,
        name: validated.name,
        code: validated.code || null,
        teacher: validated.teacher || null,
        credits: validated.credits,
        minimum_attendance: validated.minimum_attendance,
        color: validated.color,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/subjects");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add subject." };
  }
}

export async function updateSubject(id: string, rawValues: SubjectFormValues) {
  try {
    const validated = subjectSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/subjects");
      return { success: true };
    }

    const { error } = await supabase
      .from("subjects")
      .update({
        semester_id: validated.semester_id,
        name: validated.name,
        code: validated.code || null,
        teacher: validated.teacher || null,
        credits: validated.credits,
        minimum_attendance: validated.minimum_attendance,
        color: validated.color,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/subjects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update subject." };
  }
}

export async function archiveSubject(id: string, archived: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/subjects");
      return { success: true };
    }

    const { error } = await supabase
      .from("subjects")
      .update({ archived })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/subjects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive subject." };
  }
}

export async function deleteSubject(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/subjects");
      return { success: true };
    }

    const { error } = await supabase.from("subjects").delete().eq("id", id).eq("user_id", user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/subjects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete subject." };
  }
}