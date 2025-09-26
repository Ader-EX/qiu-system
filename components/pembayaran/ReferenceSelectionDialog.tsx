import {
    pembelianService, StatusPembayaranEnum,
    StatusPembelianEnum,
} from "@/services/pembelianService";
import {
    penjualanService,
    StatusPenjualanEnum,
} from "@/services/penjualanService";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Calendar, Search, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import GlobalPaginationFunction from "../pagination-global";
import {cn, formatMoney} from "@/lib/utils";
import {NumericFormat} from "react-number-format";
import {Badge} from "../ui/badge";
import {formatDate} from "date-fns-jalali";
import {Spinner} from "@/components/ui/spinner";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarComponent} from "../ui/calendar";

// Simplified interface for selected references
interface SelectedReference {
    id: number;
    no_reference: string; // no_pembelian or no_penjualan
    total_outstanding: number; // total_price - (total_paid + total_return)
    total_price: number;
    user_paid_amount: number; // user input
}

const ReferenceSelectionDialog = ({
                                      open,
                                      onOpenChange,
                                      referenceType,
                                      onSelect,
                                      referenceId,
                                  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referenceType: "PEMBELIAN" | "PENJUALAN";
    onSelect: (reference: any) => void;
    referenceId?: string;
}) => {
    const [references, setReferences] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentSearch, setCurrentSearch] = useState("");
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (open) {
            setPage(1);
            setSearch("");
            setCurrentSearch("");
            loadReferences(1, "");
        }
    }, [open, referenceType]);

    // Load references when page or rowsPerPage changes (but not search - that's handled separately)
    useEffect(() => {
        if (open) {
            loadReferences(page, currentSearch);
        }
    }, [page, rowsPerPage]);

    const loadReferences = async (targetPage: number, searchTerm: string, fromDate?: Date, toDate?: Date) => {
        const pageIndex = targetPage - 1;

        setLoading(true);
        try {
            let from_date, to_date;
            if (fromDate) {
                from_date = format(fromDate, "yyyy-MM-dd");
            }
            if (toDate) {
                to_date = format(toDate, "yyyy-MM-dd");
            }
            if (referenceType === "PEMBELIAN") {

                const response = await pembelianService.getAllPembelian({
                    page: pageIndex,
                    size: rowsPerPage,
                    search_key: searchTerm,
                    status_pembelian: StatusPembelianEnum.ACTIVE,
                    vendor_id: referenceId,
                    from_date: from_date,
                    to_date: to_date,
                    is_picker_view: true
                });
                setReferences(response.data || []);
                setTotal(response.total || 0);
                setTotalPages(Math.ceil((response.total || 0) / rowsPerPage));
            } else {
                const response = await penjualanService.getAllPenjualan({
                    page: pageIndex,
                    size: rowsPerPage,
                    search_key: searchTerm,
                    status_penjualan: StatusPenjualanEnum.ACTIVE,
                    customer_id: referenceId,
                    from_date: fromDate,
                    to_date: toDate,
                    is_picker_view: true
                });
                setReferences(response.data || []);
                setTotal(response.total || 0);
                setTotalPages(Math.ceil((response.total || 0) / rowsPerPage));
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load references");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {

        setPage(1);
        setCurrentSearch(search);
        loadReferences(1, search, fromDate, toDate);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(1);

    };

    const handleSelect = (reference: any) => {
        // Calculate outstanding amount
        const totalOutstanding =
            reference.total_price -
            (reference.total_paid || 0) -
            (reference.total_return || 0);

        const selectedRef = {
            id: reference.id,
            no_reference:
                referenceType === "PEMBELIAN"
                    ? reference.no_pembelian
                    : reference.no_penjualan,
            total_outstanding: totalOutstanding,
            user_paid_amount: totalOutstanding,
        };

        onSelect(selectedRef);
        onOpenChange(false);
    };

    const handleClose = () => {
        // Reset all states when closing
        setSearch("");
        setCurrentSearch("");
        setPage(1);
        setReferences([]);
        onOpenChange(false);
    };


    const getStatusBadge = (status: StatusPembayaranEnum) => {
        const variants = {
            [StatusPembayaranEnum.HALF_PAID]: {
                variant: "yellow" as const,
                label: "Half-Paid",
            },
            [StatusPembayaranEnum.UNPAID]: {
                variant: "secondary" as const,
                label: "Unpaid",
            },
            [StatusPembayaranEnum.PAID]: {
                variant: "okay" as const,
                label: "Paid",
            },

        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };


    return (
        <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
            <div className="fixed inset-0 bg-black/50" onClick={handleClose}/>
            <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        Select {referenceType === "PEMBELIAN" ? "Pembelian" : "Penjualan"}
                    </h2>
                    <Button variant="ghost" onClick={handleClose}>
                        ×
                    </Button>
                </div>

                <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                        <Input
                            placeholder={`Search ${referenceType.toLowerCase()}...`}
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                        <Search className="h-4 w-4"/>
                    </Button>
                </div>


                {loading ? (
                    <Spinner/>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {referenceType === "PEMBELIAN"
                                            ? "No. Pembelian"
                                            : "No. Penjualan"}
                                    </TableHead>
                                    <TableHead>
                                        Tanggal
                                    </TableHead>
                                    <TableHead>
                                        Total Harga
                                    </TableHead>
                                    <TableHead>
                                        Status
                                    </TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {references.map((ref) => (
                                    <TableRow key={ref.id}>
                                        <TableCell>
                                            {referenceType === "PEMBELIAN"
                                                ? ref.no_pembelian
                                                : ref.no_penjualan}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(ref.sales_date).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {formatMoney(ref.total_price)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(ref.status_pembayaran || "")}
                                        </TableCell>
                                        <TableCell className={"text-right"}>
                                            <Button size="sm" onClick={() => handleSelect(ref)}>
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {references.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No {referenceType === "PEMBELIAN" ? "pembelian" : "penjualan"}{" "}
                                found
                                {currentSearch && ` for "${currentSearch}"`}
                            </div>
                        )}

                        <div className="mt-4">
                            <GlobalPaginationFunction
                                page={page}
                                total={total}
                                totalPages={totalPages}
                                rowsPerPage={rowsPerPage}
                                handleRowsPerPageChange={handleRowsPerPageChange}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const SelectedReferencesTable = ({
                                     selectedReferences,
                                     onRemove,
                                     onAmountChange,
                                     referenceType,
                                     isPembayaran = true,
                                     isViewMode = false,
                                 }: {
    selectedReferences: SelectedReference[];
    onRemove: (id: number) => void;
    onAmountChange: (id: number, amount: number) => void;
    referenceType: "PEMBELIAN" | "PENJUALAN";
    isPembayaran?: boolean;
    isViewMode?: boolean;
}) => {
    if (selectedReferences.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No {referenceType === "PEMBELIAN" ? "Pembelian" : "Penjualan"}{" "}
                references added yet
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        {referenceType === "PEMBELIAN" ? "No. Pembelian" : "No. Penjualan"}
                    </TableHead>
                    <TableHead>Total Penjualan/Pembelian</TableHead>
                    <TableHead>Total Remaining</TableHead>
                    <TableHead>
                        Total {isPembayaran ? `Pembayaran` : `Pengembalian`}
                    </TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {selectedReferences.map((ref) => (
                    <TableRow key={ref.id}>
                        <TableCell>{ref.no_reference}</TableCell>
                        <TableCell>{formatMoney(ref.total_outstanding)}</TableCell>
                        <TableCell>{formatMoney(ref.total_outstanding)}</TableCell>
                        <TableCell>
                            <NumericFormat
                                customInput={Input}
                                className="w-32"
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                inputMode="decimal"
                                disabled={isViewMode}
                                value={ref.user_paid_amount ?? ""}
                                onValueChange={(e) =>
                                    onAmountChange(ref.id, Number(e.floatValue ?? 0))
                                }
                            />
                        </TableCell>
                        <TableCell>
                            {!isViewMode && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(ref.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export {
    ReferenceSelectionDialog,
    SelectedReferencesTable,
    type SelectedReference,
};
