import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground bg-dot-pattern">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto focus:outline-none">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}