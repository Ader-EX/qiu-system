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
import { Switch } from "@/components/ui/switch"
import { AlertSuccess } from "@/components/alert-success"

interface Currency {
  id: string
  name: string
  code: string
  symbol: string
  exchangeRate: number
  isDefault: boolean
  createdAt: string
}

const initialCurrencies: Currency[] = [
  {
    id: "1",
    name: "Indonesian Rupiah",
    code: "IDR",
    symbol: "Rp",
    exchangeRate: 1,
    isDefault: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "US Dollar",
    code: "USD",
    symbol: "$",
    exchangeRate: 15750,
    isDefault: false,
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Euro",
    code: "EUR",
    symbol: "€",
    exchangeRate: 17200,
    isDefault: false,
    createdAt: "2024-01-17",
  },
]

export default function MataUangPage() {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    symbol: "",
    exchangeRate: 1,
    isDefault: false,
  })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCurrency) {
      setCurrencies(
        currencies.map((currency) =>
          currency.id === editingCurrency.id
            ? {
                ...currency,
                name: formData.name,
                code: formData.code,
                symbol: formData.symbol,
                exchangeRate: formData.exchangeRate,
                isDefault: formData.isDefault,
              }
            : currency,
        ),
      )
      setAlertMessage("Mata uang berhasil diperbarui!")
    } else {
      const newCurrency: Currency = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        symbol: formData.symbol,
        exchangeRate: formData.exchangeRate,
        isDefault: formData.isDefault,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setCurrencies([...currencies, newCurrency])
      setAlertMessage("Mata uang berhasil ditambahkan!")
    }

    setIsDialogOpen(false)
    setEditingCurrency(null)
    setFormData({ name: "", code: "", symbol: "", exchangeRate: 1, isDefault: false })
    setShowAlert(true)
  }

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency)
    setFormData({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
      isDefault: currency.isDefault,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCurrencies(currencies.filter((currency) => currency.id !== id))
    setAlertMessage("Mata uang berhasil dihapus!")
    setShowAlert(true)
  }

  const openAddDialog = () => {
    setEditingCurrency(null)
    setFormData({ name: "", code: "", symbol: "", exchangeRate: 1, isDefault: false })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mata Uang</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mata Uang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCurrency ? "Edit Mata Uang" : "Tambah Mata Uang Baru"}</DialogTitle>
                <DialogDescription>
                  {editingCurrency
                    ? "Perbarui informasi mata uang di bawah ini."
                    : "Masukkan informasi mata uang baru di bawah ini."}
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
                  <Label htmlFor="exchangeRate" className="text-right">
                    Kurs
                  </Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: Number.parseFloat(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isDefault" className="text-right">
                    Default
                  </Label>
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCurrency ? "Perbarui" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Uang</CardTitle>
          <CardDescription>Kelola mata uang untuk sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari mata uang..."
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
                <TableHead>Simbol</TableHead>
                <TableHead>Kurs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCurrencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {currency.code}
                    </span>
                  </TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{currency.exchangeRate.toLocaleString()}</TableCell>
                  <TableCell>
                    {currency.isDefault ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Default
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        Secondary
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{currency.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(currency)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(currency.id)}
                          className="text-red-600"
                          disabled={currency.isDefault}
                        >
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
