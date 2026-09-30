"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
        </label>
        <Input type="email" placeholder="student@university.edu" {...register("email")} disabled={isLoading} />
        {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
          </label>
          <Link href="/forgot-password" className="text-[11px] text-primary hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
        <Input type="password" placeholder="••••••••" {...register("password")} disabled={isLoading} />
        {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full h-10 shadow-sm" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In to Dashboard"}
      </Button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-card px-2 text-muted-foreground font-bold">Or Preview</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-10 border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs"
        onClick={() => {
          document.cookie = "demo_session=true; path=/; max-age=86400";
          router.push("/dashboard");
          router.refresh();
        }}
      >
        ⚡ Instant Demo Access (1-Click Preview)
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Create account
        </Link>
      </p>
    </form>
  );
}
