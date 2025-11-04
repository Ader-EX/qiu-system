"use client";

import {
  Package,
  Users,
  ShoppingCart,
  Receipt,
  TrendingUp,
  DollarSign,
  Tag,
  ShoppingBag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useEffect, useState } from "react";
import { utilsService } from "@/services/utilsService";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface DashboardStats {
    total_products: number;
    total_brands: number;
    total_jenis_barang: number;
    total_customers: number;
    total_vendors: number;
    total_item_terjual: number;
    total_pembelian_value: number;
    total_pembelian_count: number;
    total_penjualan_value: number;
    total_penjualan_count: number;
    total_hpp: number;
    total_profit: number;
}

export interface DailyRevenueData {
  date: string;
  penjualan: number;
  pembelian: number;
}

export interface DailyProfitData {
  date: string;
  profit: number;
  cumulative_profit: number;
}

export interface ChartData {
  revenue_chart: DailyRevenueData[];
  profit_chart: DailyProfitData[];
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const formatCompactMoney = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return formatNumber(value);
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7days" | "30days" | "month">("month");
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stats, charts] = await Promise.all([
          utilsService.getStatistics(period),
          utilsService.getChartData(period),
        ]);
        setDashboardData(stats);
        setChartData(charts);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SidebarHeaderBar title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !dashboardData || !chartData) {
    return (
      <div className="space-y-6">
        <SidebarHeaderBar title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">
              {error || "Failed to load data"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SidebarHeaderBar title="Dashboard" />
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ringkasan Eksekutif */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ringkasan Eksekutif</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Item</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_products)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Brand</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_brands)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Item Terjual</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_item_terjual)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customer</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_customers)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Vendor</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_vendors)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Jenis Barang</p>
                  <p className="text-3xl font-bold">{formatNumber(dashboardData.total_jenis_barang)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

   

      {/* Ringkasan Keuangan */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ringkasan Keuangan</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Penjualan</p>
                  <p className="text-3xl font-bold">{formatMoney(dashboardData.total_penjualan_value)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Pembelian</p>
                  <p className="text-3xl font-bold">{formatMoney(dashboardData.total_pembelian_value)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total HPP</p>
                  <p className="text-3xl font-bold">{formatMoney(dashboardData.total_hpp)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profit / Loss</p>
                  <p className={`text-3xl font-bold ${dashboardData.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(dashboardData.total_profit)}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${dashboardData.total_profit >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                  <DollarSign className={`h-6 w-6 ${dashboardData.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

   {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Comparison</CardTitle>
            <CardDescription>Daily Penjualan vs Pembelian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenue_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCompactMoney} />
                <Tooltip 
                  formatter={(value: number) => formatMoney(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
                />
                <Legend />
                <Bar dataKey="penjualan" fill="#10b981" name="Penjualan" />
                <Bar dataKey="pembelian" fill="#3b82f6" name="Pembelian" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Tracking</CardTitle>
            <CardDescription>Daily & Cumulative Profit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.profit_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCompactMoney} />
                <Tooltip 
                  formatter={(value: number) => formatMoney(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  name="Daily Profit"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative_profit" 
                  stroke="#3b82f6" 
                  name="Cumulative"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Akses cepat ke fitur yang sering digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href={"/item"}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            >
              <Package className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Tambah Produk</p>
            </Link>
            <Link
              href={"/pembelian/add"}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Buat Pembelian</p>
            </Link>
            <Link
              href={"/penjualan/add"}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            >
              <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Buat Penjualan</p>
            </Link>
            <Link
              href={"/customer"}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Tambah Customer</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}