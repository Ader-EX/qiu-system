"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertSuccess } from "@/components/alert-success"

interface PurchaseItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export default function EditPembelianPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    vendorId: "1",
    purchaseDate: "2024-01-15",
    paymentMethod: "transfer",
    notes: "Pembelian rutin bulanan",
  })

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: "1",
      productId: "1",
      productName: "Laptop Dell",
      quantity: 10,
      price: 7500000,
      total: 75000000,
    },
    {
      id: "2",
      productId: "2",
      productName: "Mouse Wireless",
      quantity: 50,
      price: 120000,
      total: 6000000,
    },
  ])

  const [showAlert, setShowAlert] = useState(false)

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "price") {
            updatedItem.total = updatedItem.quantity * updatedItem.price
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAlert(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message="Pembelian berhasil diperbarui!" onClose={() => setShowAlert(false)} />}

      <div className="flex items-center gap-4">
        <Link href="/pembelian">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Pembelian #{params.id}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembelian</CardTitle>
            <CardDescription>Perbarui informasi pembelian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">PT. Supplier Utama</SelectItem>
                    <SelectItem value="2">CV. Distributor Jaya</SelectItem>
                    <SelectItem value="3">UD. Grosir Murah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Tanggal Pembelian</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="credit">Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Item Pembelian</CardTitle>
                <CardDescription>Edit produk yang dibeli</CardDescription>
              </div>
              <Button type="button" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          updateItem(item.id, "productId", value)
                          // In real app, fetch product details and update name/price
                          updateItem(item.id, "productName", "Sample Product")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Laptop Dell</SelectItem>
                          <SelectItem value="2">Mouse Wireless</SelectItem>
                          <SelectItem value="3">Keyboard Mechanical</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>Rp {item.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <div className="text-lg font-semibold">Total: Rp {totalAmount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/pembelian">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit">Perbarui Pembelian</Button>
        </div>
      </form>
    </div>
  )
}
