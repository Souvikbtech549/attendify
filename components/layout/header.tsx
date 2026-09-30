"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings as SettingsIcon, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { NAV_ITEMS } from "./sidebar";

export function Header() {
  const pathname = usePathname();
  const currentNav = NAV_ITEMS.find((item) => item.href === pathname) || { label: "Command Center" };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/90 px-4 md:px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{currentNav.label}</h1>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Sync Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link href="/calculator" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors">
          <Zap className="h-3.5 w-3.5 text-primary" /> Bunk Simulator
        </Link>

        <NotificationBell />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full border border-border hover:bg-muted/60">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                SV
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card p-1 shadow-lg">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Souvik</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">uniquesigmascholar@gmail.com</p>
            </div>
            <DropdownMenuGroup className="py-1">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs font-medium py-2">
                  <SettingsIcon className="h-4 w-4 text-primary" /> Account Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <div className="border-t border-border pt-1">
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center gap-2 text-destructive cursor-pointer text-xs font-medium py-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}