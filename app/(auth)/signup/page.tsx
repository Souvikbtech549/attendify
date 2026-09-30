import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for Attendify to track courses, timetable, GPA, and safe bunks.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-md">
            A
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Student Account</h2>
          <p className="text-xs text-muted-foreground">Start tracking your attendance with zero-trust PostgreSQL security.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
