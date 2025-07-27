import logo from "@/public/logo.png";
import Image from "next/image";

export function SidebarHeader({ open = true }: { open: boolean }) {
  return (
    <div
      className={`
        flex items-center gap-8 
        ${open ? "px-2 py-3" : ""}
      `}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg  text-sidebar-accent">
        {/* <logo className="h-5 w-5" /> */}
        <Image src={logo} width={44} height={44} alt="logo" />
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
