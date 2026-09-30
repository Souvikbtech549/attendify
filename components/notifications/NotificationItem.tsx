"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  Info,
  CheckCircle,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";
import { type NotificationRecord, type AppNotificationType } from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationRecord;
  onToggleRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onToggleRead,
  onDelete,
}: NotificationItemProps) {
  const getIcon = (type: AppNotificationType) => {
    switch (type) {
      case "attendance_below_minimum":
        return <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />;
      case "attendance_warning":
      case "recovery_warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "attendance_reminder":
        return <CalendarCheck className="h-5 w-5 text-primary shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground shrink-0" />;
    }
  };

  const getBgStyle = (type: AppNotificationType, read: boolean) => {
    if (read) return "bg-card/60 border-border/60 text-muted-foreground";
    if (type === "attendance_below_minimum") return "bg-rose-500/10 border-rose-500/30";
    if (type === "attendance_warning" || type === "recovery_warning") return "bg-amber-500/10 border-amber-500/30";
    return "bg-primary/5 border-primary/20";
  };

  let formattedTime = "";
  try {
    formattedTime = formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true });
  } catch {
    formattedTime = "Recently";
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 gap-4 group shadow-sm",
        getBgStyle(notification.type, notification.read)
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="mt-0.5">{getIcon(notification.type)}</div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "text-sm font-bold truncate",
                notification.read ? "text-muted-foreground font-semibold" : "text-foreground"
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
          <span className="text-[11px] text-muted-foreground/80 block pt-0.5 font-medium">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Action Buttons: Toggle Read / Unread + Delete */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 text-xs font-semibold rounded-xl transition-colors",
            notification.read
              ? "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              : "border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
          )}
          onClick={() => onToggleRead(notification.id, !notification.read)}
          title={notification.read ? "Mark as unread" : "Mark as read"}
        >
          {notification.read ? (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Mark Unread
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" /> Mark Read
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}