import { getAnalyticsData } from "@/lib/analytics/actions";
import { getSemesters } from "@/lib/semesters/actions";
import { AnalyticsContainer } from "@/components/analytics/AnalyticsContainer";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [analyticsRes, semestersRes] = await Promise.all([
    getAnalyticsData(),
    getSemesters(),
  ]);

  return (
    <AnalyticsContainer
      initialData={analyticsRes.data}
      semesters={semestersRes.data || []}
    />
  );
}