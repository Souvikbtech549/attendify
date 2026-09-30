import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/20 text-primary border-primary/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive: "border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
        outline: "text-foreground border-border",
        safe: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
        critical: "border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
        cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = true, children, ...props }: BadgeProps) {
  const getDotColor = () => {
    switch (variant) {
      case "safe":
        return "bg-emerald-400";
      case "warning":
        return "bg-amber-400";
      case "critical":
      case "destructive":
        return "bg-rose-400";
      case "cyan":
        return "bg-cyan-400";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", getDotColor())} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };