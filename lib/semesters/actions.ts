"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { semesterSchema, type SemesterFormValues } from "@/lib/validations/semester";
import { DEMO_SEMESTERS } from "@/lib/demo/demo-data";

export interface SemesterRecord {
  id: string;
  user_id: string;
  name: string;
  academic_year: string;
  is_active: boolean;
  target_attendance: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getSemesters(): Promise<{ data: SemesterRecord[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: [...DEMO_SEMESTERS] };
    }

    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return { data: [...DEMO_SEMESTERS] };
    return { data: (data as any) || [] };
  } catch {
    return { data: [...DEMO_SEMESTERS] };
  }
}

export async function createSemester(rawValues: SemesterFormValues) {
  try {
    const validated = semesterSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      if (validated.is_active) {
        DEMO_SEMESTERS.forEach((s) => (s.is_active = false));
      }
      const newSem: SemesterRecord = {
        id: `sem-${Date.now()}`,
        user_id: "demo-user",
        name: validated.name,
        academic_year: validated.academic_year,
        is_active: validated.is_active,
        target_attendance: validated.target_attendance,
        start_date: validated.start_date || null,
        end_date: validated.end_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      DEMO_SEMESTERS.unshift(newSem);
      revalidatePath("/semesters");
      revalidatePath("/dashboard");
      return { success: true, data: newSem };
    }

    if (validated.is_active) {
      await supabase.from("semesters").update({ is_active: false }).eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("semesters")
      .insert({
        user_id: user.id,
        name: validated.name,
        academic_year: validated.academic_year,
        target_attendance: validated.target_attendance,
        is_active: validated.is_active,
        start_date: validated.start_date || null,
        end_date: validated.end_date || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/semesters");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create semester." };
  }
}

export async function updateSemester(id: string, rawValues: SemesterFormValues) {
  try {
    const validated = semesterSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      if (validated.is_active) {
        DEMO_SEMESTERS.forEach((s) => (s.is_active = false));
      }
      const target = DEMO_SEMESTERS.find((s) => s.id === id);
      if (target) {
        target.name = validated.name;
        target.academic_year = validated.academic_year;
        target.target_attendance = validated.target_attendance;
        target.is_active = validated.is_active;
        target.start_date = validated.start_date || null;
        target.end_date = validated.end_date || null;
        target.updated_at = new Date().toISOString();
      }
      revalidatePath("/semesters");
      revalidatePath("/dashboard");
      return { success: true };
    }

    if (validated.is_active) {
      await supabase
        .from("semesters")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .neq("id", id);
    }

    const { error } = await supabase
      .from("semesters")
      .update({
        name: validated.name,
        academic_year: validated.academic_year,
        target_attendance: validated.target_attendance,
        is_active: validated.is_active,
        start_date: validated.start_date || null,
        end_date: validated.end_date || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/semesters");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update semester." };
  }
}

export async function setActiveSemester(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      DEMO_SEMESTERS.forEach((s) => {
        s.is_active = s.id === id;
      });
      revalidatePath("/semesters");
      revalidatePath("/dashboard");
      return { success: true };
    }

    await supabase.from("semesters").update({ is_active: false }).eq("user_id", user.id);
    const { error } = await supabase.from("semesters").update({ is_active: true }).eq("id", id).eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/semesters");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to activate semester." };
  }
}

export async function deleteSemester(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      const idx = DEMO_SEMESTERS.findIndex((s) => s.id === id);
      if (idx !== -1) DEMO_SEMESTERS.splice(idx, 1);
      revalidatePath("/semesters");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { error } = await supabase.from("semesters").delete().eq("id", id).eq("user_id", user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/semesters");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete semester." };
  }
}