import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarCheck, ShieldAlert } from "lucide-react";
import { getSubjects } from "@/lib/subjects/actions";
import { calculateFullAttendanceMetrics } from "@/lib/calculations/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailsPage({ params }: Props) {
  const { id } = await params;
  const { data: subjects } = await getSubjects(undefined, true);
  const subject = subjects?.find((s) => s.id === id);

  if (!subject) {
    notFound();
  }

  const metrics = calculateFullAttendanceMetrics({
    attended: subject.attended_classes,
    total: subject.total_classes,
    minimumPercentage: subject.minimum_attendance,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/subjects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{subject.name}</h2>
            <Badge variant={metrics.isSafe ? "safe" : "critical"}>{metrics.isSafe ? "Safe" : "Critical"}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {subject.code && <span className="font-semibold uppercase">{subject.code} • </span>}
            {subject.teacher || "Instructor unassigned"} • {subject.credits} Credits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Current Attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-black text-foreground">{metrics.percentage.toFixed(1)}%</span>
            <p className="text-xs text-muted-foreground mt-1">{subject.attended_classes} of {subject.total_classes} classes</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Safe Leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{metrics.safeBunks}</span>
            <p className="text-xs text-muted-foreground mt-1">Classes you can safely miss</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400">Recovery Needed</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {metrics.recoveryClasses === Infinity ? "N/A" : metrics.recoveryClasses}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Consecutive classes to attend</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Attendance Target Progress</CardTitle>
          <CardDescription>Minimum required attendance: {subject.minimum_attendance}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={Math.min(100, metrics.percentage)} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-foreground">Target: {subject.minimum_attendance}%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}