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
    const [pengembalians, setPengembalians] = useState<PengembalianResponse[]>(
        []
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [pengembalianType, setPengembalianType] = useState("");
    const [statusPengembalian, setStatusPengembalian] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);


    const fetchPengembalians = async (filters: PembayaranFilters = {}) => {
        try {
            const response = await pengembalianService.getAllPengembalian({
                ...filters,
                page: currentPage,
                size: rowsPerPage,
            });

            setPengembalians(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal memuat data pengembalian";
            toast.error(errorMsg);
        }
    };

    useEffect(() => {
        const filters: PembayaranFilters = {};

        if (pengembalianType) filters.tipe_referensi = pengembalianType;
        if (statusPengembalian) filters.status = statusPengembalian;
        if (searchTerm) filters.search_key = searchTerm;
        if (rowsPerPage) filters.size = rowsPerPage;

        fetchPengembalians(filters);
    }, [currentPage, pengembalianType, statusPengembalian, rowsPerPage]);

    const filteredPengembalians = (pengembalians ?? []).filter(
        (pengembalian) =>
            pengembalian?.no_pengembalian
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (pengembalian?.customer_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ??
                false)
    );

    const handleDeleteClick = (id: number) => {
        confirmDelete(id).then(() =>
            toast.success("Pengembalian berhasil dihapus!")
        );
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await pengembalianService.deletePengembalian(id);

            await fetchPengembalians();
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal menghapus pengembalian";
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

    const toNum = (v: unknown): number => {
        if (typeof v === "number") return Number.isFinite(v) ? v : 0;
        if (typeof v === "string") {
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    const getTotalReturn = (pengembalian: PengembalianResponse): number => {
        const details = pengembalian.pengembalian_details ?? [];

        return details.reduce((sum, d) => {
            const value = parseFloat(d.total_return || "0");
            return value;
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

    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const handleSearch = async () => {
        setCurrentPage(1);
        await fetchPengembalians();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
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

                    <Button onClick={handleSearch}>
                        <SearchIcon className="h-4 w-4"/>
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Select value={pengembalianType} onValueChange={setPengembalianType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipe Pengembalian"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value={"PENJUALAN"}>PENJUALAN</SelectItem>
                            <SelectItem value={"PEMBELIAN"}>PEMBELIAN</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusPengembalian}
                        onValueChange={setStatusPengembalian}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status Pengembalian"/>
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
                        {filteredPengembalians.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {searchTerm
                                            ? "Tidak ada pengembalian yang cocok dengan pencarian"
                                            : "Belum ada data pengembalian"}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPengembalians.map((pengembalian) => (
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
                                                    <DropdownMenuItem asChild>
                            <span
                                className={
                                    "text-destructive hover:text-destructive/90"
                                }
                                onClick={() => {
                                    pengembalianService
                                        .rollbackPengembalian(pengembalian.id)
                                        .then((r) => {
                                            toast.success(
                                                "Pengembalian berhasil dikembalikan ke draft"
                                            );
                                            fetchPengembalians();
                                        });
                                }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4"/>
                              Kembali ke Draft
                            </span>
                                                    </DropdownMenuItem>
                                                )}

                                                {pengembalian.status === "DRAFT" && (
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/pengembalian/${pengembalian.id}/edit`}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {pengembalian.status === "DRAFT" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDeleteClick(Number(pengembalian.id))
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
