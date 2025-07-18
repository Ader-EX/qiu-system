"use client";

import { use, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AlertSuccess } from "@/components/alert-success";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  code: string;
  address: string;
  currency: string;
  top: string;
  status: "active" | "inactive";
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "PT. Maju Bersama",
    code: "CUS-001",
    address: "Jl. Gatot Subroto No. 123, Jakarta",
    status: "active",
    currency: "USD",
    top: "NET 30",
  },
  {
    id: "2",
    name: "CV. Sukses Mandiri",
    code: "CUS-002",
    address: "Jl. Pahlawan No. 456, Surabaya",
    status: "active",
    currency: "IDR",
    top: "NET 15",
  },
  {
    id: "3",
    name: "UD. Berkah Jaya",
    code: "CUS-003",
    address: "Jl. Diponegoro No. 789, Bandung",
    status: "inactive",
    currency: "USD",
    top: "COD",
  },
  {
    id: "4",
    name: "PT. Global Solutions",
    code: "CUS-004",
    address: "Jl. Thamrin No. 321, Jakarta",
    status: "active",
    currency: "USD",
    top: "NET 45",
  },
  {
    id: "5",
    name: "CV. Makmur Sejahtera",
    code: "CUS-005",
    address: "Jl. Ahmad Yani No. 654, Medan",
    status: "active",
    currency: "IDR",
    top: "NET 30",
  },
  {
    id: "6",
    name: "UD. Harapan Baru",
    code: "CUS-006",
    address: "Jl. Veteran No. 987, Yogyakarta",
    status: "inactive",
    currency: "IDR",
    top: "CASH",
  },
  {
    id: "7",
    name: "PT. Teknologi Nusantara",
    code: "CUS-007",
    address: "Jl. Sudirman No. 111, Jakarta",
    status: "active",
    currency: "USD",
    top: "NET 60",
  },
  {
    id: "8",
    name: "CV. Karya Utama",
    code: "CUS-008",
    address: "Jl. Malioboro No. 222, Yogyakarta",
    status: "active",
    currency: "IDR",
    top: "NET 15",
  },
  {
    id: "9",
    name: "UD. Sinar Harapan",
    code: "CUS-009",
    address: "Jl. Gajah Mada No. 333, Semarang",
    status: "inactive",
    currency: "USD",
    top: "COD",
  },
  {
    id: "10",
    name: "PT. Mitra Sejati",
    code: "CUS-010",
    address: "Jl. Hayam Wuruk No. 444, Jakarta",
    status: "active",
    currency: "IDR",
    top: "NET 30",
  },
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "" || customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
    setAlertMessage("Customer berhasil dihapus!");
    setShowAlert(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: string) => {
    setRowsPerPage(parseInt(rows));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <div className="space-y-6">
      {showAlert && (
        <AlertSuccess
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

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
          <div className="flex space-x-2">
            <Search className="h-4 w-4 self-center text-muted-foreground" />
            <Input
              placeholder="Cari customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id Customer</TableHead>
                <TableHead>Nama Customer</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Term of Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{customer.code}</span>
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="font-medium">
                    {customer.address}
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.currency}
                  </TableCell>
                  <TableCell className="font-medium">{customer.top}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "active" ? "okay" : "secondary"
                      }
                    >
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
                        <DropdownMenuItem
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600"
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Baris per halaman:
              </span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages} (
                {filteredCustomers.length} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
