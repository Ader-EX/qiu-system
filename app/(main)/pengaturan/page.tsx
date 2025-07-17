"use client"

import { Settings, Package, DollarSign, CreditCard, Warehouse, Ruler } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const settingsItems = [
  {
    title: "Kategori 1",
    description: "Kelola kategori produk tingkat pertama",
    icon: Package,
    href: "/pengaturan/kategori-1",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Kategori 2",
    description: "Kelola kategori produk tingkat kedua",
    icon: Package,
    href: "/pengaturan/kategori-2",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Satuan",
    description: "Kelola satuan produk (kg, pcs, liter, dll)",
    icon: Ruler,
    href: "/pengaturan/satuan",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Mata Uang",
    description: "Kelola mata uang dan kurs",
    icon: DollarSign,
    href: "/pengaturan/mata-uang",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Jenis Pembayaran",
    description: "Kelola metode pembayaran",
    icon: CreditCard,
    href: "/pengaturan/jenis-pembayaran",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Warehouse",
    description: "Kelola gudang dan lokasi penyimpanan",
    icon: Warehouse,
    href: "/pengaturan/warehouse",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola pengaturan master data sistem inventory</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="transition-all hover:shadow-md hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Data Overview</CardTitle>
          <CardDescription>Ringkasan data master yang telah dikonfigurasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Total Kategori 1</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Total Kategori 2</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Total Satuan</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Ruler className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Mata Uang Aktif</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Metode Pembayaran</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Warehouse Aktif</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Warehouse className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
