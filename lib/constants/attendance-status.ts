import { getAttendanceStatus } from "@/lib/calculations/attendance";

export interface StatusConfig {
  label: string;
  badgeVariant: "safe" | "warning" | "critical";
  colorHex: string;
}

export const ATTENDANCE_STATUS_MAP: Record<"safe" | "warning" | "critical", StatusConfig> = {
  safe: {
    label: "Safe",
    badgeVariant: "safe",
    colorHex: "#10b981",
  },
  warning: {
    label: "Warning",
    badgeVariant: "warning",
    colorHex: "#f59e0b",
  },
  critical: {
    label: "Critical",
    badgeVariant: "critical",
    colorHex: "#ef4444",
  },
};

export function getAttendanceMetrics(
  attended: number,
  total: number,
  minimumPercentage: number = 75
) {
  const tier = getAttendanceStatus(attended, total, minimumPercentage);
  const config = ATTENDANCE_STATUS_MAP[tier];
  return { tier, ...config };
}
