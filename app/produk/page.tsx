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

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  unit: string
  status: "active" | "inactive"
  createdAt: string
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Dell Inspiron 15",
    sku: "DELL-INS-15-001",
    category: "Elektronik",
    price: 8500000,
    stock: 25,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mouse Wireless Logitech",
    sku: "LOG-MOU-WL-002",
    category: "Aksesoris",
    price: 150000,
    stock: 100,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Keyboard Mechanical RGB",
    sku: "KEY-MEC-RGB-003",
    category: "Aksesoris",
    price: 750000,
    stock: 5,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    name: "Monitor 24 inch 4K",
    sku: "MON-24-4K-004",
    category: "Elektronik",
    price: 3200000,
    stock: 0,
    unit: "pcs",
    status: "inactive",
    createdAt: "2024-01-18",
  },
]

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id))
    setAlertMessage("Produk berhasil dihapus!")
    setShowAlert(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const }
    if (stock <= 10) return { label: "Menipis", variant: "secondary" as const }
    return { label: "Tersedia", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produk</h1>
        <Link href="/produk/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>Kelola produk dalam sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
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
                <TableHead>Nama Produk</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>
                          {product.stock} {product.unit}
                        </span>
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
