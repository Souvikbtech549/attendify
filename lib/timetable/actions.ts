"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { timetableSchema, type TimetableFormValues } from "@/lib/validations/timetable";
import { DEMO_TIMETABLE } from "@/lib/demo/demo-data";

export interface TimetableEntry {
  id: string;
  user_id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
  updated_at: string;
  subjects: {
    id: string;
    name: string;
    code: string | null;
    color: string;
    teacher: string | null;
  };
}

export async function getTimetable(): Promise<{ data: TimetableEntry[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: DEMO_TIMETABLE };
    }

    const { data, error } = await supabase
      .from("timetable")
      .select("id, user_id, subject_id, day_of_week, start_time, end_time, room, created_at, updated_at, subjects(id, name, code, color, teacher)")
      .eq("user_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error || !data || data.length === 0) return { data: DEMO_TIMETABLE };
    return { data: (data as any) || [] };
  } catch {
    return { data: DEMO_TIMETABLE };
  }
}

export async function createTimetableEntry(rawValues: TimetableFormValues) {
  try {
    const validated = timetableSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/timetable");
      return { success: true };
    }

    const { data, error } = await supabase
      .from("timetable")
      .insert({
        user_id: user.id,
        subject_id: validated.subject_id,
        day_of_week: validated.day_of_week,
        start_time: validated.start_time,
        end_time: validated.end_time,
        room: validated.room || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/timetable");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create timetable slot." };
  }
}

export async function updateTimetableEntry(id: string, rawValues: TimetableFormValues) {
  try {
    const validated = timetableSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/timetable");
      return { success: true };
    }

    const { error } = await supabase
      .from("timetable")
      .update({
        subject_id: validated.subject_id,
        day_of_week: validated.day_of_week,
        start_time: validated.start_time,
        end_time: validated.end_time,
        room: validated.room || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/timetable");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update timetable slot." };
  }
}

export async function deleteTimetableEntry(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/timetable");
      return { success: true };
    }

    const { error } = await supabase.from("timetable").delete().eq("id", id).eq("user_id", user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/timetable");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete timetable slot." };
  }
}