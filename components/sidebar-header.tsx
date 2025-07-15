"use client";

import { Building2 } from "lucide-react";

export function SidebarHeader({ open = true }: { open: boolean }) {
  return (
    <div
      className={`
        flex items-center gap-8 border-b-2
        ${open ? "px-2 py-3" : ""}
      `}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg  text-sidebar-accent">
        <Building2 className="h-5 w-5" />
      </div>

      {open && (
        <div className="flex items-center">
          <span className="text-lg font-bold text-sidebar-foreground">
            QIU SYSTEM
          </span>
        </div>
      )}
    </div>
  );
}
