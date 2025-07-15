"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { AlertSuccess } from "@/components/alert-success"

interface Unit {
  id: string
  name: string
  symbol: string
  description: string
  createdAt: string
}

const initialUnits: Unit[] = [
  {
    id: "1",
    name: "Kilogram",
    symbol: "kg",
    description: "Satuan berat dalam kilogram",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Meter",
    symbol: "m",
    description: "Satuan panjang dalam meter",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Liter",
    symbol: "L",
    description: "Satuan volume dalam liter",
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    name: "Pieces",
    symbol: "pcs",
    description: "Satuan jumlah dalam pieces",
    createdAt: "2024-01-18",
  },
]

export default function SatuanPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({ name: "", symbol: "", description: "" })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUnit) {
      setUnits(
        units.map((unit) =>
          unit.id === editingUnit.id
            ? { ...unit, name: formData.name, symbol: formData.symbol, description: formData.description }
            : unit,
        ),
      )
      setAlertMessage("Satuan berhasil diperbarui!")
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setUnits([...units, newUnit])
      setAlertMessage("Satuan berhasil ditambahkan!")
    }

    setIsDialogOpen(false)
    setEditingUnit(null)
    setFormData({ name: "", symbol: "", description: "" })
    setShowAlert(true)
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({ name: unit.name, symbol: unit.symbol, description: unit.description })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setUnits(units.filter((unit) => unit.id !== id))
    setAlertMessage("Satuan berhasil dihapus!")
    setShowAlert(true)
  }

  const openAddDialog = () => {
    setEditingUnit(null)
    setFormData({ name: "", symbol: "", description: "" })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Satuan</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Satuan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUnit ? "Edit Satuan" : "Tambah Satuan Baru"}</DialogTitle>
                <DialogDescription>
                  {editingUnit
                    ? "Perbarui informasi satuan di bawah ini."
                    : "Masukkan informasi satuan baru di bawah ini."}
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
                  <Label htmlFor="symbol" className="text-right">
                    Simbol
                  </Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="col-span-3"
                    required
                  />
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
              </div>
              <DialogFooter>
                <Button type="submit">{editingUnit ? "Perbarui" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Satuan</CardTitle>
          <CardDescription>Kelola satuan produk untuk sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari satuan..."
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
                <TableHead>Simbol</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {unit.symbol}
                    </span>
                  </TableCell>
                  <TableCell>{unit.description}</TableCell>
                  <TableCell>{unit.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(unit)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(unit.id)} className="text-red-600">
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
