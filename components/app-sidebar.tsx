"use client";

import type * as React from "react";
import {
  LayoutDashboard,
  Package,
  Factory,
  Users,
  ShoppingCart,
  Receipt,
  FileText,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { SidebarHeader } from "@/components/sidebar-header";
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader as SidebarHeaderWrapper,
} from "@/components/ui/sidebar";
import ConditionalSidebarHeader from "./ConditionalSidebarHeader";

const data = {
  user: {
    name: "Admin QIU",
    email: "admin@qiu.com",
    avatar: "/admin-avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Produk",
      url: "/produk",
      icon: Package,
    },
    {
      title: "Vendor",
      url: "/vendor",
      icon: Factory,
    },
    {
      title: "Customer",
      url: "/customer",
      icon: Users,
    },
    {
      title: "Pembelian",
      url: "/pembelian",
      icon: ShoppingCart,
    },
    {
      title: "Penjualan",
      url: "/penjualan",
      icon: Receipt,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: FileText,
    },
    {
      title: "Pengaturan",
      url: "/pengaturan",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderWrapper>
        <ConditionalSidebarHeader />
      </SidebarHeaderWrapper>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
