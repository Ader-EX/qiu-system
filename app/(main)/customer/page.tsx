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

interface Customer {
  id: string
  name: string
  code: string
  contact: string
  phone: string
  email: string
  address: string
  type: "individual" | "company"
  status: "active" | "inactive"
  createdAt: string
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "PT. ABC Company",
    code: "CUS-001",
    contact: "Alice Johnson",
    phone: "+62 21 1111111",
    email: "alice@abc-company.com",
    address: "Jl. Thamrin No. 100, Jakarta",
    type: "company",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "CV. XYZ Trading",
    code: "CUS-002",
    contact: "Bob Wilson",
    phone: "+62 31 2222222",
    email: "bob@xyz-trading.com",
    address: "Jl. Basuki Rahmat No. 200, Surabaya",
    type: "company",
    status: "active",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "John Doe",
    code: "CUS-003",
    contact: "John Doe",
    phone: "+62 22 3333333",
    email: "john.doe@email.com",
    address: "Jl. Braga No. 300, Bandung",
    type: "individual",
    status: "active",
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    name: "UD. Maju Jaya",
    code: "CUS-004",
    contact: "Sarah Lee",
    phone: "+62 274 4444444",
    email: "sarah@maju-jaya.com",
    address: "Jl. Malioboro No. 400, Yogyakarta",
    type: "company",
    status: "inactive",
    createdAt: "2024-01-18",
  },
]

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((customer) => customer.id !== id))
    setAlertMessage("Customer berhasil dihapus!")
    setShowAlert(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer</h1>
        <Link href="/customer/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Customer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Customer</CardTitle>
          <CardDescription>Kelola customer dan pelanggan dalam sistem inventory Anda.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari customer..."
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
                <TableHead>Nama Customer</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{customer.code}</span>
                  </TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.type === "company" ? "default" : "outline"}>
                      {customer.type === "company" ? "Perusahaan" : "Individu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                      {customer.status === "active" ? "Aktif" : "Tidak Aktif"}
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
                        <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-red-600">
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
