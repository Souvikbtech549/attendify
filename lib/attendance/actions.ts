"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attendanceRecordSchema, type AttendanceRecordFormValues } from "@/lib/validations/attendance";
import { DEMO_HISTORY } from "@/lib/demo/demo-data";

export interface AttendanceHistoryItem {
  id: string;
  date: string;
  status: "present" | "absent";
  notes: string | null;
  created_at: string;
  subjects: {
    id: string;
    name: string;
    code: string | null;
    color: string;
  };
}

export async function getAttendanceForDate(date: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: DEMO_HISTORY.filter((h) => h.date === date) };
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date);

    if (error) return { data: [], error: error.message };
    return { data: (data as any) || [] };
  } catch {
    return { data: [] };
  }
}

export async function logAttendance(rawValues: AttendanceRecordFormValues) {
  try {
    const validated = attendanceRecordSchema.parse(rawValues);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/attendance");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .upsert(
        {
          user_id: user.id,
          subject_id: validated.subject_id,
          date: validated.date,
          status: validated.status,
          notes: validated.notes || null,
        },
        { onConflict: "user_id, subject_id, date" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to record attendance." };
  }
}

export async function unmarkAttendance(subjectId: string, date: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      revalidatePath("/attendance");
      return { success: true };
    }

    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("user_id", user.id)
      .eq("subject_id", subjectId)
      .eq("date", date);

    if (error) return { success: false, error: error.message };

    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to reset attendance." };
  }
}

export async function getRecentAttendance(limit = 10): Promise<{ data: AttendanceHistoryItem[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { data: DEMO_HISTORY.slice(0, limit) };
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .select("id, date, status, notes, created_at, subjects(id, name, code, color)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return { data: DEMO_HISTORY.slice(0, limit) };
    return { data: (data as any) || [] };
  } catch {
    return { data: DEMO_HISTORY.slice(0, limit) };
  }
}