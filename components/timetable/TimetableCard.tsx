"use client";

import { Clock, MapPin, User, Edit2, Trash2 } from "lucide-react";
import { type TimetableEntry } from "@/lib/timetable/actions";
import { Button } from "@/components/ui/button";

interface TimetableCardProps {
  entry: TimetableEntry;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

export function TimetableCard({ entry, onEdit, onDelete }: TimetableCardProps) {
  const formatTime = (t: string) => t.substring(0, 5);

  return (
    <div className="group relative flex flex-col justify-between p-3 rounded-lg border bg-card/80 hover:bg-card shadow-sm transition-all hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-3.5 w-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: entry.subjects.color }} />
          <div className="space-y-0.5 min-w-0">
            <h4 className="font-bold text-xs truncate leading-tight text-foreground">{entry.subjects.name}</h4>
            {entry.subjects.code && (
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{entry.subjects.code}</span>
            )}
          </div>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onEdit(entry)} title="Edit slot">
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => onDelete(entry.id)} title="Delete slot">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-muted-foreground border-t pt-2">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Clock className="h-3 w-3 text-primary shrink-0" />
          <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
        </div>
        {entry.room && (
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{entry.room}</span>
          </div>
        )}
        {entry.subjects.teacher && (
          <div className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{entry.subjects.teacher}</span>
          </div>
        )}
      </div>
    </div>
  );
}