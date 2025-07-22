"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import toast from "react-hot-toast";
import { CustomerDetailDialog } from "@/components/customer/CustomerDetailDialog";

export interface Customer {
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

  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    currency: "",
    top: "",
    status: "active" as "active" | "inactive",
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "all" ||
      customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      currency: "",
      top: "",
      status: "active",
    });
  };

  const openAddDialog = () => {
    setDialogMode("add");
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setDialogMode("edit");
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      code: customer.code,
      address: customer.address,
      currency: customer.currency || "-",
      top: customer.top || "-",
      status: customer.status,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    resetForm();
  };

  const generateCustomerCode = () => {
    const lastCustomer = customers.sort(
      (a, b) => parseInt(b.code.split("-")[1]) - parseInt(a.code.split("-")[1])
    )[0];

    const lastNumber = lastCustomer
      ? parseInt(lastCustomer.code.split("-")[1])
      : 0;
    return `CUS-${String(lastNumber + 1).padStart(3, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }

    if (dialogMode === "add") {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        code: formData.code || generateCustomerCode(),
      };

      setCustomers([...customers, newCustomer]);
      toast.success("Customer berhasil ditambahkan!");
    } else if (editingCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomer.id
          ? { ...customer, ...formData }
          : customer
      );

      setCustomers(updatedCustomers);
      toast.success("Customer berhasil diperbarui!");
    }

    closeDialog();
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
    toast.success("Customer berhasil dihapus!");
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      <SidebarHeaderBar
        title="Customer"
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Customer
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

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
              value={filterStatus}
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
                <TableHead>Mata Uang</TableHead>
                <TableHead>Jenis Pembayaran</TableHead>
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
                    {customer.currency || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.top || "-"}
                  </TableCell>
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
                        <DropdownMenuItem
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(customer)}
                        >
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
              {currentCustomers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada customer yang ditemukan
                  </TableCell>
                </TableRow>
              )}
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
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-left">
              {dialogMode === "add" ? "Tambah Customer" : "Edit Customer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    handleInputChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Kode Customer</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder={dialogMode === "add" ? "JSD001" : "CUS-001"}
                  disabled={dialogMode === "edit"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Customer</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama customer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Mata Uang</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top">Jenis Pembayaran</Label>
                <Select
                  value={formData.top}
                  onValueChange={(value) => handleInputChange("top", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="COD">COD</SelectItem>
                    <SelectItem value="NET 15">NET 15</SelectItem>
                    <SelectItem value="NET 30">NET 30</SelectItem>
                    <SelectItem value="NET 45">NET 45</SelectItem>
                    <SelectItem value="NET 60">NET 60</SelectItem>
                    <SelectItem value="NET 90">NET 90</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Masukkan alamat lengkap customer"
                rows={3}
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="submit">
                {dialogMode === "add" ? "Tambah Customer" : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {selectedCustomer && (
        <CustomerDetailDialog
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}
