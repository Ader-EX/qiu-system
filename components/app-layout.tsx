"use client";

import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
// import { TopBar } from "@/components/top-bar"; // optional
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      {/* Layout must be a normal flex row, not w-screen */}
      <div className="flex w-full max-w-full overflow-x-hidden min-h-screen">
        {/* Sidebar is a fixed width block; do NOT use w-screen here */}
        <AppSidebar />

        {/* Content pane: allow shrink and clamp overflow */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {/* If your pages use px-4 padding, do the full-bleed trick here */}
          <div className="min-w-0 p-4 pt-0">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
