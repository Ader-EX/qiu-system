"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search as SearchIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Warehouse } from "@/types/types";
import WarehouseForm from "@/components/warehouse/WarehouseForm";
import { WarehouseCreate, warehouseService } from "@/services/warehouseService";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WarehousePage() {
  // State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.ceil(total / rowsPerPage);

  const fetchWarehouses = async (
    pageNumber: number,
    query: string,
    limit: number
  ) => {
    setLoading(true);
    try {
      const response = await warehouseService.getAllWarehouses({
        skip: (pageNumber - 1) * limit,
        limit,
        search: query,
      });

      setWarehouses(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data warehouse");
      setWarehouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(page, searchTerm, rowsPerPage);
  }, [page, rowsPerPage]);

  // Handle search button
  const handleSearch = () => {
    setPage(1);
    fetchWarehouses(1, searchTerm, rowsPerPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    setRowsPerPage(newLimit);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // CRUD handlers (create/update/delete)
  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus warehouse ini?")) return;
    try {
      await warehouseService.deleteWarehouse(id);
      // Refresh current page
      fetchWarehouses(page, searchTerm, rowsPerPage);
      toast.success("Warehouse berhasil dihapus!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus warehouse");
    }
  };

  const handleSubmit = async (data: WarehouseCreate) => {
    setSubmitting(true);
    try {
      if (editing) {
        await warehouseService.updateWarehouse(editing.id, data);
        toast.success("Warehouse berhasil diperbarui!");
      } else {
        await warehouseService.createWarehouse(data);
        toast.success("Warehouse berhasil ditambahkan!");
      }
      setIsDialogOpen(false);
      setEditing(null);
      fetchWarehouses(page, searchTerm, rowsPerPage);
    } catch (error) {
      console.error(error);
      toast.error(
        editing ? "Gagal memperbarui warehouse" : "Gagal menambahkan warehouse"
      );
    } finally {
      setSubmitting(false);
    }
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
                  onClick={() => setIsDialogOpen(true)}
                  disabled={submitting}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit Warehouse" : "Tambah Warehouse Baru"}
                  </DialogTitle>
                </DialogHeader>
                <WarehouseForm
                  onSubmit={(d) =>
                    handleSubmit({
                      name: d.name,
                      address: d.address,
                      is_active: d.is_active,
                    })
                  }
                  editing={!!editing}
                  initialData={editing ?? undefined}
                />
              </DialogContent>
            </Dialog>
          </HeaderActions.ActionGroup>
        }
      />

      {/* Search Bar with Button */}
      <div className="flex w-full justify-between space-x-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-7 w-full"
          />
        </div>

        <Button onClick={handleSearch} disabled={loading}>
          <SearchIcon className="mr-2 h-4 w-4" /> Cari
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Loader2 className="animate-spin mx-auto h-6 w-6" />
              </TableCell>
            </TableRow>
          ) : warehouses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {searchTerm
                  ? "Tidak ada warehouse yang sesuai dengan pencarian"
                  : "Belum ada data warehouse"}
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.id}</TableCell>
                <TableCell className="font-medium break-words">
                  {w.name}
                </TableCell>
                <TableCell className="max-w-[200px] break-words">
                  {w.address}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={w.is_active ? "okay" : "destructive"}>
                    {w.is_active ? "Aktif" : "Tidak Aktif"}
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
                        onClick={() => openEdit(w)}
                        disabled={submitting}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(w.id)}
                        className="text-red-600"
                        disabled={submitting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
