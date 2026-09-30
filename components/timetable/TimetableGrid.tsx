"use client";

import * as React from "react";
import { Plus, Calendar } from "lucide-react";
import {
  type TimetableEntry,
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from "@/lib/timetable/actions";
import { type SubjectWithStats } from "@/lib/subjects/actions";
import { type TimetableFormValues } from "@/lib/validations/timetable";
import { TimetableCard } from "@/components/timetable/TimetableCard";
import { TimetableForm, DAYS_OF_WEEK } from "@/components/timetable/TimetableForm";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface TimetableGridProps {
  initialEntries: TimetableEntry[];
  subjects: SubjectWithStats[];
}

export function TimetableGrid({ initialEntries, subjects }: TimetableGridProps) {
  const [entries, setEntries] = React.useState<TimetableEntry[]>(initialEntries);
  const [activeMobileDay, setActiveMobileDay] = React.useState<number>(1);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<TimetableEntry | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const refreshData = async () => {
    const res = await getTimetable();
    if (res.data) setEntries(res.data);
  };

  const handleCreateOrUpdate = async (values: TimetableFormValues) => {
    if (editingEntry) {
      await updateTimetableEntry(editingEntry.id, values);
    } else {
      await createTimetableEntry(values);
    }
    await refreshData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await deleteTimetableEntry(deleteId);
    setDeleteId(null);
    setIsDeleting(false);
    await refreshData();
  };

  const entriesByDay = React.useMemo(() => {
    const map = new Map<number, TimetableEntry[]>();
    DAYS_OF_WEEK.forEach((d) => map.set(d.id, []));
    entries.forEach((e) => {
      const list = map.get(e.day_of_week) || [];
      list.push(e);
      map.set(e.day_of_week, list);
    });
    return map;
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Weekly Timetable</h2>
          <p className="text-sm text-muted-foreground">
            Schedule recurring class sessions and monitor room allocations.
          </p>
        </div>
        <Button
          onClick={() => { setEditingEntry(null); setDialogOpen(true); }}
          disabled={subjects.length === 0}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Class Slot
        </Button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Subjects Enrolled"
          description="You need to add subjects before scheduling timetable slots."
          actionLabel="Go to Subjects"
          onAction={() => (window.location.href = "/subjects")}
        />
      ) : (
        <>
          <div className="flex md:hidden overflow-x-auto pb-2 gap-1.5 scrollbar-none">
            {DAYS_OF_WEEK.map((d) => {
              const count = (entriesByDay.get(d.id) || []).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveMobileDay(d.id)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[4.5rem] py-2 px-3 rounded-lg border text-xs font-semibold transition-all shrink-0",
                    activeMobileDay === d.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  <span>{d.name.substring(0, 3)}</span>
                  <span className="text-[10px] opacity-80">{count} slots</span>
                </button>
              );
            })}
          </div>

          <div className="block md:hidden space-y-3">
            {(entriesByDay.get(activeMobileDay) || []).length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border rounded-xl bg-card">
                No classes scheduled for {DAYS_OF_WEEK.find((d) => d.id === activeMobileDay)?.name}.
              </div>
            ) : (
              (entriesByDay.get(activeMobileDay) || []).map((entry) => (
                <TimetableCard
                  key={entry.id}
                  entry={entry}
                  onEdit={(e) => { setEditingEntry(e); setDialogOpen(true); }}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))
            )}
          </div>

          <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-7 gap-3 items-start">
            {DAYS_OF_WEEK.map((d) => {
              const daySlots = entriesByDay.get(d.id) || [];
              return (
                <div key={d.id} className="rounded-xl border bg-muted/20 p-2.5 space-y-2 min-h-[380px]">
                  <div className="flex items-center justify-between border-b pb-2 px-1">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded">
                      {daySlots.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {daySlots.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-muted-foreground/60 italic">No classes</div>
                    ) : (
                      daySlots.map((entry) => (
                        <TimetableCard
                          key={entry.id}
                          entry={entry}
                          onEdit={(e) => { setEditingEntry(e); setDialogOpen(true); }}
                          onDelete={(id) => setDeleteId(id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <TimetableForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateOrUpdate}
        entry={editingEntry}
        subjects={subjects}
        defaultDay={activeMobileDay}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Timetable Slot?"
        description="Are you sure you want to remove this scheduled class slot from your timetable?"
        confirmLabel="Delete Slot"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}