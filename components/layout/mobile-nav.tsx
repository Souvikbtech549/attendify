"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, CalendarCheck, Calculator,
  BarChart3, Clock, GraduationCap, FileText, Settings, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PRIMARY_MOBILE_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Log", href: "/attendance", icon: CalendarCheck },
  { label: "Calc", href: "/calculator", icon: Calculator },
];

const SECONDARY_MOBILE_ITEMS = [
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Timetable", href: "/timetable", icon: Clock },
  { label: "GPA Matrix", href: "/gpa", icon: GraduationCap },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-2xl px-2 py-1.5">
      <div className="flex items-center justify-around">
        {PRIMARY_MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-1 px-3 min-h-[44px] min-w-[44px] text-[10px] font-mono uppercase tracking-wider transition-colors",
                isActive
                  ? "text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon aria-hidden="true" className={cn("h-5 w-5", isActive ? "text-cyan-400" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More navigation options"
            className="flex flex-col items-center justify-center gap-1 rounded-xl py-1 px-3 min-h-[44px] min-w-[44px] text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
            <span>More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mb-2 w-48 glass-card">
            {SECONDARY_MOBILE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2.5 w-full py-2.5 min-h-[44px] text-xs font-semibold">
                    <Icon aria-hidden="true" className="h-4 w-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}