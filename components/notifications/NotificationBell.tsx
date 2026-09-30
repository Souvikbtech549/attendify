"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ArrowRight, CheckCircle, Mail } from "lucide-react";
import {
  type NotificationRecord,
  getNotifications,
  toggleNotificationRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotes = async () => {
    const res = await getNotifications();
    if (res.data) {
      setNotifications(res.data.slice(0, 5));
      setUnreadCount(res.unreadCount);
    }
  };

  React.useEffect(() => {
    fetchNotes();
  }, []);

  const handleToggleItem = async (id: string, currentRead: boolean) => {
    const newStatus = !currentRead;
    // 0ms Optimistic UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: newStatus } : n))
    );
    setUnreadCount((prev) => (newStatus ? Math.max(0, prev - 1) : prev + 1));
    await toggleNotificationRead(id, newStatus);
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsAsRead();
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotes()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-2 shadow-2xl glass-card">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border mb-1">
          <span className="text-xs font-bold text-foreground">Notifications</span>
          {unreadCount > 0 ? (
            <button
              onClick={handleMarkAll}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          ) : (
            <Badge variant="safe" className="text-[10px] py-0">All clear</Badge>
          )}
        </div>

        <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No new alerts or warnings.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleToggleItem(n.id, n.read)}
                className={`p-2.5 text-xs space-y-1 rounded-lg cursor-pointer transition-colors hover:bg-muted/60 ${
                  !n.read ? "bg-muted/40 font-semibold" : "opacity-75"
                }`}
                title="Click to toggle read / unread"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate block">{n.title}</span>
                  {!n.read ? (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Read</span>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] line-clamp-2">{n.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border pt-2 text-center mt-1">
          <Link
            href="/notifications"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            View all notifications <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}