import { getSubjects } from "@/lib/subjects/actions";
import { getSemesters } from "@/lib/semesters/actions";
import { SubjectList } from "@/components/subjects/SubjectList";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const [subjectsRes, semestersRes] = await Promise.all([
    getSubjects(),
    getSemesters(),
  ]);

  return (
    <SubjectList
      initialSubjects={subjectsRes.data || []}
      semesters={semestersRes.data || []}
    />
  );
}