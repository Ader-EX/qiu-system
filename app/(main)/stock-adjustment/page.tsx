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
    CheckCircle,
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
import {cn} from "@/lib/utils";

import {
    StockAdjustmentQueryParams,
    StockAdjustmentResponse,
    stockAdjustmentService
} from "@/services/adjustmentService";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {format} from "date-fns";
import AuditDialog from "@/components/AuditDialog";
import {Spinner} from "@/components/ui/spinner";


export default function StockAdjustmentPage() {
    const [adjustmentsData, setAdjustmentsData] = useState<StockAdjustmentResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [totalItems, setTotalItems] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [adjustmentsType, setAdjustmentsType] = useState("");
    const [adjustmentsStatus, setAdjustmentsStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const loadAdjustments = async (filters: StockAdjustmentQueryParams = {}) => {
        setIsLoading(true);
        try {
            const response = await stockAdjustmentService.getStockAdjustments({
                ...filters,
                skip: (currentPage - 1) * rowsPerPage,
                limit: rowsPerPage,
            });

            setAdjustmentsData(response.data);
            setTotalItems(response.total);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal memuat data stock adjustment";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const buildAutoFilters = (): StockAdjustmentQueryParams => {
        const filters: StockAdjustmentQueryParams = {};

        if (adjustmentsType && adjustmentsType !== "ALL") {
            filters.adjustment_type = adjustmentsType;
        }
        if (adjustmentsStatus && adjustmentsStatus !== "ALL") {
            filters.status = adjustmentsStatus;
        }
        if (fromDate && toDate) {
            filters.from_date = format(fromDate, "yyyy-MM-dd");
            filters.to_date = format(toDate, "yyyy-MM-dd");
        }

        return filters;
    };

    // Build filters with search term for manual search
    const buildSearchFilters = (): StockAdjustmentQueryParams => {
        const filters = buildAutoFilters();

        if (searchTerm) {
            filters.search = searchTerm;
        }

        return filters;
    };

    // Effect for fetching data when filters or pagination changes
    useEffect(() => {
        const filters = buildSearchFilters();
        loadAdjustments(filters);
    }, [currentPage, adjustmentsType, adjustmentsStatus, rowsPerPage]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [adjustmentsType, adjustmentsStatus]);

    const handleDeleteClick = (id: number) => {
        confirmDelete(id).then(() => toast.success("Stock adjustment berhasil dihapus!"));
    };

    const confirmDelete = async (id: number) => {
        if (!id) return;

        try {
            await stockAdjustmentService.deleteStockAdjustment(id);
            // Refresh with current filters including search
            const filters = buildSearchFilters();
            await loadAdjustments(filters);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal menghapus stock adjustment";
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
            IN: {
                variant: "okay" as const,
                label: "In",
            },
            OUT: {
                variant: "destructive" as const,
                label: "Out",
            },
        };

        const config = variants[status as keyof typeof variants] || {
            variant: "secondary" as const,
            label: status,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
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
            filters.search = searchInput.trim();
        }
        await loadAdjustments(filters);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleActivate = async (adjustmentId: number) => {
        try {
            await stockAdjustmentService.activateStockAdjustment(adjustmentId);
            toast.success("Entri berhasil diaktifkan");
            const filters = buildSearchFilters();
            await loadAdjustments(filters);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Gagal mengaktifkan stock adjustment";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Stock Adjustment"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" asChild>
                            <Link href="/stock-adjustment/add">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Stock Adjustment
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
                            placeholder="Cari Stock Adjustment..."
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
                    <Select value={adjustmentsType} onValueChange={setAdjustmentsType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipe Adjustment"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value="IN">IN</SelectItem>
                            <SelectItem value="OUT">OUT</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={adjustmentsStatus} onValueChange={setAdjustmentsStatus}>
                        <SelectTrigger className="w-40">
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
                        <TableHead>No Adjustment</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe Adjustment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                <Spinner/>
                            </TableCell>
                        </TableRow>
                    ) : adjustmentsData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {searchTerm || adjustmentsType || adjustmentsStatus
                                        ? "Tidak ada stock adjustment yang cocok dengan filter"
                                        : "Belum ada data stock adjustment"}
                                </p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        adjustmentsData.map((adj) => (
                            <TableRow key={adj.id}>
                                <TableCell className="font-medium">
                                    <span className="font-mono">{adj.no_adjustment}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">
                                        {formatDate(adj.adjustment_date)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(adj.adjustment_type)}
                                </TableCell>
                                <TableCell>{getStatusBadge(adj.status_adjustment)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/stock-adjustment/${adj.id}/view`}>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Lihat Detail
                                                </Link>
                                            </DropdownMenuItem>

                                            {adj.status_adjustment === "DRAFT" && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => handleActivate(adj.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4"/>
                                                        Aktifkan
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/stock-adjustment/${adj.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            <AuditDialog id={adj.id} type={"STOCK_ADJUSTMENT"}/>

                                            {adj.status_adjustment === "DRAFT" && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(Number(adj.id))}
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