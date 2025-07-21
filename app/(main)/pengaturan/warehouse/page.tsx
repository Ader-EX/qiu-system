"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

interface Warehouse {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

const initialWarehouses: Warehouse[] = [
  {
    id: "1",
    name: "Jakarta Pusat",
    address: "Jl. Sudirman No. 123",
    isActive: true,
  },
  { id: "2", name: "Surabaya", address: "Jl. Pemuda No. 456", isActive: true },
  {
    id: "3",
    name: "Bandung",
    address: "Jl. Asia Afrika No. 789",
    isActive: false,
  },
  // ...additional items for pagination example
  { id: "4", name: "Medan", address: "Jl. Merdeka No. 10", isActive: true },
  { id: "5", name: "Semarang", address: "Jl. Pemuda No. 22", isActive: true },
  {
    id: "6",
    name: "Makassar",
    address: "Jl. Sam Ratulangi No. 5",
    isActive: false,
  },
  {
    id: "7",
    name: "Denpasar",
    address: "Jl. Gatot Subroto No. 50",
    isActive: true,
  },
];

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    isActive: boolean;
  }>({
    name: "",
    address: "",
    isActive: true,
  });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filtered list
  const filtered = useMemo(
    () =>
      warehouses.filter(
        (w) =>
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (w.isActive ? "aktif" : "tidak aktif").includes(
            searchTerm.toLowerCase()
          )
      ),
    [warehouses, searchTerm]
  );

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setWarehouses(
        warehouses.map((w) => (w.id === editing.id ? { ...w, ...formData } : w))
      );
      toast.success("Warehouse berhasil diperbarui!");
    } else {
      const newWh: Warehouse = {
        id: Date.now().toString(),
        ...formData,
      };
      setWarehouses([...warehouses, newWh]);
      toast.success("Warehouse berhasil ditambahkan!");
    }
    setIsDialogOpen(false);
    setEditing(null);
    setFormData({ name: "", address: "", isActive: true });
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setFormData({ name: w.name, address: w.address, isActive: w.isActive });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setWarehouses(warehouses.filter((w) => w.id !== id));
    toast.success("Warehouse berhasil dihapus!");
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Warehouse"]}
            linkData={["pengaturan", "warehouse", "warehouse"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditing(null);
                    setFormData({ name: "", address: "", isActive: true });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editing ? "Edit Warehouse" : "Tambah Warehouse Baru"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nama
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="flex items-center  gap-4">
                      <Label htmlFor="address" className="text-right">
                        Alamat
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={formData.isActive.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            isActive: value === "true",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status">
                            {formData.isActive ? "Aktif" : "Non Aktif"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Aktif ✅</SelectItem>
                          <SelectItem value="false">Non Aktif ❌</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editing ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </HeaderActions.ActionGroup>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 pt-2">
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
                <TableHead className="">ID</TableHead>
                <TableHead className="">Nama</TableHead>
                <TableHead className="">Alamat</TableHead>
                <TableHead className=" text-right">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="">{w.id}</TableCell>
                  <TableCell className=" font-medium break-words">
                    {w.name}
                  </TableCell>
                  <TableCell className=" max-w-[200px] break-words flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
                    {w.address}
                  </TableCell>
                  <TableCell className=" text-right">
                    <Badge variant={w.isActive ? "okay" : "destructive"}>
                      {w.isActive ? "Aktif" : "Tidak Aktif"}
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
                        <DropdownMenuItem onClick={() => openEdit(w)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(w.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex justify-end space-x-2 py-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? undefined : "ghost"}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
