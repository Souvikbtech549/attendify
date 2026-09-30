"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import {
  type AttendanceHistoryItem,
  getAttendanceForDate,
  logAttendance,
  unmarkAttendance,
  getRecentAttendance,
} from "@/lib/attendance/actions";
import { AttendanceRow } from "@/components/attendance/AttendanceRow";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

interface AttendanceLoggerProps {
  subjects: SubjectWithStats[];
  initialHistory: AttendanceHistoryItem[];
}

export function AttendanceLogger({ subjects, initialHistory }: AttendanceLoggerProps) {
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dateRecords, setDateRecords] = React.useState<Map<string, { status: "present" | "absent"; notes?: string }>>(new Map());
  const [history, setHistory] = React.useState<AttendanceHistoryItem[]>(initialHistory);

  const fetchForDate = async (dateStr: string) => {
    const res = await getAttendanceForDate(dateStr);
    const map = new Map<string, { status: "present" | "absent"; notes?: string }>();
    (res.data || []).forEach((r: any) => {
      map.set(r.subject_id, { status: r.status as "present" | "absent", notes: r.notes || "" });
    });
    setDateRecords(map);
  };

  React.useEffect(() => {
    fetchForDate(selectedDate);
  }, [selectedDate]);

  const handleMark = async (subjectId: string, status: "present" | "absent", notes?: string) => {
    await logAttendance({
      subject_id: subjectId,
      date: selectedDate,
      status,
      notes,
    });
    await fetchForDate(selectedDate);
    const recent = await getRecentAttendance();
    if (recent.data) setHistory(recent.data);
  };

  const handleUnmark = async (subjectId: string) => {
    await unmarkAttendance(subjectId, selectedDate);
    await fetchForDate(selectedDate);
    const recent = await getRecentAttendance();
    if (recent.data) setHistory(recent.data);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Attendance Logger</h2>
          <p className="text-sm text-muted-foreground">Record and manage class attendance for your active subjects.</p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 text-xs h-9"
          />
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Enrolled"
          description="You need to add subjects to your semester before you can log daily attendance."
          actionLabel="Go to Subjects"
          onAction={() => (window.location.href = "/subjects")}
        />
      ) : (
        <div className="space-y-3">
          {subjects.map((sub) => {
            const entry = dateRecords.get(sub.id);
            return (
              <AttendanceRow
                key={sub.id}
                subject={sub}
                currentStatus={entry?.status}
                currentNotes={entry?.notes}
                onMark={handleMark}
                onUnmark={handleUnmark}
              />
            );
          })}
        </div>
      )}

      <div className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-foreground">Recent Activity Logs</h3>
        <AttendanceHistory records={history} />
      </div>
    </div>
  );
}