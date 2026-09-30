import { getTimetable } from "@/lib/timetable/actions";
import { getSubjects } from "@/lib/subjects/actions";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";

export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const [timetableRes, subjectsRes] = await Promise.all([
    getTimetable(),
    getSubjects(),
  ]);

  return (
    <TimetableGrid
      initialEntries={timetableRes.data || []}
      subjects={subjectsRes.data || []}
    />
  );
}