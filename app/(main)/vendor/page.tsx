"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AlertSuccess } from "@/components/alert-success"

interface Vendor {
  id: string
  name: string
  code: string
  contact: string
  phone: string
  email: string
  address: string
  status: "active" | "inactive"
  createdAt: string
}

const initialVendors: Vendor[] = [
  {
    id: "1",
    name: "PT. Supplier Utama",
    code: "VEN-001",
    contact: "John Doe",
    phone: "+62 21 1234567",
    email: "john@supplier-utama.com",
    address: "Jl. Sudirman No. 123, Jakarta",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "CV. Distributor Jaya",
    code: "VEN-002",
    contact: "Jane Smith",
    phone: "+62 31 7654321",
    email: "jane@distributor-jaya.com",
    address: "Jl. Pemuda No. 456, Surabaya",
    status: "active",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "UD. Grosir Murah",
    code: "VEN-003",
    contact: "Bob Johnson",
    phone: "+62 22 9876543",
    email: "bob@grosir-murah.com",
    address: "Jl. Asia Afrika No. 789, Bandung",
    status: "inactive",
    createdAt: "2024-01-17",
  },
]

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setVendors(vendors.filter((vendor) => vendor.id !== id))
    setAlertMessage("Vendor berhasil dihapus!")
    setShowAlert(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor</h1>
        <Link href="/vendor/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Vendor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Vendor</CardTitle>
          <CardDescription>Kelola vendor dan supplier dalam sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari vendor..."
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
                <TableHead>Nama Vendor</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{vendor.code}</span>
                  </TableCell>
                  <TableCell>{vendor.contact}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{vendor.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{vendor.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                      {vendor.status === "active" ? "Aktif" : "Tidak Aktif"}
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
                        <DropdownMenuItem onClick={() => handleDelete(vendor.id)} className="text-red-600">
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
