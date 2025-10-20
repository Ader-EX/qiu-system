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
  CircleDollarSign,
  HandCoins,
  ArrowDownUp,
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
import { getRole, getUsername, UserRoleType } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

const allNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Item", url: "/item", icon: Package },
  { title: "Stock Adjustment", url: "/stock-adjustment", icon: ArrowDownUp },
  { title: "Pembelian", url: "/pembelian", icon: ShoppingCart },
  { title: "Penjualan", url: "/penjualan", icon: Receipt },
  { title: "Pembayaran", url: "/pembayaran", icon: CircleDollarSign },
  //   { title: "Pengembalian", url: "/pengembalian", icon: HandCoins },
  { title: "Vendor", url: "/vendor", icon: Factory },
  { title: "Customer", url: "/customer", icon: Users },
  { title: "Laporan", url: "/laporan", icon: FileText },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];
const roleDenyMap: Record<string, string[]> = {
  ADMIN: [], // Can see everything
  OWNER: [
    "Item",
    "Stock Adjustment",
    "Pembelian",
    "Penjualan",
    "Pembayaran",
    "Pengembalian",
    "Vendor",
    "Customer",
    "Pengaturan",
  ], // Only Dashboard & Laporan
  SUPERVISOR: ["Pembayaran", "Pengembalian"], // Can't see payment-related items
  STAFF: [
    "Pembelian",
    "Penjualan",
    "Pembayaran",
    "Pengembalian",
    "Vendor",
    "Customer",
    "Laporan",
    "Pengaturan",
  ], // Limited access
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = useState<UserRoleType | undefined>();
  const [name, setName] = useState<string | undefined>();
  console.log("Role:", role);
  console.log("Name:", name);

  useEffect(() => {
    const r = getRole();
    const n = getUsername();
    if (!r || !n) {
      window.location.href = "/login";
      return;
    }
    setRole(r);
    setName(n);
  }, []);

  if (!role || !name) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Spinner />
      </div>
    );
  }
  const accessibleNav = allNavItems.filter(
    (item) => !roleDenyMap[role]?.includes(item.title)
  );

  const data = {
    user: {
      name,
      email: role,
    },
    navMain: accessibleNav,
  };

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
