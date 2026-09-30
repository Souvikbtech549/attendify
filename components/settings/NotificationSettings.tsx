"use client";

import * as React from "react";
import { Bell, ShieldAlert, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationSettings() {
  const [shortageAlerts, setShortageAlerts] = React.useState(true);
  const [recoveryNotices, setRecoveryNotices] = React.useState(true);
  const [dailyReminders, setDailyReminders] = React.useState(true);

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Alert Preferences
        </CardTitle>
        <CardDescription>Control when and how in-app alerts are generated.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Attendance Shortage Warnings
            </span>
            <p className="text-[11px] text-muted-foreground">
              Notify when any course drops below your target percentage threshold.
            </p>
          </div>
          <input
            type="checkbox"
            checked={shortageAlerts}
            onChange={(e) => setShortageAlerts(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Safe Bunks Exhaustion
            </span>
            <p className="text-[11px] text-muted-foreground">
              Warn when safe bunks reach zero and further leaves will trigger shortage.
            </p>
          </div>
          <input
            type="checkbox"
            checked={recoveryNotices}
            onChange={(e) => setRecoveryNotices(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Daily Attendance Prompts
            </span>
            <p className="text-[11px] text-muted-foreground">
              Remind on dashboard when today&apos;s scheduled classes have not yet been marked.
            </p>
          </div>
          <input
            type="checkbox"
            checked={dailyReminders}
            onChange={(e) => setDailyReminders(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}