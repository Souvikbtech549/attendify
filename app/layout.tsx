import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWARegister } from "@/components/providers/pwa-register";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://attendify.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Attendance Tracker – Smart Student Attendance Management",
    template: "%s | Attendify",
  },
  description: "Next-generation attendance tracking, analytics, and safe bunk calculator for students.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.svg",
    apple: "/icons/icon-192x192.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["dark", "onyx", "ivory", "matrix", "synthwave", "amber", "light", "system"]}
          enableSystem
          disableTransitionOnChange
        >
          <PWARegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}