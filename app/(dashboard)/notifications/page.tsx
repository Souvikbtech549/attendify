import { getNotifications, checkAndGenerateAttendanceAlerts } from "@/lib/notifications/actions";
import { NotificationList } from "@/components/notifications/NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await checkAndGenerateAttendanceAlerts();
  const { data: initialNotifications } = await getNotifications();

  return <NotificationList initialNotifications={initialNotifications || []} />;
}