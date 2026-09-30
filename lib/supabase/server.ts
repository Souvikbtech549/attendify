import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  const isDemo = cookieStore.get("demo_session")?.value === "true" || supabaseUrl.includes("demo-project") || supabaseUrl.includes("placeholder");

  const client = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled in server component context
          }
        },
      },
    }
  ) as any;

  if (isDemo) {
    // Instant 0ms response for demo session to prevent DNS timeout latency
    client.auth = {
      ...client.auth,
      getUser: async () => ({
        data: {
          user: {
            id: "demo-user",
            email: "student@university.edu",
            user_metadata: { full_name: "Souvik" },
          },
        },
        error: null,
      }),
      getSession: async () => ({
        data: {
          session: {
            user: { id: "demo-user", email: "student@university.edu" },
          },
        },
        error: null,
      }),
    };
  }

  return client;
}