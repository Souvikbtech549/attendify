"use client";

import * as React from "react";
import { Plus, Calendar, Sparkles, Layers } from "lucide-react";
import {
  type SemesterRecord,
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  setActiveSemester,
} from "@/lib/semesters/actions";
import { type SemesterFormValues } from "@/lib/validations/semester";
import { SemesterCard } from "@/components/semesters/SemesterCard";
import { SemesterForm } from "@/components/semesters/SemesterForm";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

export function SemesterList({ initialSemesters }: { initialSemesters: SemesterRecord[] }) {
  const [semesters, setSemesters] = React.useState<SemesterRecord[]>(initialSemesters);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSemester, setEditingSemester] = React.useState<SemesterRecord | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const refreshData = async () => {
    const res = await getSemesters();
    if (res.data) setSemesters(res.data);
  };

  const handleCreateOrUpdate = async (values: SemesterFormValues) => {
    if (editingSemester) {
      // Optimistic update
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === editingSemester.id
            ? {
                ...s,
                name: values.name,
                academic_year: values.academic_year,
                target_attendance: values.target_attendance,
                is_active: values.is_active,
                start_date: values.start_date || null,
                end_date: values.end_date || null,
              }
            : values.is_active
            ? { ...s, is_active: false }
            : s
        )
      );
      await updateSemester(editingSemester.id, values);
    } else {
      const res = await createSemester(values);
      if (res.data) {
        setSemesters((prev) => [
          res.data,
          ...(values.is_active ? prev.map((s) => ({ ...s, is_active: false })) : prev),
        ]);
      }
    }
    await refreshData();
  };

  const handleSetActive = async (id: string) => {
    // Optimistic activation
    setSemesters((prev) =>
      prev.map((s) => ({ ...s, is_active: s.id === id }))
    );
    await setActiveSemester(id);
    await refreshData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    // Optimistic delete
    setSemesters((prev) => prev.filter((s) => s.id !== deleteId));
    await deleteSemester(deleteId);
    setDeleteId(null);
    setIsDeleting(false);
    await refreshData();
  };

  const activeSemester = semesters.find((s) => s.is_active);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Academic Semesters</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add custom semesters manually, set target criteria, and switch your active tracking term.
          </p>
        </div>
        <Button
          onClick={() => { setEditingSemester(null); setDialogOpen(true); }}
          className="gap-2 shrink-0 rounded-xl font-semibold bg-primary text-primary-foreground shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Semester Manually
        </Button>
      </div>

      {semesters.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Semesters Added"
          description="Click below to manually add your current semester (e.g. Semester 1, Semester 5, Spring 2026)."
          actionLabel="Add Semester Manually"
          onAction={() => { setEditingSemester(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Total Terms: <strong className="text-foreground">{semesters.length}</strong></span>
            {activeSemester && (
              <span>Active Tracking Term: <strong className="text-primary">{activeSemester.name}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((s) => (
              <SemesterCard
                key={s.id}
                semester={s}
                onEdit={(sem) => { setEditingSemester(sem); setDialogOpen(true); }}
                onDelete={(id) => setDeleteId(id)}
                onSetActive={handleSetActive}
              />
            ))}
          </div>
        </div>
      )}

      <SemesterForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateOrUpdate}
        semester={editingSemester}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Semester?"
        description="Are you sure you want to delete this semester? All associated courses, timetable slots, and attendance records will be removed."
        confirmLabel="Delete Semester"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}