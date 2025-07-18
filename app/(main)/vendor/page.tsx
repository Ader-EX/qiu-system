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

interface Vendor {
  id: string;
  name: string;
  code: string;
  address: string;
  currency: string;
  top: string;
  status: "active" | "inactive";
}

const initialVendors: Vendor[] = [
  {
    id: "1",
    name: "PT. Supplier Utama",
    code: "VEN-001",
    address: "Jl. Sudirman No. 123, Jakarta",
    status: "active",
    currency: "USD",
    top: "COD",
  },
  {
    id: "2",
    name: "CV. Distributor Jaya",
    code: "VEN-002",
    address: "Jl. Pemuda No. 456, Surabaya",
    status: "active",

    currency: "IDR",
    top: "CASH",
  },
  {
    id: "3",
    name: "UD. Grosir Murah",
    code: "VEN-003",
    address: "Jl. Asia Afrika No. 789, Bandung",
    status: "inactive",
    currency: "USD",
    top: "COD",
  },
];

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [filterStatus, setFiterStatus] = useState("");
  console.log(filterStatus);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "" || vendor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setVendors(vendors.filter((vendor) => vendor.id !== id));
    setAlertMessage("Vendor berhasil dihapus!");
    setShowAlert(true);
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
          <div className="flex space-x-2">
            <Search className="h-4 w-4 self-center text-muted-foreground" />
            <Input
              placeholder="Cari vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) => {
                setFiterStatus(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif </SelectItem>
                <SelectItem value="inactive">Tidak Aktif </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id Vendor</TableHead>
                <TableHead>Nama Vendor</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Term of Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{vendor.code}</span>
                  </TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>

                  <TableCell className="font-medium">
                    {vendor.address}
                  </TableCell>

                  <TableCell className="font-medium">
                    {vendor.currency}
                  </TableCell>
                  <TableCell className="font-medium">{vendor.top}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        vendor.status === "active" ? "okay" : "secondary"
                      }
                    >
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
                        <DropdownMenuItem
                          onClick={() => handleDelete(vendor.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
