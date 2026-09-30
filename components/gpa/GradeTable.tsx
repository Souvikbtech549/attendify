"use client";

import { Trash2 } from "lucide-react";
import { type GradeRecord } from "@/lib/grades/actions";
import { type GpaScale, getGradePoints } from "@/lib/calculations/gpa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GradeTableProps {
  grades: GradeRecord[];
  scale: GpaScale;
  onDelete: (id: string) => void;
}

export function GradeTable({ grades, scale, onDelete }: GradeTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-center">Credits</th>
              <th className="py-3 px-4 text-center">Letter Grade</th>
              <th className="py-3 px-4 text-center">Grade Points</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {grades.map((item) => {
              let points = 0;
              try {
                points = getGradePoints(item.grade, scale);
              } catch {
                points = 0;
              }

              return (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.subjects.color }}
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          {item.subjects.name}
                        </span>
                        {item.subjects.code && (
                          <span className="text-[10px] uppercase text-muted-foreground">
                            {item.subjects.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-foreground">
                    {item.credits}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant="secondary" className="font-bold text-xs">
                      {item.grade}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-primary">
                    {points.toFixed(1)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(item.id)}
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}