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

import {
    PengembalianResponse,
    pengembalianService,
} from "@/services/pengembalianService";
import {PembayaranFilters} from "@/services/pembayaranService";

export default function PengembalianPage() {
    const [pengembalians, setPengembalians] = useState<PengembalianResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [pengembalianType, setPengembalianType] = useState("");
    const [statusPengembalian, setStatusPengembalian] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPengembalians = async (filters: PembayaranFilters = {}) => {
        setIsLoading(true);
        try {
            const response = await pengembalianService.getAllPengembalian({
                ...filters,
                page: currentPage,
                size: rowsPerPage,
            });

            setPengembalians(response.data || []);
            setTotalItems(response.total || 0);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal memuat data pengembalian";
            toast.error(errorMsg);
            setPengembalians([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Build filters object
    const buildFilters = (): PembayaranFilters => {
        const filters: PembayaranFilters = {
            page: currentPage,
            size: rowsPerPage,
        };

        if (pengembalianType && pengembalianType !== "ALL") {
            filters.tipe_referensi = pengembalianType;
        }
        if (statusPengembalian && statusPengembalian !== "ALL") {
            filters.status = statusPengembalian;
        }
        if (searchTerm.trim()) {
            filters.search_key = searchTerm.trim();
        }

        return filters;
    };

    // Effect for initial load and filter changes
    useEffect(() => {
        const filters = buildFilters();
        fetchPengembalians(filters);
    }, [currentPage, pengembalianType, statusPengembalian, rowsPerPage]);

    // Remove the client-side filtering since we're using server-side filtering
    const displayedPengembalians = pengembalians;

    const handleDeleteClick = async (id: number) => {
        try {
            await confirmDelete(id);
            toast.success("Pengembalian berhasil dihapus!");
        } catch (error) {
            // Error already handled in confirmDelete
        }
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await pengembalianService.deletePengembalian(id);
            // Refresh data after deletion
            const filters = buildFilters();
            await fetchPengembalians(filters);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal menghapus pengembalian";
            toast.error(errorMsg);
            throw err; // Re-throw to prevent success message
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

    // Helper function to get reference numbers from pengembalian_details
    const getReferenceNumbers = (pengembalian: PengembalianResponse) => {
        if (
            !pengembalian.pengembalian_details ||
            pengembalian.pengembalian_details.length === 0
        ) {
            return "-";
        }

        const references: string[] = [];

        pengembalian.pengembalian_details.forEach((detail) => {
            if (detail.pembelian_id && detail.pembelian_rel) {
                references.push(detail.pembelian_rel.no_pembelian);
            }
            if (detail.penjualan_id && detail.penjualan_rel) {
                references.push(detail.penjualan_rel.no_penjualan);
            }
        });

        return references.length > 0 ? references.join(", ") : "-";
    };

    const getTotalReturn = (pengembalian: PengembalianResponse): number => {
        const details = pengembalian.pengembalian_details ?? [];

        return details.reduce((sum, d) => {
            const value = parseFloat(d.total_return || "0");
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return "-";
        }
    };

    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const handleSearch = async () => {
        setCurrentPage(1); // Reset to first page when searching
        const filters = buildFilters();
        await fetchPengembalians(filters);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleTypeChange = (value: string) => {
        setPengembalianType(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleStatusChange = (value: string) => {
        setStatusPengembalian(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleRollback = async (pengembalianId: number) => {
        try {
            await pengembalianService.rollbackPengembalian(pengembalianId);
            toast.success("Pengembalian berhasil dikembalikan ke draft");
            const filters = buildFilters();
            await fetchPengembalians(filters);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Gagal melakukan rollback";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Pengembalian"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" asChild>
                            <Link href="/pengembalian/add">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Pengembalian
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
                            placeholder="Cari Pengembalian..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-7 w-full"
                        />
                    </div>

                    <Button onClick={handleSearch} disabled={isLoading}>
                        <SearchIcon className="h-4 w-4"/>
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Select value={pengembalianType} onValueChange={handleTypeChange}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Tipe Pengembalian"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value="PENJUALAN">PENJUALAN</SelectItem>
                            <SelectItem value="PEMBELIAN">PEMBELIAN</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusPengembalian}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="">
                            <SelectValue placeholder="Status Pengembalian"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ACTIVE">Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No Pengembalian</TableHead>
                        <TableHead>No. Referensi</TableHead>
                        <TableHead>Tipe Referensi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Total Pengembalian</TableHead>
                        <TableHead>Status Transaksi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                <p className="text-muted-foreground">Memuat data...</p>
                            </TableCell>
                        </TableRow>
                    ) : displayedPengembalians.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {searchTerm || pengembalianType || statusPengembalian
                                        ? "Tidak ada pengembalian yang cocok dengan filter"
                                        : "Belum ada data pengembalian"}
                                </p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        displayedPengembalians.map((pengembalian) => (
                            <TableRow key={pengembalian.id}>
                                <TableCell className="font-medium">
                                    <span className="font-mono">
                                        {pengembalian.no_pengembalian}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">
                                        {getReferenceNumbers(pengembalian)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="okay">{pengembalian.reference_type}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(pengembalian.payment_date)}</TableCell>
                                <TableCell>
                                    {formatMoney(getTotalReturn(pengembalian))}
                                </TableCell>
                                <TableCell>{getStatusBadge(pengembalian.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/pengembalian/${pengembalian.id}/view`}>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Lihat Detail
                                                </Link>
                                            </DropdownMenuItem>

                                            {pengembalian.status === "ACTIVE" && (
                                                <DropdownMenuItem
                                                    onClick={() => handleRollback(pengembalian.id)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                                    Kembali ke Draft
                                                </DropdownMenuItem>
                                            )}

                                            {pengembalian.status === "DRAFT" && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/pengembalian/${pengembalian.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}

                                            {pengembalian.status === "DRAFT" && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(Number(pengembalian.id))}
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

            {/* Pagination */}
            {!isLoading && totalItems > 0 && (
                <GlobalPaginationFunction
                    page={currentPage}
                    total={totalItems}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    handleRowsPerPageChange={handleRowsPerPageChange}
                    handlePageChange={setCurrentPage}
                />
            )}
        </div>
    );
}