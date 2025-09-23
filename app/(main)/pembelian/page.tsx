"use client";

import React, {useState, useEffect} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Filter,
    RefreshCw,
    Search as SearchIcon,
    File, Calendar,
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

import {
    pembelianService,
    StatusPembelianEnum,
    StatusPembayaranEnum,
    PembelianListResponse,
    PembelianFilters,
} from "@/services/pembelianService";
import GlobalPaginationFunction from "@/components/pagination-global";
import toast from "react-hot-toast";
import {cn, formatMoney} from "@/lib/utils";
import {usePrintInvoice} from "@/hooks/usePrintInvoice";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarComponent} from "@/components/ui/calendar";

export default function PembelianPage() {
    const [pembelians, setPembelians] = useState<PembelianListResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [statusPembelian, setStatusPembelian] = useState("");
    const [statusPembayaran, setStatusPembayaran] = useState("");
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const {
        simplePrint,
        previewInvoice,
        advancedPrint,
        isPrinting,
        downloadInvoice,
    } = usePrintInvoice();

    const fetchPembelians = async (filters: PembelianFilters = {}) => {
        try {
            const response = await pembelianService.getAllPembelian({
                ...filters,
                page: currentPage,
                size: rowsPerPage,
            });


            setPembelians(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to fetch pembelians";
            toast.error(errorMsg);
        }
    };

    useEffect(() => {
        const filters: PembelianFilters = {
            page: currentPage,
            size: rowsPerPage,
        };

        if (statusPembelian && statusPembelian !== "ALL")
            filters.status_pembelian = statusPembelian as StatusPembelianEnum;
        if (statusPembayaran && statusPembayaran !== "ALL")
            filters.status_pembayaran = statusPembayaran as StatusPembayaranEnum;
        fetchPembelians(filters);
    }, [currentPage, statusPembelian, statusPembayaran, rowsPerPage]);

    const filteredPembelians = pembelians.filter(
        (pembelian) =>
            pembelian.no_pembelian.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pembelian.vendor_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ??
                false)
    );

    const handleDeleteClick = (id: number) => {
        confirmDelete(id).then((r) => toast.success("Pembelian berhasil dihapus!"));
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await pembelianService.deletePembelian(id);

            await fetchPembelians();
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to delete pembelian";
            toast.error("Entri pembelian gagal dihapus");
        }
    };

    // Refresh data
    const handleRefresh = () => {
        fetchPembelians();
    };

    const clearFilters = () => {
        setStatusPembelian("");
        setStatusPembayaran("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const getStatusBadge = (status: StatusPembelianEnum) => {
        const variants = {
            [StatusPembelianEnum.DRAFT]: {
                variant: "secondary" as const,
                label: "Draft",
            },
            [StatusPembelianEnum.ACTIVE]: {
                variant: "yellow" as const,
                label: "Aktif",
            },
            [StatusPembelianEnum.PROCESSED]: {
                variant: "okay" as const,
                label: "Processed",
            },
            [StatusPembelianEnum.COMPLETED]: {
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
                label: "Selesai",
            },
        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        const filters = buildFilters();
        await fetchPembelians(filters);
    };

    const buildFilters = (): PembelianFilters => {
        const filters: PembelianFilters = {
            page: currentPage,
            size: rowsPerPage,
        };

        if (statusPembelian && statusPembelian !== "ALL") {
            filters.status_pembelian = statusPembelian as StatusPembelianEnum;
        }
        if (statusPembayaran && statusPembayaran !== "ALL") {
            filters.status_pembayaran = statusPembayaran as StatusPembayaranEnum;
        }
        if (searchTerm.trim()) {
            filters.search_key = searchTerm.trim();
        }

        // Handle date filters - only apply when manually searching
        if (fromDate) {
            filters.from_date = format(fromDate, "yyyy-MM-dd");
        }
        if (toDate) {
            filters.to_date = format(toDate, "yyyy-MM-dd");
        }

        return filters;
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


    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Pembelian"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" asChild>
                            <Link href="/pembelian/add">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Pembelian
                            </Link>
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex space-x-2">
                    <div className="relative max-w-sm">
                        <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Cari Pembelian..."
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
                                        "w-[140px] justify-start text-left font-normal",
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
                                        "w-[140px] justify-start text-left font-normal",
                                        !toDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4"/>
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
                        <SearchIcon className="h-4 w-4"/>
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Select value={statusPembelian} onValueChange={setStatusPembelian}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status Pembelian"/>
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
                            <SelectValue placeholder="Status Bayar"/>
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
                            <TableHead>No. Pembelian</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Nama Vendor</TableHead>
                            <TableHead>Total Pembelian</TableHead>
                            <TableHead>Total Dibayar</TableHead>

                            <TableHead>Status Pembayaran</TableHead>
                            <TableHead>Status Transaksi</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPembelians.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {searchTerm
                                            ? "Tidak ada pembelian yang cocok dengan pencarian"
                                            : "Belum ada data pembelian"}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPembelians.map((pembelian) => (
                                <TableRow key={pembelian.id}>
                                    <TableCell className="font-medium">
                                        <span className="font-mono">{pembelian.no_pembelian}</span>
                                    </TableCell>
                                    <TableCell>{formatDate(pembelian.sales_date)}</TableCell>
                                    <TableCell>{pembelian.vendor_name}</TableCell>
                                    <TableCell>
                                        {formatMoney(pembelian.total_price ?? 0)}
                                    </TableCell>
                                    <TableCell>
                                        {formatMoney(
                                            (Number(pembelian.total_paid) || 0) +
                                            (Number(pembelian.total_return) || 0)
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {getStatusBadge(pembelian.status_pembelian)}
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentStatusBadge(pembelian.status_pembayaran)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/pembelian/${pembelian.id}/view`}>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        Lihat Detail
                                                    </Link>
                                                </DropdownMenuItem>

                                                {pembelian.status_pembelian ===
                                                StatusPembelianEnum.DRAFT ? (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/pembelian/${pembelian.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <div
                                                                onClick={() =>
                                                                    downloadInvoice(
                                                                        pembelianService,
                                                                        Number(pembelian.id),
                                                                        pembelian.no_pembelian,
                                                                        "html2canvas"
                                                                    )
                                                                }
                                                            >
                                                                <File className="mr-2 h-4 w-4"/>
                                                                Download Invoice
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {pembelian.status_pembelian ===
                                                    StatusPembelianEnum.DRAFT && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteClick(Number(pembelian.id))
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
            </>
        </div>
    );
}
