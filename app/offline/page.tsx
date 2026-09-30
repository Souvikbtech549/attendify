"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 border">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">You are currently offline</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Attendify requires an active internet connection to securely sync your attendance records with Supabase.
      </p>
      <Button onClick={() => window.location.reload()} className="mt-6 gap-2 text-xs h-9">
        <RefreshCw className="h-4 w-4" /> Try Reconnecting
      </Button>
    </div>
  );
}