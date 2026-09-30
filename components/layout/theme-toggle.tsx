"use client";

import * as React from "react";
import { Palette, Check, Sparkles, Terminal, Flame, Sun, Moon, Feather, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const THEME_OPTIONS = [
  { id: "dark", name: "Cyber Midnight", color: "#06b6d4", icon: Moon, desc: "Modern Dark & Cyan" },
  { id: "onyx", name: "Onyx Minimal", color: "#6366f1", icon: Shield, desc: "Distraction-Free Pure Dark" },
  { id: "ivory", name: "Paper Ivory", color: "#0d9488", icon: Feather, desc: "Warm Minimal Japanese Light" },
  { id: "matrix", name: "Matrix Terminal", color: "#10b981", icon: Terminal, desc: "Phosphor Emerald Green" },
  { id: "synthwave", name: "Cyber Synthwave", color: "#f43f5e", icon: Sparkles, desc: "Obsidian & Neon Magenta" },
  { id: "amber", name: "Solar Gold", color: "#f59e0b", icon: Flame, desc: "Warm Amber Titanium" },
  { id: "light", name: "Nordic Frost", color: "#3b82f6", icon: Sun, desc: "Clean High-Contrast Light" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border" aria-label="Themes">
        <Palette className="h-4 w-4 text-primary" />
      </Button>
    );
  }

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border hover:bg-muted/80 transition-all"
          aria-label="Select theme"
        >
          <div className="relative flex items-center justify-center">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: currentOption.color }}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 glass-card p-1.5 shadow-2xl">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2 py-1 flex items-center justify-between">
          <span>Theme Presets</span>
          <span className="text-primary font-bold">{currentOption.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        {THEME_OPTIONS.map((t) => {
          const isSelected = theme === t.id;

          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                isSelected ? "bg-primary/15 text-primary font-bold" : "hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-semibold">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{t.desc}</span>
                </div>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}