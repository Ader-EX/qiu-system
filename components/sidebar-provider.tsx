"use client"

import type React from "react"

import { SidebarProvider as ShadcnSidebarProvider } from "@/components/ui/sidebar"
import { SidebarContextProvider } from "@/contexts/sidebar-context"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarContextProvider>
      <ShadcnSidebarProvider>{children}</ShadcnSidebarProvider>
    </SidebarContextProvider>
  )
}
