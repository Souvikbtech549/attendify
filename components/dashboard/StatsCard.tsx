import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "safe" | "warning" | "critical" | "cyan";
  trend?: string;
}

export function StatsCard({ title, value, description, icon: Icon, variant = "default", trend }: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "safe":
        return {
          border: "hover:border-emerald-500/40 hover:shadow-glow-emerald",
          iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          valColor: "text-emerald-400",
        };
      case "warning":
        return {
          border: "hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          valColor: "text-amber-400",
        };
      case "critical":
        return {
          border: "hover:border-rose-500/40 hover:shadow-glow-rose",
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          valColor: "text-rose-400",
        };
      case "cyan":
        return {
          border: "hover:border-cyan-500/40 hover:shadow-glow-cyan",
          iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          valColor: "text-cyan-400",
        };
      default:
        return {
          border: "hover:border-blue-500/40 hover:shadow-glow-blue",
          iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          valColor: "text-foreground",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 group", styles.border)}>
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-bl-full pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className={cn("p-2.5 rounded-xl border transition-transform group-hover:scale-110 duration-200", styles.iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className={cn("text-2xl sm:text-3xl font-black font-mono tracking-tight", styles.valColor)}>
            {value}
          </div>
          {trend && (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}