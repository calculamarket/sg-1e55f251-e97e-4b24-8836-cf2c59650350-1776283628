import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeSwitch } from "@/components/ThemeSwitch";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-background md:flex-row">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[var(--xp-peach)] opacity-70 blur-sm" />
        <div className="pointer-events-none absolute -bottom-44 -left-44 h-[26rem] w-[26rem] rounded-full bg-[var(--xp-lilac)] opacity-70 blur-sm" />
        <div className="pointer-events-none absolute right-[18%] top-[42%] h-72 w-72 rounded-full bg-[var(--xp-mint)] opacity-50 blur-sm" />
        <Sidebar />
        <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-end mb-6">
              <ThemeSwitch />
            </div>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
