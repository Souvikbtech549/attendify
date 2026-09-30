"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSettingsSchema, type ProfileSettingsFormValues } from "@/lib/validations/settings";

export interface UserSettingsData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  target_attendance_percentage: number;
  active_semester_id: string | null;
}

export async function getUserSettings(): Promise<{ data: UserSettingsData | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return {
        data: {
          id: "demo-user",
          full_name: "Souvik",
          email: "uniquesigmascholar@gmail.com",
          avatar_url: null,
          target_attendance_percentage: 75,
          active_semester_id: "sem-1",
        },
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, target_attendance_percentage")
      .eq("id", user.id)
      .maybeSingle();

    const { data: activeSem } = await supabase
      .from("semesters")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    return {
      data: {
        id: user.id,
        full_name: (profile as any)?.full_name || "Student",
        email: (profile as any)?.email || user.email || "",
        avatar_url: (profile as any)?.avatar_url || null,
        target_attendance_percentage: (profile as any)?.target_attendance_percentage || 75,
        active_semester_id: (activeSem as any)?.id || null,
      },
    };
  } catch {
    return {
      data: {
        id: "demo-user",
        full_name: "Souvik",
        email: "uniquesigmascholar@gmail.com",
        avatar_url: null,
        target_attendance_percentage: 75,
        active_semester_id: "sem-1",
      },
    };
  }
}

export async function updateProfileSettings(rawValues: ProfileSettingsFormValues) {
  try {
    const validated = profileSettingsSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/settings");
      revalidatePath("/dashboard");
      return { success: true };
    }

    await supabase
      .from("profiles")
      .update({
        full_name: validated.full_name,
        avatar_url: validated.avatar_url || null,
        target_attendance_percentage: validated.target_attendance_percentage,
      })
      .eq("id", user.id);

    if (validated.active_semester_id) {
      await supabase.from("semesters").update({ is_active: false }).eq("user_id", user.id);
      await supabase
        .from("semesters")
        .update({
          is_active: true,
          target_attendance: validated.target_attendance_percentage,
        })
        .eq("id", validated.active_semester_id)
        .eq("user_id", user.id);
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update profile settings." };
  }
}