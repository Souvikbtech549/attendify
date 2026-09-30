import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Calculator,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Terminal,
  Activity,
  Award,
  Layers,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground bg-dot-pattern selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-card/60 backdrop-blur-2xl px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Attendify
              </span>
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
                Student Telemetry v2.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">Safe Bunk Math</a>
            <a href="#analytics" className="hover:text-cyan-400 transition-colors">Analytics Engine</a>
            <Link href="/calculator" className="text-cyan-400 hover:underline">Interactive Demo</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-foreground">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="text-xs font-bold shadow-glow-cyan bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36 border-b border-white/[0.08]">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Sparkles className="h-3.5 w-3.5" /> Pure Mathematical Accuracy • Zero Guesswork
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.08]">
            Master Your Academic Attendance with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Precision Telemetry.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Never get detained again. Calculate exact safe leaves, forecast recovery requirements, track semester schedules, and audit GPA with zero-latency speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-bold shadow-glow-cyan bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl gap-2">
              <Link href="/signup">
                Launch Live Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-mono font-bold rounded-xl border-white/10 hover:bg-white/5 gap-2">
              <Link href="/calculator">
                <Calculator className="h-4 w-4 text-cyan-400" /> Test Bunk Simulator
              </Link>
            </Button>
          </div>

          {/* Metrics Pill Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto font-mono text-left">
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Calculation Precision</span>
              <div className="text-xl font-black text-cyan-400">100% Exact</div>
              <span className="text-[11px] text-muted-foreground">Floor & Ceiling Math</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Optimistic Latency</span>
              <div className="text-xl font-black text-emerald-400">0 ms Lag</div>
              <span className="text-[11px] text-muted-foreground">Instant State Bursts</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Database Security</span>
              <div className="text-xl font-black text-blue-400">Postgres RLS</div>
              <span className="text-[11px] text-muted-foreground">Tenant Isolated</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Supported Platforms</span>
              <div className="text-xl font-black text-violet-400">PWA Ready</div>
              <span className="text-[11px] text-muted-foreground">Mobile & Desktop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-widest">
            Engineered For Students
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Next-Gen Academic Tooling
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to stay on top of your attendance, grades, and classes without spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-8 rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl shadow-glow-card space-y-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Safe Bunk Algorithm & Recovery Forecaster</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never gamble with minimum cutoff. Attendify uses pure mathematical equations to calculate how many classes you can skip without falling below requirement, or how many consecutive sessions you must attend to recover.
            </p>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 font-mono text-xs space-y-1 text-cyan-300">
              <code>Safe Bunks = floor((Attended - (Minimum% × Total)) / Minimum%)</code>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl shadow-glow-card space-y-4 group hover:border-emerald-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Interactive Daily Logger</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mark present or absent with a single tap. Zero server waiting time with optimistic updates and custom lecture notes.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl shadow-glow-card space-y-4 group hover:border-violet-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Visual Attendance Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Understand attendance trajectories over time, compare subjects side-by-side, and view risk tier distributions.
            </p>
          </div>

          <div className="md:col-span-2 p-8 rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl shadow-glow-card space-y-4 group hover:border-blue-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Full Academic Suite: Timetable, GPA, & PDF Reports</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Weekly class timetable with room assignments, credit-weighted GPA calculator (4.0 & 10.0 scale), and instant PDF/CSV export for university submissions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] py-8 px-6 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-foreground">Attendify SaaS</span> • Engineered for Student Success
          </div>
          <div>
            Built with Next.js 15, Tailwind CSS, & Supabase PostgreSQL.
          </div>
        </div>
      </footer>
    </div>
  );
}