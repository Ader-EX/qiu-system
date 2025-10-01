"use client";
import {useState} from "react";
import {
    FileText,
    Download,
    TrendingUp,
    BarChart3,
    PieChart,
    Plus,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import LabaRugiDropdown from "@/components/laporan/LabaRugiDropdown";
import SalesDropdown from "@/components/laporan/SalesDropdown";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import PurchaseDropdown from "@/components/laporan/PurchaseDropdown";
import StockAdjDropdown from "@/components/laporan/StockAdjDropdown";

export default function LaporanPage() {
    return (
        <div className="min-h-screen overflow-x-hidden">
            <SidebarHeaderBar title="Laporan"/>
            <div className="max-w-full overflow-x-hidden px-4">
                <Tabs defaultValue="labarugi" className="space-y-6 max-w-full">
                    <TabsList>
                        <TabsTrigger value="labarugi">Laba Rugi</TabsTrigger>
                        <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
                        <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
                        <TabsTrigger value="stock-card">Stock Card</TabsTrigger>
                    </TabsList>

                    <TabsContent value="labarugi" className="space-y-6 max-w-full">
                        <LabaRugiDropdown/>
                    </TabsContent>

                    <TabsContent value="stock-card" className="space-y-6 max-w-full">
                        <StockAdjDropdown/>
                    </TabsContent>

                    <TabsContent value="penjualan" className="min-w-0 overflow-x-hidden">
                        <div className="min-w-0">
                            <SalesDropdown/>
                        </div>
                    </TabsContent>


                    <TabsContent value="pembelian" className="space-y-6 max-w-full">
                        <PurchaseDropdown/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
