import { getDashboardData } from "@/lib/dashboard/actions";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data, error } = await getDashboardData();

  if (error || !data) {
    return (
      <EmptyState
        title="Dashboard Unavailable"
        description="Could not load your dashboard. Please sign in or check your connection."
      />
    );
  }

  return <DashboardGrid data={data} />;
}