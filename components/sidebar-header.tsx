"use client"

import { Building2 } from "lucide-react"

export function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold text-sidebar-foreground">QIU System</span>
      </div>
    </div>
  )
}
