import { getSemesters } from "@/lib/semesters/actions";
import { SemesterList } from "@/components/semesters/SemesterList";

export const dynamic = "force-dynamic";

export default async function SemestersPage() {
  const { data: semesters } = await getSemesters();
  return <SemesterList initialSemesters={semesters || []} />;
}