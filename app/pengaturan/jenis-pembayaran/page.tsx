"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertSuccess } from "@/components/alert-success"

interface PaymentMethod {
  id: string
  name: string
  type: "cash" | "card" | "digital"
  description: string
  isActive: boolean
  createdAt: string
}

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    name: "Cash",
    type: "cash",
    description: "Pembayaran tunai",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Credit Card",
    type: "card",
    description: "Pembayaran dengan kartu kredit",
    isActive: true,
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Debit Card",
    type: "card",
    description: "Pembayaran dengan kartu debit",
    isActive: true,
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    name: "E-Wallet",
    type: "digital",
    description: "Pembayaran dengan dompet digital",
    isActive: true,
    createdAt: "2024-01-18",
  },
]

const paymentTypeIcons = {
  cash: Banknote,
  card: CreditCard,
  digital: Smartphone,
}

export default function JenisPembayaranPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "cash" as PaymentMethod["type"],
    description: "",
    isActive: true,
  })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredPaymentMethods = paymentMethods.filter(
    (method) =>
      method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPaymentMethod) {
      setPaymentMethods(
        paymentMethods.map((method) =>
          method.id === editingPaymentMethod.id
            ? {
                ...method,
                name: formData.name,
                type: formData.type,
                description: formData.description,
                isActive: formData.isActive,
              }
            : method,
        ),
      )
      setAlertMessage("Jenis pembayaran berhasil diperbarui!")
    } else {
      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        description: formData.description,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setPaymentMethods([...paymentMethods, newPaymentMethod])
      setAlertMessage("Jenis pembayaran berhasil ditambahkan!")
    }

    setIsDialogOpen(false)
    setEditingPaymentMethod(null)
    setFormData({ name: "", type: "cash", description: "", isActive: true })
    setShowAlert(true)
  }

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    setFormData({
      name: paymentMethod.name,
      type: paymentMethod.type,
      description: paymentMethod.description,
      isActive: paymentMethod.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
    setAlertMessage("Jenis pembayaran berhasil dihapus!")
    setShowAlert(true)
  }

  const openAddDialog = () => {
    setEditingPaymentMethod(null)
    setFormData({ name: "", type: "cash", description: "", isActive: true })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jenis Pembayaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jenis Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPaymentMethod ? "Edit Jenis Pembayaran" : "Tambah Jenis Pembayaran Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingPaymentMethod
                    ? "Perbarui informasi jenis pembayaran di bawah ini."
                    : "Masukkan informasi jenis pembayaran baru di bawah ini."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipe
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: PaymentMethod["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih tipe pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Deskripsi
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Aktif
                  </Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingPaymentMethod ? "Perbarui" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jenis Pembayaran</CardTitle>
          <CardDescription>Kelola jenis pembayaran untuk sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari jenis pembayaran..."
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
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPaymentMethods.map((method) => {
                const IconComponent = paymentTypeIcons[method.type]
                return (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="capitalize">{method.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{method.description}</TableCell>
                    <TableCell>
                      {method.isActive ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          Tidak Aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{method.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(method)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(method.id)} className="text-red-600">
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
