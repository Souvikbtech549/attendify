import { getGrades } from "@/lib/grades/actions";
import { getSubjects } from "@/lib/subjects/actions";
import { GpaCalculator } from "@/components/gpa/GpaCalculator";

export const dynamic = "force-dynamic";

export default async function GpaPage() {
  const [gradesRes, subjectsRes] = await Promise.all([
    getGrades(),
    getSubjects(),
  ]);

  return (
    <GpaCalculator
      initialGrades={gradesRes.data || []}
      subjects={subjectsRes.data || []}
    />
  );
}