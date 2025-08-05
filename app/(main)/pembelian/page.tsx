"use client";

import React, {useState, useEffect} from "react";
import {Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, RefreshCw} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {AlertSuccess} from "@/components/alert-success";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {Skeleton} from "@/components/ui/skeleton";

import {
    pembelianService,
    StatusPembelianEnum,
    StatusPembayaranEnum,
    PembelianListResponse,
    PembelianFilters,
} from "@/services/pembelianService";
import GlobalPaginationFunction from "@/components/pagination-global";
import toast from "react-hot-toast";

export default function PembelianPage() {
    // State management
    const [pembelians, setPembelians] = useState<PembelianListResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [statusPembelian, setStatusPembelian] = useState("");
    const [statusPembayaran, setStatusPembayaran] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(50);

    // Delete confirmation
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch data
    const fetchPembelians = async (filters: PembelianFilters = {}) => {
        try {
            setLoading(true);


            const response = await pembelianService.getAllPembelian({
                ...filters,
                page: currentPage,
                size: pageSize,
            });

            setPembelians(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to fetch pembelians";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filters: PembelianFilters = {};

        if (statusPembelian) filters.status_pembelian = statusPembelian as StatusPembelianEnum;
        if (statusPembayaran) filters.status_pembayaran = statusPembayaran as StatusPembayaranEnum;
        if (searchTerm) filters.search_key = searchTerm;
        if (rowsPerPage) filters.size = rowsPerPage;

        fetchPembelians(filters);
    }, [currentPage, statusPembelian, statusPembayaran, rowsPerPage]);

    const filteredPembelians = pembelians.filter(
        (pembelian) =>
            pembelian.no_pembelian.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pembelian.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );


    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        confirmDelete().then(r => toast.success("Pembelian berhasil dihapus!"));
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setDeleting(true);
            await pembelianService.deletePembelian(itemToDelete);

            toast.success("Pembelian berhasil dihapus!");


            await fetchPembelians();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to delete pembelian";
            toast.error(errorMsg);

        } finally {
            setDeleting(false);
            setDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    // Refresh data
    const handleRefresh = () => {
        fetchPembelians();
    };

    // Clear filters
    const clearFilters = () => {
        setStatusPembelian("");
        setStatusPembayaran("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    // Status badge components
    const getStatusBadge = (status: StatusPembelianEnum) => {
        const variants = {
            [StatusPembelianEnum.DRAFT]: {variant: "secondary" as const, label: "Draft"},
            [StatusPembelianEnum.ACTIVE]: {variant: "default" as const, label: "Aktif"},
            [StatusPembelianEnum.COMPLETED]: {variant: "okay" as const, label: "Selesai"},
        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getPaymentStatusBadge = (status: StatusPembayaranEnum) => {
        const variants = {
            [StatusPembayaranEnum.UNPAID]: {variant: "destructive" as const, label: "Belum Bayar"},
            [StatusPembayaranEnum.HALF_PAID]: {variant: "secondary" as const, label: "Sebagian"},
            [StatusPembayaranEnum.PAID]: {variant: "default" as const, label: "Lunas"},
        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleRowsPerPageChange = (i: number) => {
        setRowsPerPage(i)
        setCurrentPage(1)

    }

    // Format currency


    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="space-y-6">

            <SidebarHeaderBar
                title="Pembelian"
                rightContent={
                    <HeaderActions.ActionGroup>

                        <Button size="sm" asChild>
                            <Link href="/pembelian/create">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Pembelian
                            </Link>
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />


            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Cari pembelian atau customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground"/>
                    <Select value={statusPembelian} onValueChange={setStatusPembelian}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status Pembelian"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value={"DRAFT"}>Draft</SelectItem>
                            <SelectItem value={"AKTIF"}>Aktif</SelectItem>
                            <SelectItem value={"COMPLETED"}>Selesai</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusPembayaran} onValueChange={setStatusPembayaran}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status Bayar"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Bayar</SelectItem>
                            <SelectItem value={StatusPembayaranEnum.UNPAID}>Belum Bayar</SelectItem>
                            <SelectItem value={StatusPembayaranEnum.HALF_PAID}>Sebagian</SelectItem>
                            <SelectItem value={StatusPembayaranEnum.PAID}>Lunas</SelectItem>
                        </SelectContent>
                    </Select>

                    {(statusPembelian || statusPembayaran || searchTerm) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex space-x-4">
                            <Skeleton className="h-12 w-24"/>
                            <Skeleton className="h-12 w-48"/>
                            <Skeleton className="h-12 w-24"/>
                            <Skeleton className="h-12 w-32"/>
                            <Skeleton className="h-12 w-20"/>
                            <Skeleton className="h-12 w-20"/>
                            <Skeleton className="h-12 w-16"/>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pembelian</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pembayaran</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPembelians.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8">
                                        <p className="text-muted-foreground">
                                            {searchTerm ? "Tidak ada pembelian yang cocok dengan pencarian" : "Belum ada data pembelian"}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPembelians.map((pembelian) => (
                                    <TableRow key={pembelian.id}>
                                        <TableCell className="font-medium">
                                            <span className="font-mono">{pembelian.no_pembelian}</span>
                                        </TableCell>
                                        <TableCell>
                                            {pembelian.customer_name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pembelian.warehouse_name || '-'}
                                        </TableCell>
                                        <TableCell>{formatDate(pembelian.sales_date)}</TableCell>
                                        <TableCell>{pembelian.total_qty || 0}</TableCell>
                                        <TableCell>{pembelian.total_price || 0}</TableCell>
                                        <TableCell>{getStatusBadge(pembelian.status_pembelian)}</TableCell>
                                        <TableCell>{getPaymentStatusBadge(pembelian.status_pembayaran)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {pembelian.items_count} unit
                                            </Badge>
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
                                                        <Link href={`/pembelian/${pembelian.id}`}>
                                                            <Eye className="mr-2 h-4 w-4"/>
                                                            Lihat Detail
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {pembelian.status_pembelian === StatusPembelianEnum.DRAFT && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/pembelian/${pembelian.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4"/>
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {pembelian.status_pembelian === StatusPembelianEnum.DRAFT && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(pembelian.id)}
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
            )}


        </div>
    );
}