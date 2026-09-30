import { Loader2 } from "lucide-react";

export function LoadingState({ text = "Loading records..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground font-medium">{text}</p>
    </div>
  );
}
