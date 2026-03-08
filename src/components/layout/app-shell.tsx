"use client";

import { MobileTabBar, DesktopSidebar } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content area */}
      <main
        className="min-h-dvh pb-20 lg:pb-0 lg:pl-60"
      >
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}
