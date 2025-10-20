"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Search as SearchIcon,
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
import { TOPUnit } from "@/types/types";

import { mataUangService } from "@/services/mataUangService";
import GlobalPaginationFunction from "@/components/pagination-global";
import CurrencyForm from "@/components/currency/CurrencyForm";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

export default function CurrencyPage() {
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

  // Load units on component mount and when page/rowsPerPage changes
  useEffect(() => {
    loadUnits(page, "", rowsPerPage);
  }, [page, rowsPerPage]);

  const loadUnits = async (page: number, searchTerm: string, limit: number) => {
    try {
      setLoading(true);
      const requestParams: any = {
        skip: (page - 1) * limit,
        limit: limit,
        search: searchTerm,
      };

      if (fromDate) {
        requestParams.from_date = format(fromDate, "yyyy-MM-dd");
      }

      if (toDate) {
        requestParams.to_date = format(toDate, "yyyy-MM-dd");
      }
      const response = await mataUangService.getAllMataUang(requestParams);

      setUnits(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      toast.error("Gagal memuat data mata uang");
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
          const updatedCurrency = await mataUangService.updateMataUang(
            editingCurrency.id,
            {
              name: data.name,
              symbol: data.symbol,
              is_active: data.is_active,
            }
          );

          // Reload data to get fresh results from server
          await loadUnits(page, searchTerm, rowsPerPage);
        }
        toast.success("mata uang berhasil diperbarui!");
      } else {
        const newCurrency = await mataUangService.createMataUang({
          name: data.name,
          symbol: data.symbol,
          is_active: data.is_active,
        });

        await loadUnits(page, searchTerm, rowsPerPage);
        toast.success("mata uang berhasil ditambahkan!");
      }

      setIsDialogOpen(false);
      setEditingCurrency(null);
      setFormData({ name: "", symbol: "", is_active: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        editingCurrency
          ? "Gagal memperbarui mata uang"
          : "Gagal menambahkan mata uang"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: TOPUnit) => {
    setEditingCurrency(unit);
    setFormData({
      name: unit.name,
      symbol: unit.symbol ? unit.symbol : "",
      is_active: unit.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await mataUangService.deleteMataUang(id);

      // Reload data to get fresh results from server
      await loadUnits(page, searchTerm, rowsPerPage);
      toast.success("mata uang berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Gagal menghapus mata uang");
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
    setPage(1); // Reset to first page
    await loadUnits(1, searchTerm, rowsPerPage); // Direct API call
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Mata Uang"]}
            linkData={["pengaturan", "mata-uang", "mata-uang"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah mata uang
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCurrency ? "Edit mata uang" : "Tambah mata uang Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingCurrency
                ? "Perbarui informasi mata uang di bawah ini."
                : "Masukkan informasi mata uang baru di bawah ini."}
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

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari mata uang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-7 w-full"
          />
        </div>

        <Button onClick={handleSearch} disabled={loading}>
          <SearchIcon className="mr-2 h-4 w-4" /> Cari
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">ID</TableHead>
                <TableHead className="w-[20%]">Nama</TableHead>
                <TableHead className="w-[20%]">Symbol</TableHead>
                <TableHead className="w-[20%]">Created At</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[10%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "Tidak ada mata uang yang ditemukan"
                      : "Belum ada data mata uang"}
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
