"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger as ShadcnSidebarTrigger } from "@/components/ui/sidebar"

export function SidebarTrigger() {
  return (
    <ShadcnSidebarTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </ShadcnSidebarTrigger>
  )
}
