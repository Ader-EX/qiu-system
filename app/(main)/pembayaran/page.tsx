"use client";

import React, {useState, useEffect} from "react";

import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search as SearchIcon,
    RefreshCw,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
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
import {Calendar as CalendarComponent} from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

import GlobalPaginationFunction from "@/components/pagination-global";
import toast from "react-hot-toast";
import {cn, formatMoney} from "@/lib/utils";

import {usePrintInvoice} from "@/hooks/usePrintInvoice";

import {
    PembayaranFilters,
    PembayaranResponse,
    pembayaranService,
} from "@/services/pembayaranService";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {format} from "date-fns";
import AuditDialog from "@/components/AuditDialog";

export default function PembayaranPage() {
    const [pembayarans, setPembayarans] = useState<PembayaranResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState(""); // Separate state for input
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [pembayaranType, setPembayaranType] = useState("");
    const [statusPembayaran, setStatusPembayaran] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPembayarans = async (filters: PembayaranFilters = {}) => {
        setIsLoading(true);
        try {
            const response = await pembayaranService.getAllPembayaran({
                ...filters,
                page: currentPage,
                size: rowsPerPage,
            });

            setPembayarans(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal memuat data pembayaran";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Build filters object - removed searchTerm from automatic filters
    const buildAutoFilters = (): PembayaranFilters => {
        const filters: PembayaranFilters = {};

        if (pembayaranType && pembayaranType !== "ALL") {
            filters.tipe_referensi = pembayaranType;
        }
        if (statusPembayaran && statusPembayaran !== "ALL") {
            filters.status = statusPembayaran;
        }
        if (fromDate && toDate) {
            filters.from_date = format(fromDate, "yyyy-MM-dd");
            filters.to_date = format(toDate, "yyyy-MM-dd");
        }

        return filters;
    };

    // Build filters with search term for manual search
    const buildSearchFilters = (): PembayaranFilters => {
        const filters = buildAutoFilters();

        if (searchTerm) {
            filters.search_key = searchTerm;
        }

        return filters;
    };

    // Effect for fetching data when filters or pagination changes (excluding searchTerm)
    useEffect(() => {
        const filters = buildSearchFilters();
        fetchPembayarans(filters);
    }, [currentPage, pembayaranType, statusPembayaran, rowsPerPage]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [pembayaranType, statusPembayaran]);

    const handleDeleteClick = (id: number) => {
        confirmDelete(id).then(() => toast.success("Pembayaran berhasil dihapus!"));
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await pembayaranService.deletePembayaran(id);
            // Refresh with current filters including search
            const filters = buildSearchFilters();
            await fetchPembayarans(filters);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal menghapus pembayaran";
            toast.error(errorMsg);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            DRAFT: {
                variant: "secondary" as const,
                label: "Draft",
            },
            ACTIVE: {
                variant: "okay" as const,
                label: "Aktif",
            },
        };

        const config = variants[status as keyof typeof variants] || {
            variant: "secondary" as const,
            label: status,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // Helper function to get reference numbers from pembayaran_details
    const getReferenceNumbers = (pembayaran: PembayaranResponse) => {
        if (
            !pembayaran.pembayaran_details ||
            pembayaran.pembayaran_details.length === 0
        ) {
            return "-";
        }

        const references: string[] = [];

        pembayaran.pembayaran_details.forEach((detail) => {
            if (detail.pembelian_id && detail.pembelian_rel) {
                references.push(detail.pembelian_rel.no_pembelian);
            }
            if (detail.penjualan_id && detail.penjualan_rel) {
                references.push(detail.penjualan_rel.no_penjualan);
            }
        });

        return references.length > 0 ? references.join(", ") : "-";
    };

    const getTotalPayment = (pembayaran: PembayaranResponse) => {
        if (
            !pembayaran.pembayaran_details ||
            pembayaran.pembayaran_details.length === 0
        ) {
            return 0;
        }

        return pembayaran.pembayaran_details.reduce((total, detail) => {
            return total + parseFloat(detail.total_paid || "0");
        }, 0);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1); // Reset to first page
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
        setSearchTerm(searchInput.trim());
        setCurrentPage(1);
        const filters = buildAutoFilters();
        if (searchInput.trim()) {
            filters.search_key = searchInput.trim();
        }
        await fetchPembayarans(filters);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleRollback = async (pembayaranId: number) => {
        try {
            await pembayaranService.rollbackPembayaran(pembayaranId);
            toast.success("Pembayaran berhasil dikembalikan ke draft");
            const filters = buildSearchFilters();
            await fetchPembayarans(filters);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal rollback pembayaran";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Pembayaran"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" asChild>
                            <Link href="/pembayaran/add">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Pembayaran
                            </Link>
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative min-w-[100px]">
                        <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Cari Pembayaran..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
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
                                    <Calendar className="mr-2 h-4 w-6"/>
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
                                    <Calendar className="mr-2 h-4 w-6"/>
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

                    <Button onClick={handleSearch} disabled={isLoading}>
                        <SearchIcon className="h-4 w-4"/>
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Select value={pembayaranType} onValueChange={setPembayaranType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipe Pembayaran"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value="PENJUALAN">PENJUALAN</SelectItem>
                            <SelectItem value="PEMBELIAN">PEMBELIAN</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusPembayaran} onValueChange={setStatusPembayaran}>
                        <SelectTrigger className="w-70">
                            <SelectValue placeholder="Status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ACTIVE">Aktif</SelectItem>
                        </SelectContent>
                    </Select>


                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No Pembayaran</TableHead>
                        <TableHead>No. Referensi</TableHead>
                        <TableHead>Tipe Referensi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama Klien</TableHead>
                        <TableHead>Total Pembayaran</TableHead>
                        <TableHead>Status Transaksi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                <p className="text-muted-foreground">Loading...</p>
                            </TableCell>
                        </TableRow>
                    ) : pembayarans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {searchTerm || pembayaranType || statusPembayaran
                                        ? "Tidak ada pembayaran yang cocok dengan filter"
                                        : "Belum ada data pembayaran"}
                                </p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        pembayarans.map((pembayaran) => (
                            <TableRow key={pembayaran.id}>
                                <TableCell className="font-medium">
                                    <span className="font-mono">{pembayaran.no_pembayaran}</span>
                                </TableCell>
                                <TableCell>
                  <span className="font-mono text-sm">
                    {getReferenceNumbers(pembayaran)}
                  </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="okay">{pembayaran.reference_type}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(pembayaran.payment_date)}</TableCell>
                                <TableCell>
                                    {pembayaran?.vend_rel?.name ||
                                        pembayaran?.customer_rel?.name ||
                                        "-"}
                                </TableCell>
                                <TableCell>
                                    {formatMoney(getTotalPayment(pembayaran))}
                                </TableCell>
                                <TableCell>{getStatusBadge(pembayaran.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/pembayaran/${pembayaran.id}/view`}>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Lihat Detail
                                                </Link>
                                            </DropdownMenuItem>

                                            {pembayaran.status === "ACTIVE" && (
                                                <DropdownMenuItem
                                                    onClick={() => handleRollback(pembayaran.id)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                                    Kembali ke Draft
                                                </DropdownMenuItem>
                                            )}

                                            {pembayaran.status === "DRAFT" && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/pembayaran/${pembayaran.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <AuditDialog id={pembayaran.id} type={"PEMBAYARAN"}/>
                                            {pembayaran.status === "DRAFT" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteClick(Number(pembayaran.id))
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
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
        </div>
    );
}
