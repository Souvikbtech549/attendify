import { getUserSettings } from "@/lib/settings/actions";
import { getSemesters } from "@/lib/semesters/actions";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settingsRes, semestersRes] = await Promise.all([
    getUserSettings(),
    getSemesters(),
  ]);

  if (settingsRes.error || !settingsRes.data) {
    return (
      <EmptyState
        title="Settings Unavailable"
        description="Could not load your user settings. Please refresh or check authentication."
      />
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Account & Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Manage your student profile, attendance thresholds, alert rules, and visual theme.
        </p>
      </div>

      <div className="space-y-6">
        <ProfileSettings
          settings={settingsRes.data}
          semesters={semestersRes.data || []}
        />
        <AppearanceSettings />
        <NotificationSettings />
      </div>
    </div>
  );
}