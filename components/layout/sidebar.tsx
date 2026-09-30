"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, CalendarCheck, Calculator,
  BarChart3, Clock, GraduationCap, FileText, Settings, LogOut,
  Sparkles, GraduationCap as AcademicIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Timetable", href: "/timetable", icon: Clock },
  { label: "GPA Matrix", href: "/gpa", icon: GraduationCap },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside aria-label="Main Navigation" className="hidden md:flex h-screen w-64 flex-col border-r border-border/80 bg-card/95 backdrop-blur-xl sticky top-0 z-30">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground">
              Attendify
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Student Attendance
            </span>
          </div>
        </Link>
      </div>

      {/* Active Semester Banner */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted/60 border border-border/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground font-medium">Active Term</span>
          </div>
          <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded-md border border-border/60">
            Spring 2026
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Sidebar Menu" className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border/80 mt-auto bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
              SV
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold truncate text-foreground">Souvik</span>
              <span className="text-xs text-muted-foreground truncate">Student Account</span>
            </div>
          </div>
          <Link href="/login" aria-label="Sign Out">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}