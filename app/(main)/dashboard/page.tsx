"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  PlusIcon,
  DownloadIcon,
  Plus,
  Download,
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
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DashboardData, utilsService } from "@/services/utilsService";
import { Spinner } from "@/components/ui/spinner";

const getStatusIcon = (status: string, percentage: number) => {
  switch (status) {
    case "up":
      return <TrendingUp className="h-3 w-3 mr-1" />;
    case "down":
      return <TrendingDown className="h-3 w-3 mr-1" />;
    default:
      return <TrendingUp className="h-3 w-3 mr-1" />;
  }
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "up":
      return "text-green-600";
    case "down":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await utilsService.getStatistics();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (error || !dashboardData) {
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
      <SidebarHeaderBar title="Dashboard" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData.total_products)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`flex items-center ${getStatusColor(
                  dashboardData.status_month_products
                )}`}
              >
                {getStatusIcon(
                  dashboardData.status_month_products,
                  dashboardData.percentage_month_products
                )}
                {dashboardData.status_month_products === "up"
                  ? "+"
                  : dashboardData.status_month_products === "down"
                  ? "-"
                  : ""}
                {Math.abs(dashboardData.percentage_month_products).toFixed(1)}%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customer
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData.total_customer)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`flex items-center ${getStatusColor(
                  dashboardData.status_month_customer
                )}`}
              >
                {getStatusIcon(
                  dashboardData.status_month_customer,
                  dashboardData.percentage_month_customer
                )}
                {dashboardData.status_month_customer === "up"
                  ? "+"
                  : dashboardData.status_month_customer === "down"
                  ? "-"
                  : ""}
                {Math.abs(dashboardData.percentage_month_customer).toFixed(1)}%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pembelian Bulan Ini
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(Number(dashboardData.total_pembelian))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`flex items-center ${getStatusColor(
                  dashboardData.status_month_pembelian
                )}`}
              >
                {getStatusIcon(
                  dashboardData.status_month_pembelian,
                  dashboardData.percentage_month_pembelian
                )}
                {dashboardData.status_month_pembelian === "up"
                  ? "+"
                  : dashboardData.status_month_pembelian === "down"
                  ? "-"
                  : ""}
                {Math.abs(dashboardData.percentage_month_pembelian).toFixed(1)}%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan Bulan Ini
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(Number(dashboardData.total_penjualan))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`flex items-center ${getStatusColor(
                  dashboardData.status_month_penjualan
                )}`}
              >
                {getStatusIcon(
                  dashboardData.status_month_penjualan,
                  dashboardData.percentage_month_penjualan
                )}
                {dashboardData.status_month_penjualan === "up"
                  ? "+"
                  : dashboardData.status_month_penjualan === "down"
                  ? "-"
                  : ""}
                {Math.abs(dashboardData.percentage_month_penjualan).toFixed(1)}%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grafik Penjualan & Pembelian
            </CardTitle>
            <CardDescription>
              Perbandingan penjualan dan pembelian 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              [Chart akan ditampilkan di sini]
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Transaksi dan aktivitas sistem terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Penjualan baru #SO-001</p>
                  <p className="text-xs text-muted-foreground">
                    2 menit yang lalu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Produk baru ditambahkan</p>
                  <p className="text-xs text-muted-foreground">
                    15 menit yang lalu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Pembelian #PO-002 diproses
                  </p>
                  <p className="text-xs text-muted-foreground">
                    1 jam yang lalu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer baru terdaftar</p>
                  <p className="text-xs text-muted-foreground">
                    3 jam yang lalu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Stok produk menipis</p>
                  <p className="text-xs text-muted-foreground">
                    5 jam yang lalu
                  </p>
                </div>
              </div>
            </div>
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
