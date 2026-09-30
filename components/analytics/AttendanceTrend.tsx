"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { type TrendChartItem } from "@/lib/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AttendanceTrend({ data }: { data: TrendChartItem[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-bold">Attendance Trajectory</CardTitle>
          <CardDescription className="text-xs">Log daily attendance to populate trend progression.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">Cumulative Attendance Trajectory</CardTitle>
        <CardDescription className="text-xs">Progression of overall attendance rate over academic timeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 25, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="cleanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={12} tickLine={false} dy={5} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} width={45} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Overall Rate"]}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cleanArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}