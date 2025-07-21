"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import toast from "react-hot-toast";

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

  const [filterStatus, setFilterStatus] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    currency: "IDR",
    top: "CASH",
    status: "active" as "active" | "inactive",
  });

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || vendor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      currency: "IDR",
      top: "CASH",
      status: "active",
    });
  };

  const openAddDialog = () => {
    setDialogMode("add");
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (vendor: Vendor) => {
    setDialogMode("edit");
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      code: vendor.code,
      address: vendor.address,
      currency: vendor.currency,
      top: vendor.top,
      status: vendor.status,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingVendor(null);
    resetForm();
  };

  const generateVendorCode = () => {
    const lastVendor = vendors.sort(
      (a, b) => parseInt(b.code.split("-")[1]) - parseInt(a.code.split("-")[1])
    )[0];

    const lastNumber = lastVendor ? parseInt(lastVendor.code.split("-")[1]) : 0;
    return `VEN-${String(lastNumber + 1).padStart(3, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }

    if (dialogMode === "add") {
      const newVendor: Vendor = {
        id: Date.now().toString(),
        ...formData,
        code: formData.code || generateVendorCode(),
      };

      setVendors([...vendors, newVendor]);
      toast.success("Vendor berhasil ditambahkan!");
    } else if (editingVendor) {
      const updatedVendors = vendors.map((vendor) =>
        vendor.id === editingVendor.id ? { ...vendor, ...formData } : vendor
      );

      setVendors(updatedVendors);
      toast.success("Vendor berhasil diperbarui!");
    }

    closeDialog();
  };

  const handleDelete = (id: string) => {
    setVendors(vendors.filter((vendor) => vendor.id !== id));
    toast.success("Vendor berhasil dihapus!");
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title="Vendor"
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Vendor
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

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
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
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
                        <DropdownMenuItem
                          onClick={() => openEditDialog(vendor)}
                        >
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
              {filteredVendors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada vendor yang ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Tambah Vendor Baru" : "Edit Vendor"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Masukkan informasi vendor baru di bawah ini."
                : "Perbarui informasi vendor di bawah ini."}
            </DialogDescription>
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
                <Label htmlFor="code">Kode Vendor</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder={dialogMode === "add" ? "JDS001" : "VEN-001"}
                  disabled={dialogMode === "edit"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Vendor</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nama vendor"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="top">Term of Payment</Label>
                <Select
                  value={formData.top}
                  onValueChange={(value) => handleInputChange("top", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="COD">COD</SelectItem>
                    <SelectItem value="NET30">NET 30</SelectItem>
                    <SelectItem value="NET60">NET 60</SelectItem>
                    <SelectItem value="NET90">NET 90</SelectItem>
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
                placeholder="Masukkan alamat lengkap vendor"
                rows={3}
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="submit">
                {dialogMode === "add" ? "Tambah Vendor" : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
