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
    File, RefreshCw,
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

import GlobalPaginationFunction from "@/components/pagination-global";
import toast from "react-hot-toast";
import {formatMoney} from "@/lib/utils";


import {usePrintInvoice} from "@/hooks/usePrintInvoice";

import {
    PembayaranFilters,
    PembayaranResponse,
    pembayaranService,
    PembayaranType,
    StatusPembayaran
} from "@/services/pembayaranService";

export default function PembayaranPage() {

    const [pembayarans, setPembayarans] = useState<PembayaranResponse[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [pembayaranType, setPembayaranType] = useState("");
    const [statusPembayaran, setStatusPembayaran] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(50);
    const {simplePrint, previewInvoice, advancedPrint, isPrinting} =
        usePrintInvoice();

    const fetchPembayarans = async (filters: PembayaranFilters = {}) => {
        try {
            const response = await pembayaranService.getAllPembayaran({
                ...filters,
                page: currentPage,
                size: pageSize,
            });

            setPembayarans(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal memuat data pembayaran";
            toast.error(errorMsg);
        }
    };

    useEffect(() => {
        const filters: PembayaranFilters = {};

        if (pembayaranType)
            filters.tipe_referensi = pembayaranType;
        if (statusPembayaran)
            filters.status = statusPembayaran;
        if (searchTerm) filters.search_key = searchTerm;
        if (rowsPerPage) filters.size = rowsPerPage;

        fetchPembayarans(filters);
    }, [currentPage, pembayaranType, statusPembayaran, rowsPerPage]);

    const filteredPembayarans = pembayarans.filter(
        (pembayaran) =>
            pembayaran.no_pembayaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pembayaran.customer_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ??
                false)
    );

    const handleDeleteClick = (id: number) => {
        confirmDelete(id).then(() => toast.success("Pembayaran berhasil dihapus!"));
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await pembayaranService.deletePembayaran(id);

            await fetchPembayarans();
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal menghapus pembayaran";
            toast.error(errorMsg);
        }
    };

    // Refresh data
    const handleRefresh = () => {
        fetchPembayarans();
    };

    const clearFilters = () => {
        setPembayaranType("");
        setStatusPembayaran("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            "DRAFT": {
                variant: "secondary" as const,
                label: "Draft",
            },
            "ACTIVE": {
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
        if (!pembayaran.pembayaran_details || pembayaran.pembayaran_details.length === 0) {
            return "-";
        }

        const references: string[] = [];

        pembayaran.pembayaran_details.forEach(detail => {
            if (detail.pembelian_id && detail.pembelian_rel) {
                references.push(detail.pembelian_rel.no_pembelian);
            }
            if (detail.penjualan_id && detail.penjualan_rel) {
                references.push(detail.penjualan_rel.no_penjualan);
            }
        });

        return references.length > 0 ? references.join(", ") : "-";
    };

    // Helper function to calculate total payment amount
    const getTotalPayment = (pembayaran: PembayaranResponse) => {
        if (!pembayaran.pembayaran_details || pembayaran.pembayaran_details.length === 0) {
            return 0;
        }

        return pembayaran.pembayaran_details.reduce((total, detail) => {
            return total + parseFloat(detail.total_paid || "0");
        }, 0);
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

    const totalPages = Math.ceil(totalItems / pageSize);

    const handleSearch = async () => {
        setCurrentPage(1);
        await fetchPembayarans();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
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
                <div className="flex space-x-2">
                    <div className="relative max-w-sm">
                        <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Cari Pembayaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-7 w-full"
                        />
                    </div>

                    <Button onClick={handleSearch}>
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
                            <SelectItem value={"PENJUALAN"}>PENJUALAN</SelectItem>
                            <SelectItem value={"PEMBELIAN"}>PEMBELIAN</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusPembayaran} onValueChange={setStatusPembayaran}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status Pembayaran"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value={"DRAFT"}>Draft</SelectItem>
                            <SelectItem value={"ACTIVE"}>Aktif</SelectItem>

                        </SelectContent>
                    </Select>
                </div>
            </div>

            <>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No Pembayaran</TableHead>
                            <TableHead>No. Referensi</TableHead>
                            <TableHead>Tipe Referensi</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Total Pembayaran</TableHead>
                            <TableHead>Status Transaksi</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPembayarans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {searchTerm
                                            ? "Tidak ada pembayaran yang cocok dengan pencarian"
                                            : "Belum ada data pembayaran"}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPembayarans.map((pembayaran) => (
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
                                        <Badge variant="okay">
                                            {pembayaran.reference_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(pembayaran.payment_date)}</TableCell>
                                    <TableCell>
                                        {formatMoney(getTotalPayment(pembayaran))}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(pembayaran.status)}
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
                                                    <Link href={`/pembayaran/${pembayaran.id}/view`}>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        Lihat Detail
                                                    </Link>
                                                </DropdownMenuItem>

                                                {pembayaran.status === "ACTIVE" && (
                                                    <DropdownMenuItem asChild>
                                                        <span
                                                            className={"text-destructive hover:text-destructive/90"}
                                                            onClick={() => {
                                                                pembayaranService.rollbackPembayaran(pembayaran.id).then(r => {
                                                                    toast.success("Pembayaran berhasil dikembalikan ke draft");
                                                                    fetchPembayarans();
                                                                })
                                                            }}>
                                                            <RefreshCw className="mr-2 h-4 w-4"/>
                                                            Kembali ke Draft
                                                        </span>
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
            </>
        </div>
    );
}