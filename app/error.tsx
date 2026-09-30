"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to monitoring service / server logs
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while loading this page. Our team has been notified. Please try again or return to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-xl font-bold gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl font-bold gap-2 text-xs"
            >
              <Home className="h-3.5 w-3.5" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
