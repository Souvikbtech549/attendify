"use client";

import { format, parseISO } from "date-fns";
import { Check, X, Calendar } from "lucide-react";
import { type AttendanceHistoryItem } from "@/lib/attendance/actions";
import { Badge } from "@/components/ui/badge";

export function AttendanceHistory({ records }: { records: AttendanceHistoryItem[] }) {
  if (records.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground border rounded-xl bg-card">
        No recent attendance logs recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Subject</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-4 font-medium text-foreground">
                  {format(parseISO(r.date), "MMM dd, yyyy")}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.subjects.color }} />
                    <span className="font-semibold text-foreground">{r.subjects.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <Badge variant={r.status === "present" ? "safe" : "critical"} className="text-[10px] py-0">
                    {r.status === "present" ? (
                      <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Present</span>
                    ) : (
                      <span className="flex items-center gap-1"><X className="h-3 w-3" /> Absent</span>
                    )}
                  </Badge>
                </td>
                <td className="py-2.5 px-4 text-muted-foreground truncate max-w-xs">{r.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}