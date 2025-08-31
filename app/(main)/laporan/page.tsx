"use client";
import { useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LabaRugiDropdown from "@/components/laporan/LabaRugiDropdown";
import SalesReport from "@/components/laporan/SalesDropdown";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import PurchaseDropdown from "@/components/laporan/PurchaseDropdown";

export default function LaporanPage() {
  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      <SidebarHeaderBar title="Laporan" />
      <div className="w-full max-w-full overflow-hidden">
        <Tabs defaultValue="labarugi" className="space-y-6 w-full max-w-full">
          <TabsList>
            <TabsTrigger value="labarugi">Laba Rugi</TabsTrigger>
            <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
            <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
          </TabsList>

          <TabsContent
            value="labarugi"
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            <div className="w-full max-w-full overflow-hidden">
              <LabaRugiDropdown />
            </div>
          </TabsContent>

          <TabsContent
            value="penjualan"
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            <div className="w-full max-w-full overflow-hidden">
              <SalesReport />
            </div>
          </TabsContent>

          <TabsContent
            value="pembelian"
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            <div className="w-full max-w-full overflow-hidden">
              <PurchaseDropdown />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
