"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black">Application Error</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A critical error occurred. Please refresh the page or try again in a few moments.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="rounded-xl font-bold gap-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
