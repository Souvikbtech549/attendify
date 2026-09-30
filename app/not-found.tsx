import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Compass className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-3xl font-black text-primary">404</span>
          <h1 className="text-xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-xl font-bold gap-2 text-xs">
              <Home className="h-3.5 w-3.5" /> Go to Dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold gap-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
