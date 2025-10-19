"use client";

import React, { useState, useEffect } from "react";

import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search as SearchIcon,
  File,
  Calendar,
} from "lucide-react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

import GlobalPaginationFunction from "@/components/pagination-global";
import toast from "react-hot-toast";
import { cn, formatMoney } from "@/lib/utils";
import {
  PenjualanFilters,
  PenjualanListResponse,
  penjualanService,
  StatusPembayaranEnum,
  StatusPenjualanEnum,
} from "@/services/penjualanService";
import { pembelianService } from "@/services/pembelianService";
import { usePrintInvoice } from "@/hooks/usePrintInvoice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import AuditDialog from "@/components/AuditDialog";
import { RollbackAlert } from "@/components/rollback-alert";

export default function PenjualanPage() {
  // State management
  const [pembelians, setPembelians] = useState<PenjualanListResponse[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [statusPenjualan, setStatusPenjualan] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const {
    simplePrint,
    previewInvoice,
    downloadInvoice,
    printInvoice,
    advancedPrint,
    isPrinting,
  } = usePrintInvoice();

  const fetchPenjualans = async (filters: PenjualanFilters = {}) => {
    try {
      const response = await penjualanService.getAllPenjualan({
        ...filters,
        page: currentPage,
        size: rowsPerPage,
      });

      setPembelians(response.data);
      setTotalItems(response.total);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memuat data penjualan";
    }
  };

  useEffect(() => {
    const filters: PenjualanFilters = {};

    if (statusPenjualan)
      filters.status_penjualan = statusPenjualan as StatusPenjualanEnum;
    if (statusPembayaran)
      filters.status_pembayaran = statusPembayaran as StatusPembayaranEnum;
    if (searchTerm) filters.search_key = searchTerm;
    if (rowsPerPage) filters.size = rowsPerPage;

    fetchPenjualans(filters);
  }, [currentPage, statusPenjualan, statusPembayaran, rowsPerPage]);

  const handleDeleteClick = (id: number) => {
    confirmDelete(id).then(() => toast.success("Penjualan berhasil dihapus!"));
  };

  const confirmDelete = async (id: number) => {
    if (!id) return;

    try {
      await penjualanService.deletePenjualan(id);

      await fetchPenjualans();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menghapus penjualan";
      toast.error("Gagal menghapus penjualan");
    }
  };

  const getStatusBadge = (status: StatusPenjualanEnum) => {
    const variants = {
      [StatusPenjualanEnum.DRAFT]: {
        variant: "secondary" as const,
        label: "Draft",
      },
      [StatusPenjualanEnum.ACTIVE]: {
        variant: "yellow" as const,
        label: "Aktif",
      },
      [StatusPenjualanEnum.PROCESSED]: {
        variant: "okay" as const,
        label: "Processed",
      },

      [StatusPenjualanEnum.COMPLETED]: {
        variant: "okay" as const,
        label: "Selesai",
      },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: StatusPembayaranEnum) => {
    const variants = {
      [StatusPembayaranEnum.UNPAID]: {
        variant: "destructive" as const,
        label: "Unpaid",
      },
      [StatusPembayaranEnum.HALF_PAID]: {
        variant: "yellow" as const,
        label: "Half Paid",
      },

      [StatusPembayaranEnum.PAID]: {
        variant: "okay" as const,
        label: "Completed",
      },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleRowsPerPageChange = (i: number) => {
    setRowsPerPage(i);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchPenjualans({
      search_key: searchTerm,
      status_penjualan: statusPenjualan as StatusPenjualanEnum,
      status_pembayaran: statusPembayaran as StatusPembayaranEnum,
      from_date: fromDate,
      to_date: toDate,
      size: rowsPerPage,
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRollback = async (pembayaranId: number) => {
    try {
      await penjualanService.rollbackPenjualan(pembayaranId);
      toast.success("Penjualan berhasil dikembalikan ke draft");

      await fetchPenjualans({
        search_key: searchTerm,
        status_penjualan: statusPenjualan as StatusPenjualanEnum,
        status_pembayaran: statusPembayaran as StatusPembayaranEnum,
        from_date: fromDate,
        to_date: toDate,
        size: rowsPerPage,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal rollback pembayaran";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title="Penjualan"
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" asChild>
              <Link href="/penjualan/add">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Penjualan
              </Link>
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative min-w-[100px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari Penjualan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-7 w-full"
            />
          </div>

          <div className="flex gap-2">
            {/* From Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-6" />
                  {fromDate ? format(fromDate, "dd/MM/yyyy") : "Tgl Mulai"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="self-center">-</span>
            {/* To Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "dd/MM/yyyy") : "Tgl Selesai"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSearch}>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={statusPenjualan} onValueChange={setStatusPenjualan}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status Penjualan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value={"DRAFT"}>Draft</SelectItem>
              <SelectItem value={"ACTIVE"}>Aktif</SelectItem>
              <SelectItem value={"COMPLETED"}>Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusPembayaran} onValueChange={setStatusPembayaran}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status Bayar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Bayar</SelectItem>
              <SelectItem value={StatusPembayaranEnum.UNPAID}>
                Unpaid
              </SelectItem>
              <SelectItem value={StatusPembayaranEnum.HALF_PAID}>
                Half Paid
              </SelectItem>
              <SelectItem value={StatusPembayaranEnum.PAID}>Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Penjualan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Total Penjualan</TableHead>
              <TableHead>Total Dibayar</TableHead>
              <TableHead>Status Transaksi</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pembelians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Tidak ada penjualan yang cocok dengan pencarian"
                      : "Belum ada data penjualan"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              pembelians.map((penjualan) => (
                <TableRow key={penjualan.id}>
                  <TableCell className="font-medium">
                    <span className="font-mono">{penjualan.no_penjualan}</span>
                  </TableCell>
                  <TableCell>{formatDate(penjualan.sales_date)}</TableCell>
                  <TableCell>{penjualan.customer_name}</TableCell>
                  <TableCell>
                    {formatMoney(penjualan.total_price ?? 0)}
                  </TableCell>
                  <TableCell>
                    {formatMoney(
                      (Number(penjualan.total_paid) || 0) +
                        (Number(penjualan.total_return) || 0)
                    )}
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(penjualan.status_penjualan)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(penjualan.status_pembayaran)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/penjualan/${penjualan.id}/view`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <AuditDialog
                          id={Number(penjualan.id)}
                          type={"PENJUALAN"}
                        />
                        {penjualan.status_penjualan ===
                        StatusPenjualanEnum.DRAFT ? (
                          <DropdownMenuItem asChild>
                            <Link href={`/penjualan/${penjualan.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <div
                              onClick={() =>
                                downloadInvoice(
                                  penjualanService,
                                  Number(penjualan.id),
                                  penjualan.no_penjualan,
                                  "html2canvas"
                                )
                              }
                            >
                              <File className="mr-2 h-4 w-4" />
                              Download Invoice
                            </div>
                          </DropdownMenuItem>
                        )}
                        {penjualan.status_penjualan ===
                          StatusPenjualanEnum.ACTIVE && (
                          <RollbackAlert
                            status={penjualan.status_penjualan}
                            id={Number(penjualan.id)}
                            onConfirm={handleRollback}
                          />
                        )}

                        {penjualan.status_penjualan ===
                          StatusPenjualanEnum.DRAFT && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteClick(Number(penjualan.id))
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <GlobalPaginationFunction
          page={currentPage}
          total={totalItems}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          handleRowsPerPageChange={handleRowsPerPageChange}
          handlePageChange={setCurrentPage}
        />
      </>
    </div>
  );
}
