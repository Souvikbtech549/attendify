"use client";

import * as React from "react";
import { Bell, CheckCheck, Mail, Sparkles } from "lucide-react";
import {
  type NotificationRecord,
  getNotifications,
  toggleNotificationRead,
  markAllNotificationsAsRead,
  markAllNotificationsAsUnread,
  deleteNotification,
} from "@/lib/notifications/actions";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function NotificationList({
  initialNotifications,
}: {
  initialNotifications: NotificationRecord[];
}) {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>(initialNotifications);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const handleToggleRead = async (id: string, newReadStatus: boolean) => {
    // 0ms Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: newReadStatus } : n))
    );
    await toggleNotificationRead(id, newReadStatus);
  };

  const handleMarkAllRead = async () => {
    // 0ms Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead();
  };

  const handleMarkAllUnread = async () => {
    // 0ms Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
    await markAllNotificationsAsUnread();
  };

  const handleDelete = async (id: string) => {
    // 0ms Optimistic deletion
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredItems = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Notifications & Alerts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Attendance shortage alerts, recovery forecasts, and system notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
            >
              <CheckCheck className="h-4 w-4 text-primary" /> Mark All Read
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllUnread}
              className="gap-1.5 text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
            >
              <Mail className="h-4 w-4 text-muted-foreground" /> Mark All Unread
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
            filter === "unread" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
            filter === "read" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notification Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No Unread Notifications" : "All Caught Up!"}
          description={
            filter === "unread"
              ? "You have marked all alerts as read. Switch to 'All' or 'Read' to view past notices."
              : "You have no attendance shortage warnings or system notices."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onToggleRead={handleToggleRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}