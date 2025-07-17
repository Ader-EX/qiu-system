"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AlertSuccess } from "@/components/alert-success"

interface Sale {
  id: string
  saleNumber: string
  customer: string
  date: string
  total: number
  status: "pending" | "completed" | "cancelled"
  paymentStatus: "unpaid" | "partial" | "paid"
  createdAt: string
}

const initialSales: Sale[] = [
  {
    id: "1",
    saleNumber: "SO-001",
    customer: "PT. ABC Company",
    date: "2024-01-15",
    total: 16750000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    saleNumber: "SO-002",
    customer: "CV. XYZ Trading",
    date: "2024-01-16",
    total: 8500000,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    saleNumber: "SO-003",
    customer: "John Doe",
    date: "2024-01-17",
    total: 750000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-01-17",
  },
]

export default function PenjualanPage() {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredSales = sales.filter(
    (sale) =>
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setSales(sales.filter((sale) => sale.id !== id))
    setAlertMessage("Penjualan berhasil dihapus!")
    setShowAlert(true)
  }

  const getStatusBadge = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Selesai</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPaymentStatusBadge = (status: Sale["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            Lunas
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Sebagian
          </Badge>
        )
      case "unpaid":
        return <Badge variant="destructive">Belum Bayar</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Penjualan</h1>
        <Link href="/penjualan/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Penjualan
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Penjualan</CardTitle>
          <CardDescription>Kelola transaksi penjualan kepada customer dan pelanggan.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari penjualan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Penjualan</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    <span className="font-mono">{sale.saleNumber}</span>
                  </TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>Rp {sale.total.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(sale.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/penjualan/${sale.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(sale.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
