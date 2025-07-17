"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertSuccess } from "@/components/alert-success"

interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  manager: string
  capacity: number
  isActive: boolean
  createdAt: string
}

const initialWarehouses: Warehouse[] = [
  {
    id: "1",
    name: "Warehouse Jakarta Pusat",
    code: "WH-JKT-01",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    manager: "John Doe",
    capacity: 10000,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Warehouse Surabaya",
    code: "WH-SBY-01",
    address: "Jl. Pemuda No. 456, Surabaya",
    manager: "Jane Smith",
    capacity: 8000,
    isActive: true,
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Warehouse Bandung",
    code: "WH-BDG-01",
    address: "Jl. Asia Afrika No. 789, Bandung",
    manager: "Bob Johnson",
    capacity: 6000,
    isActive: false,
    createdAt: "2024-01-17",
  },
]

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    manager: "",
    capacity: 0,
    isActive: true,
  })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingWarehouse) {
      setWarehouses(
        warehouses.map((warehouse) =>
          warehouse.id === editingWarehouse.id
            ? {
                ...warehouse,
                name: formData.name,
                code: formData.code,
                address: formData.address,
                manager: formData.manager,
                capacity: formData.capacity,
                isActive: formData.isActive,
              }
            : warehouse,
        ),
      )
      setAlertMessage("Warehouse berhasil diperbarui!")
    } else {
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        address: formData.address,
        manager: formData.manager,
        capacity: formData.capacity,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setWarehouses([...warehouses, newWarehouse])
      setAlertMessage("Warehouse berhasil ditambahkan!")
    }

    setIsDialogOpen(false)
    setEditingWarehouse(null)
    setFormData({ name: "", code: "", address: "", manager: "", capacity: 0, isActive: true })
    setShowAlert(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      manager: warehouse.manager,
      capacity: warehouse.capacity,
      isActive: warehouse.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setWarehouses(warehouses.filter((warehouse) => warehouse.id !== id))
    setAlertMessage("Warehouse berhasil dihapus!")
    setShowAlert(true)
  }

  const openAddDialog = () => {
    setEditingWarehouse(null)
    setFormData({ name: "", code: "", address: "", manager: "", capacity: 0, isActive: true })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Warehouse</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Tambah Warehouse Baru"}</DialogTitle>
                <DialogDescription>
                  {editingWarehouse
                    ? "Perbarui informasi warehouse di bawah ini."
                    : "Masukkan informasi warehouse baru di bawah ini."}
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
                  <Label htmlFor="code" className="text-right">
                    Kode
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Alamat
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manager" className="text-right">
                    Manager
                  </Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Kapasitas
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
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
                <Button type="submit">{editingWarehouse ? "Perbarui" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Warehouse</CardTitle>
          <CardDescription>Kelola warehouse untuk sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari warehouse..."
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
                <TableHead>Kode</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {warehouse.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="max-w-[200px] truncate">{warehouse.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{warehouse.manager}</span>
                    </div>
                  </TableCell>
                  <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                  <TableCell>
                    {warehouse.isActive ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        Tidak Aktif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(warehouse)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(warehouse.id)} className="text-red-600">
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
