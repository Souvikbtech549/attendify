"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Terminal, Sparkles, Flame, Check, Palette, Feather, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const THEMES = [
  {
    id: "dark",
    name: "Cyber Midnight",
    category: "Technical Dark",
    color: "#06b6d4",
    icon: Moon,
    description: "Deep midnight slate with electric neon cyan highlights.",
  },
  {
    id: "onyx",
    name: "Onyx Minimal",
    category: "Ultra Clean",
    color: "#6366f1",
    icon: Shield,
    description: "Pure distraction-free monochrome dark theme with indigo accents.",
  },
  {
    id: "ivory",
    name: "Paper Ivory",
    category: "Warm Light",
    color: "#0d9488",
    icon: Feather,
    description: "Soothing minimalist Japanese stationery paper aesthetic with sage green accents.",
  },
  {
    id: "matrix",
    name: "Matrix Terminal",
    category: "Hacker Mode",
    color: "#10b981",
    icon: Terminal,
    description: "Pure dark canvas with glowing phosphor emerald green accents.",
  },
  {
    id: "synthwave",
    name: "Cyber Synthwave",
    category: "Retrowave",
    color: "#f43f5e",
    icon: Sparkles,
    description: "Obsidian violet canvas with electric neon magenta and purple glow.",
  },
  {
    id: "amber",
    name: "Solar Gold",
    category: "Warm Technical",
    color: "#f59e0b",
    icon: Flame,
    description: "Warm titanium charcoal canvas with molten laser amber highlights.",
  },
  {
    id: "light",
    name: "Nordic Frost",
    category: "Clean Light",
    color: "#3b82f6",
    icon: Sun,
    description: "Clean high-contrast daytime interface with crisp sapphire blue accents.",
  },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" /> Visual Themes & Interface Aesthetics
        </CardTitle>
        <CardDescription className="text-xs">
          Select your preferred interface color scheme. Themes apply across the entire workspace in real time.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-200 group overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t.category}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/20">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>

                <span className="font-bold text-sm text-foreground">{t.name}</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}