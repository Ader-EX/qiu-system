"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Search as SearchIcon,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import { Unit } from "@/types/types";
import KategoriForm from "@/components/kategori/KategoriForm";
import { kategoriService } from "@/services/kategoriService";
import Cookies from "js-cookie";
import GlobalPaginationFunction from "@/components/pagination-global";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";

export default function Kategori1Page() {
  const [categories, setCategories] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Separate state for input values and applied filters
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Applied filter states (only used when button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState<Date | undefined>();
  const [appliedToDate, setAppliedToDate] = useState<Date | undefined>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    is_active: boolean;
  }>({
    name: "",
    is_active: true,
  });

  const totalPages = Math.ceil(total / rowsPerPage);

  // Only trigger on page, rowsPerPage changes, or when applied filters change
  useEffect(() => {
    loadCategories(
      page,
      appliedSearchTerm,
      rowsPerPage,
      appliedFromDate,
      appliedToDate
    );
  }, [page, rowsPerPage, appliedSearchTerm, appliedFromDate, appliedToDate]);

  const loadCategories = async (
    page: number,
    searchTerm: string,
    limit: number,
    fromDate?: Date,
    toDate?: Date
  ) => {
    try {
      setLoading(true);

      const params: any = {
        skip: (page - 1) * limit,
        limit: limit,
        search: searchTerm,
        type: 2,
      };

      if (fromDate) {
        params.from_date = format(fromDate, "yyyy-MM-dd");
      }
      if (toDate) {
        params.to_date = format(toDate, "yyyy-MM-dd");
      }

      const response = await kategoriService.getAllCategories(params);

      setCategories(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Gagal memuat data kategori");
    } finally {
      setLoading(false);
    }
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSubmit = async (data: { name: string; is_active: boolean }) => {
    try {
      setLoading(true);

      if (editingCategory) {
        if (editingCategory.id) {
          if (typeof editingCategory?.id === "number") {
            const updatedCategory = await kategoriService.updateCategory(
              editingCategory?.id,
              {
                name: data.name,
                is_active: data.is_active,
                category_type: 2,
              }
            );
          }

          // Reload data with current applied filters
          await loadCategories(
            page,
            appliedSearchTerm,
            rowsPerPage,
            appliedFromDate,
            appliedToDate
          );
        }
        toast.success("Jenis Barang berhasil diperbarui!");
      } else {
        const newCategory = await kategoriService.createCategory({
          name: data.name,
          is_active: data.is_active,
          category_type: 2,
        });

        // Reload data with current applied filters
        await loadCategories(
          page,
          appliedSearchTerm,
          rowsPerPage,
          appliedFromDate,
          appliedToDate
        );
        toast.success("Jenis Barang berhasil ditambahkan!");
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", is_active: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        editingCategory
          ? "Gagal memperbarui Jenis Barang"
          : "Gagal menambahkan Jenis Barang"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Unit) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await kategoriService.deleteCategory(id);

      await loadCategories(
        page,
        appliedSearchTerm,
        rowsPerPage,
        appliedFromDate,
        appliedToDate
      );
      toast.success("Jenis Barang berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Gagal menghapus Jenis Barang");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", is_active: true });
    setIsDialogOpen(true);
  };

  // Apply filters only when search button is clicked
  const handleSearch = async () => {
    console.log("Search clicked, searchTerm:", searchTerm);

    // Apply the current input values to the filter states
    setAppliedSearchTerm(searchTerm);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);

    // Reset to first page when applying new filters
    setPage(1);
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear filters function
  const handleClearFilters = () => {
    setSearchTerm("");
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedSearchTerm("");
    setAppliedFromDate(undefined);
    setAppliedToDate(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Jenis Barang"]}
            linkData={["pengaturan", "kategori-2", "kategori-2"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Barang
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? "Edit Jenis Barang"
                : "Tambah Jenis Barang Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Perbarui informasi Jenis Barang di bawah ini."
                : "Masukkan informasi Jenis Barang baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <KategoriForm
            initialdata={editingCategory ? formData : undefined}
            editing={!!editingCategory}
            onSubmit={handleSubmit}
            // loading={loading}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari Jenis Barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-7 w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading}>
            <SearchIcon className="mr-2 h-4 w-4" /> Cari
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">ID</TableHead>
              <TableHead className="w-[20%]">Nama</TableHead>
              <TableHead className="w-[20%]">Created At</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
              <TableHead className="w-[10%] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {appliedSearchTerm
                    ? "Tidak ada Jenis Barang yang ditemukan"
                    : "Belum ada data Jenis Barang"}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-medium">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "okay" : "secondary"}>
                      {category.is_active ? "Aktif" : "Tidak Aktif"}
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
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (category.id) {
                              if (typeof category.id === "number") {
                                handleDelete(category.id);
                              }
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <GlobalPaginationFunction
        page={page}
        total={total}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}
