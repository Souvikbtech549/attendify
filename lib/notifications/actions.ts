"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEMO_NOTIFICATIONS, DEMO_SUBJECTS } from "@/lib/demo/demo-data";
import { getAttendanceWarning } from "@/lib/calculations/attendanceWarnings";

export type AppNotificationType =
  | "attendance_below_minimum"
  | "attendance_warning"
  | "recovery_warning"
  | "attendance_reminder"
  | "general";

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<{
  data: NotificationRecord[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;
      return { data: [...DEMO_NOTIFICATIONS], unreadCount };
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;
      return { data: [...DEMO_NOTIFICATIONS], unreadCount };
    }

    const unreadCount = data.filter((n: any) => !n.read).length;
    return { data: (data as any) || [], unreadCount };
  } catch {
    const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;
    return { data: [...DEMO_NOTIFICATIONS], unreadCount };
  }
}

export async function toggleNotificationRead(id: string, read: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      const target = DEMO_NOTIFICATIONS.find((n) => n.id === id);
      if (target) target.read = read;
      revalidatePath("/notifications");
      return { success: true };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update notification." };
  }
}

export async function markNotificationAsRead(id: string) {
  return toggleNotificationRead(id, true);
}

export async function markNotificationAsUnread(id: string) {
  return toggleNotificationRead(id, false);
}

export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      DEMO_NOTIFICATIONS.forEach((n) => (n.read = true));
      revalidatePath("/notifications");
      return { success: true };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as read." };
  }
}

export async function markAllNotificationsAsUnread() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      DEMO_NOTIFICATIONS.forEach((n) => (n.read = false));
      revalidatePath("/notifications");
      return { success: true };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: false })
      .eq("user_id", user.id)
      .eq("read", true);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as unread." };
  }
}

export async function deleteNotification(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      const idx = DEMO_NOTIFICATIONS.findIndex((n) => n.id === id);
      if (idx !== -1) DEMO_NOTIFICATIONS.splice(idx, 1);
      revalidatePath("/notifications");
      return { success: true };
    }

    const { error } = await supabase.from("notifications").delete().eq("id", id).eq("user_id", user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete notification." };
  }
}

/**
 * Evaluates enrolled courses against the Smart Warning Engine and generates proactive notifications
 * without producing duplicate spam.
 */
export async function checkAndGenerateAttendanceAlerts() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id === "demo-user") {
      return { success: true };
    }

    // Fetch active subjects and logs
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, name, code, minimum_attendance")
      .eq("user_id", user.id)
      .eq("archived", false);

    if (!subjects || subjects.length === 0) return { success: true };

    const { data: records } = await supabase
      .from("attendance_records")
      .select("subject_id, status")
      .eq("user_id", user.id);

    const countsMap = new Map<string, { attended: number; total: number }>();
    (records || []).forEach((r: any) => {
      const curr = countsMap.get(r.subject_id) || { attended: 0, total: 0 };
      curr.total += 1;
      if (r.status === "present") curr.attended += 1;
      countsMap.set(r.subject_id, curr);
    });

    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("title, created_at, read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const newNotificationsToInsert: any[] = [];

    subjects.forEach((sub: any) => {
      const counts = countsMap.get(sub.id) || { attended: 0, total: 0 };
      if (counts.total === 0) return;

      const warning = getAttendanceWarning({
        subjectName: sub.name,
        subjectCode: sub.code,
        attended: counts.attended,
        total: counts.total,
        minimumPercentage: sub.minimum_attendance,
      });

      if (warning.severity === "CRITICAL" || warning.severity === "WARNING") {
        // Prevent duplicate alert if an unread alert with same title already exists
        const hasExisting = (existingNotifications || []).some(
          (n: any) => n.title === warning.title && !n.read
        );

        if (!hasExisting) {
          newNotificationsToInsert.push({
            user_id: user.id,
            title: warning.title,
            message: warning.message,
            type: warning.severity === "CRITICAL" ? "attendance_below_minimum" : "attendance_warning",
            read: false,
          });
        }
      }
    });

    if (newNotificationsToInsert.length > 0) {
      await supabase.from("notifications").insert(newNotificationsToInsert);
      revalidatePath("/notifications");
    }

    return { success: true, count: newNotificationsToInsert.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate alerts." };
  }
}