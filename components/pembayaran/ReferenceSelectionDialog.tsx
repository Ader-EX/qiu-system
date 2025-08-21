import {
    pembelianService,
    StatusPembelianEnum,
} from "@/services/pembelianService";
import {
    penjualanService,
    StatusPenjualanEnum,
} from "@/services/penjualanService";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Search, Trash2} from "lucide-react";
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
import {formatMoney} from "@/lib/utils";

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
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (open) {
            loadReferences();
        }
    }, [open, referenceType, page, rowsPerPage]);

    const loadReferences = async () => {
        setLoading(true);
        try {
            if (referenceType === "PEMBELIAN") {
                const response = await pembelianService.getAllPembelian({
                    page: page - 1,
                    size: rowsPerPage,
                    search_key: search,
                    status_pembelian: StatusPembelianEnum.ACTIVE,
                    vendor_id: referenceId,
                });
                setReferences(response.data || []);
                setTotal(response.total || 0);
                setTotalPages(Math.ceil((response.total || 0) / rowsPerPage));
            } else {
                const response = await penjualanService.getAllPenjualan({
                    page: page - 1,
                    size: rowsPerPage,
                    search_key: search,
                    status_penjualan: StatusPenjualanEnum.ACTIVE,
                    customer_id: referenceId,
                });
                setReferences(response.data || []);
                setTotal(response.total || 0);
                setTotalPages(Math.ceil((response.total || 0) / rowsPerPage));
            }
        } catch (error) {
            console.error("Error loading references:", error);
            toast.error("Failed to load references");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadReferences();
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
            user_paid_amount: totalOutstanding, // Default to full outstanding amount
        };

        onSelect(selectedRef);
        onOpenChange(false);
    };

    return (
        <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        Select {referenceType === "PEMBELIAN" ? "Pembelian" : "Penjualan"}
                    </h2>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
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
                    <Button onClick={handleSearch}>
                        <Search className="h-4 w-4"/>
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
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
                                        <TableCell className={"text-right"}>
                                            <Button size="sm" onClick={() => handleSelect(ref)}>
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-4">
                            <GlobalPaginationFunction
                                page={page}
                                total={total}
                                totalPages={totalPages}
                                rowsPerPage={rowsPerPage}
                                isSmall={true}
                                handleRowsPerPageChange={(value) => setRowsPerPage(value)}
                                handlePageChange={(value) => setPage(value)}
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
                                     isViewMode = false,
                                 }: {
    selectedReferences: SelectedReference[];
    onRemove: (id: number) => void;
    onAmountChange: (id: number, amount: number) => void;
    referenceType: "PEMBELIAN" | "PENJUALAN";
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
                    <TableHead>Total Pembayaran</TableHead>
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
                            <Input
                                type="number"
                                className="w-32"
                                value={ref.user_paid_amount || 0}
                                onChange={(e) => onAmountChange(ref.id, Number(e.target.value))}
                                max={ref.total_outstanding}
                                min={0}
                                disabled={isViewMode}
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
