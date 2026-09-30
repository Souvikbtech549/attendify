"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gradeSchema, type GradeFormValues } from "@/lib/validations/grade";
import { DEMO_GRADES } from "@/lib/demo/demo-data";

export interface GradeRecord {
  id: string;
  user_id: string;
  subject_id: string;
  credits: number;
  grade: string;
  grade_scale: string;
  created_at: string;
  updated_at: string;
  subjects: {
    id: string;
    name: string;
    code: string | null;
    color: string;
  };
}

export async function getGrades(): Promise<{ data: GradeRecord[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: DEMO_GRADES };
    }

    const { data, error } = await supabase
      .from("grades")
      .select("id, user_id, subject_id, credits, grade, grade_scale, created_at, updated_at, subjects(id, name, code, color)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return { data: DEMO_GRADES };
    return { data: (data as any) || [] };
  } catch {
    return { data: DEMO_GRADES };
  }
}

export async function createGrade(rawValues: GradeFormValues) {
  try {
    const validated = gradeSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/gpa");
      return { success: true };
    }

    const { data, error } = await supabase
      .from("grades")
      .insert({
        user_id: user.id,
        subject_id: validated.subject_id,
        credits: validated.credits,
        grade: validated.grade,
        grade_scale: validated.grade_scale,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/gpa");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to record grade." };
  }
}

export async function deleteGrade(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/gpa");
      return { success: true };
    }

    const { error } = await supabase.from("grades").delete().eq("id", id).eq("user_id", user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/gpa");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete grade." };
  }
}