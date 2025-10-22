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
  X,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import { TOPUnit } from "@/types/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { jenisPembayaranService } from "@/services/mataUangService";
import Cookies from "js-cookie";
import GlobalPaginationFunction from "@/components/pagination-global";
import CurrencyForm from "@/components/currency/CurrencyForm";
import { Spinner } from "@/components/ui/spinner";

export default function JenisPembayaranPage() {
  const [units, setUnits] = useState<TOPUnit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<TOPUnit | null>(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    symbol: string;
    is_active: boolean;
  }>({
    name: "",
    symbol: "",
    is_active: true,
  });

  const totalPages = Math.ceil(total / rowsPerPage);

  useEffect(() => {
    loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
  }, [page, rowsPerPage]);
  const loadUnits = async (
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
        limit: 1000,
        is_active: false,
        search: searchTerm,
      };

      // Add date filters if they exist
      if (fromDate) {
        params.from_date = format(fromDate, "yyyy-MM-dd");
      }
      if (toDate) {
        params.to_date = format(toDate, "yyyy-MM-dd");
      }

      const response = await jenisPembayaranService.getAllMataUang(params);

      setUnits(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error loading units:", error);
      toast.error("Gagal memuat data Jenis Pembayaran");
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

  const handleSubmit = async (data: {
    name: string;
    symbol: string;
    is_active: boolean;
  }) => {
    try {
      setLoading(true);

      if (editingCurrency) {
        if (editingCurrency.id) {
          const updatedCurrency = await jenisPembayaranService.updateMataUang(
            editingCurrency.id,
            {
              name: data.name,
              symbol: data.symbol,
              is_active: data.is_active,
            }
          );

          // Reload data to get fresh results from server
          await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
        }
        toast.success("Jenis Pembayaran berhasil diperbarui!");
      } else {
        const newCurrency = await jenisPembayaranService.createMataUang({
          name: data.name,
          symbol: data.symbol,
          is_active: data.is_active,
        });

        await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
        toast.success("Jenis Pembayaran berhasil ditambahkan!");
      }

      setIsDialogOpen(false);
      setEditingCurrency(null);
      setFormData({ name: "", symbol: "", is_active: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        editingCurrency
          ? "Gagal memperbarui Jenis Pembayaran"
          : "Gagal menambahkan Jenis Pembayaran"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: TOPUnit) => {
    if (unit.symbol) {
      setEditingCurrency(unit);
      setFormData({
        name: unit.name,
        symbol: unit.symbol,
        is_active: unit.is_active,
      });
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await jenisPembayaranService.deleteMataUang(id);

      await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
      toast.success("Jenis Pembayaran berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Gagal menghapus Jenis Pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCurrency(null);
    setFormData({ name: "", symbol: "", is_active: true });
    setIsDialogOpen(true);
  };

  const handleSearch = async () => {
    loadUnits(1, searchTerm, rowsPerPage, fromDate, toDate);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters = searchTerm || fromDate || toDate;

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Jenis Pembayaran"]}
            linkData={["pengaturan", "jenis-pembayaran", "jenis-pembayaran"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Pembayaran
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCurrency
                ? "Edit Jenis Pembayaran"
                : "Tambah Jenis Pembayaran Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingCurrency
                ? "Perbarui informasi Jenis Pembayaran di bawah ini."
                : "Masukkan informasi Jenis Pembayaran baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <CurrencyForm
            initialdata={editingCurrency ? formData : undefined}
            editing={!!editingCurrency}
            onSubmit={handleSubmit}
            // loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari Jenis Pembayaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-7 w-full"
          />
        </div>

        {/* Action Buttons */}
        <Button onClick={handleSearch} disabled={loading}>
          <SearchIcon className="mr-2 h-4 w-4" />
          Cari
        </Button>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">ID</TableHead>
                <TableHead className="w-[20%]">Nama</TableHead>
                <TableHead className="w-[20%]">Symbol</TableHead>
                <TableHead className="w-[40%]">Created At</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[10%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {hasActiveFilters
                      ? "Tidak ada Jenis Pembayaran yang ditemukan dengan filter yang diterapkan"
                      : "Belum ada data Jenis Pembayaran"}
                  </TableCell>
                </TableRow>
              ) : (
                units.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.symbol}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.is_active ? "okay" : "secondary"}
                      >
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
                          <DropdownMenuItem
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (category.id) {
                                handleDelete(category.id);
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
          <GlobalPaginationFunction
            page={page}
            total={total}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            handleRowsPerPageChange={handleRowsPerPageChange}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
