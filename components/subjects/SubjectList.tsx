"use client";

import * as React from "react";
import { Plus, BookOpen, Filter } from "lucide-react";
import {
  type SubjectWithStats,
  getSubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  deleteSubject,
} from "@/lib/subjects/actions";
import { type SemesterRecord } from "@/lib/semesters/actions";
import { type SubjectFormValues } from "@/lib/validations/subject";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface SubjectListProps {
  initialSubjects: SubjectWithStats[];
  semesters: SemesterRecord[];
}

export function SubjectList({ initialSubjects, semesters }: SubjectListProps) {
  const [subjects, setSubjects] = React.useState<SubjectWithStats[]>(initialSubjects);
  const activeSemesterId = semesters.find((s) => s.is_active)?.id || semesters[0]?.id || "";
  const [selectedSemester, setSelectedSemester] = React.useState<string>(activeSemesterId);
  const [showArchived, setShowArchived] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<SubjectWithStats | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const refreshData = React.useCallback(async () => {
    const res = await getSubjects(selectedSemester || undefined, showArchived);
    if (res.data) setSubjects(res.data);
  }, [selectedSemester, showArchived]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateOrUpdate = async (values: SubjectFormValues) => {
    if (editingSubject) {
      await updateSubject(editingSubject.id, values);
    } else {
      await createSubject(values);
    }
    await refreshData();
  };

  const handleArchive = async (id: string, archived: boolean) => {
    await archiveSubject(id, archived);
    await refreshData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await deleteSubject(deleteId);
    setDeleteId(null);
    setIsDeleting(false);
    await refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subjects & Courses</h2>
          <p className="text-sm text-muted-foreground">Monitor attendance standing, safe bunks, and recovery goals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {semesters.length > 0 && (
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          )}

          <Button
            onClick={() => { setEditingSubject(null); setDialogOpen(true); }}
            disabled={semesters.length === 0}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        </div>
      </div>

      {semesters.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Semesters Configured"
          description="Create an academic semester before adding your course subjects."
          actionLabel="Create Semester"
          onAction={() => (window.location.href = "/semesters")}
        />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Enrolled"
          description="Add subjects to this semester to calculate safe bunks and track daily attendance."
          actionLabel="Add Subject"
          onAction={() => { setEditingSubject(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              onEdit={(s) => { setEditingSubject(s); setDialogOpen(true); }}
              onArchive={handleArchive}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <SubjectForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateOrUpdate}
        subject={editingSubject}
        semesters={semesters}
        defaultSemesterId={selectedSemester}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Subject?"
        description="Are you sure you want to delete this subject? All associated daily attendance records, timetable slots, and grade points will be permanently deleted."
        confirmLabel="Delete Subject"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}