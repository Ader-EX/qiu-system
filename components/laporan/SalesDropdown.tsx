// imports (added kodeLambungService)
import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Download, Calendar as CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {formatMoney} from "@/lib/utils";
import {LaporanPenjualanRows, utilsService} from "@/services/utilsService";
import {Spinner} from "../ui/spinner";
import GlobalPaginationFunction from "../pagination-global";
import {PaginatedResponse} from "@/types/types";
import toast from "react-hot-toast";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import SearchableSelect from "../SearchableSelect";
import {customerService} from "@/services/customerService";
import {kodeLambungService} from "@/services/kodeLambungService";

const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const SalesDropdown = () => {
    const [dateFrom, setDateFrom] = useState<Date>(new Date(2025, 0, 1));
    const [dateTo, setDateTo] = useState<Date>(new Date());
    const [customerId, setCustomerId] = useState<number>();
    const [kodeLambungId, setKodeLambungId] = useState<number>(); // <-- NEW
    const [showForm, setShowForm] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [reportData, setReportData] =
        useState<PaginatedResponse<LaporanPenjualanRows> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        if (!dateFrom || !dateTo) {
            toast.error("Silakan pilih tanggal mulai dan selesai");
            return;
        }
        if (dateFrom > dateTo) {
            toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal selesai");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentPage(1);
        setShowForm(false);

        try {
            // keep your initial 0/1-based behavior; just add filters
            const response = await utilsService.getLaporanPenjualan(
                dateFrom,
                dateTo,
                0,
                pageSize,
                customerId,
                kodeLambungId // <-- NEW
            );
            setReportData(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setShowForm(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setShowForm(true);
        setCurrentPage(1);
        setReportData(null);
        setError(null);
    };

    const toInputDate = (d: Date | null) =>
        d
            ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 10)
            : "";

    const handleDownload = async () => {
        let downloadUrl = "";
        try {
            // pass filters to download too
            downloadUrl = await utilsService.downloadLaporanPenjualan(
                dateFrom,
                dateTo
                // customerId,
                // kodeLambungId // <-- NEW
            );
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `laporan-penjualan-${format(
                dateFrom,
                "yyyy-MM-dd"
            )}-${format(dateTo, "yyyy-MM-dd")}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Report downloaded successfully");
        } catch (error) {
            toast.error("Failed to download report");
            console.error("Download error:", error);
        } finally {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl);
            }
        }
    };

    const calculateTotals = () => {
        if (!reportData?.data?.length) {
            return {subTotal: 0, total: 0, tax: 0, grandTotal: 0};
        }
        return reportData.data.reduce(
            (acc, row) => ({
                subTotal: acc.subTotal + parseFloat(row.sub_total || "0"),
                total: acc.total + parseFloat(row.total || "0"),
                tax: acc.tax + parseFloat(row.tax || "0"),
                grandTotal: acc.grandTotal + parseFloat(row.grand_total || "0"),
            }),
            {subTotal: 0, total: 0, tax: 0, grandTotal: 0}
        );
    };

    const totals = calculateTotals();
    const totalPages = reportData ? Math.ceil(reportData.total / pageSize) : 0;

    const handlePageChange = async (page: number) => {
        const previousPage = currentPage;
        setCurrentPage(page);
        setIsPaginationLoading(true);
        setError(null);

        try {
            const data = await utilsService.getLaporanPenjualan(
                dateFrom,
                dateTo,
                page,
                pageSize,
                customerId,
                kodeLambungId // <-- NEW
            );
            setReportData(data);
        } catch (err) {
            setCurrentPage(previousPage);
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error("Failed to load page data");
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const handleRowsPerPageChange = async (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setIsPaginationLoading(true);

        try {
            const data = await utilsService.getLaporanPenjualan(
                dateFrom,
                dateTo,
                1,
                newPageSize,
                customerId,
                kodeLambungId // <-- NEW
            );
            setReportData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error("Failed to change page size");
        } finally {
            setIsPaginationLoading(false);
        }
    };

    if (isLoading && showForm) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner/>
            </div>
        );
    }

    // Form
    if (showForm) {
        return (
            <div>
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={toInputDate(dateFrom)}
                            onChange={(e) =>
                                setDateFrom(
                                    e.target.value ? new Date(e.target.value) : new Date()
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Tanggal Selesai
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={toInputDate(dateTo)}
                            onChange={(e) =>
                                setDateTo(
                                    e.target.value ? new Date(e.target.value) : new Date()
                                )
                            }
                        />
                    </div>

                    <SearchableSelect
                        label="Customer"
                        placeholder="Pilih Customer"
                        value={customerId}
                        onChange={(value) => setCustomerId(Number(value))}
                        fetchData={async (search) => {
                            return await customerService.getAllCustomers({
                                page: 0,
                                rowsPerPage: 10,
                                contains_deleted: false,
                                search_key: search,
                            });
                            
                        }}
                        renderLabel={(item: any) =>
                            `${item.code} - ${item.name} ${
                                item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""
                            }`
                        }
                    />

                    {/* NEW: Kode Lambung filter */}
                    <SearchableSelect
                        label="Kode Lambung"
                        placeholder="Pilih Kode Lambung"
                        value={kodeLambungId}
                        onChange={(value) => setKodeLambungId(Number(value))}
                        fetchData={async (search) => {
                            const res = await kodeLambungService.getAll({
                                page: 1,
                                size: 10,
                                search,
                            });
                            return {
                                data: res.data,
                                total: res.total,
                            };
                        }}
                        renderLabel={(item: any) => item.name}
                    />

                    <div className="flex justify-end gap-4 pt-4">
                        <Button onClick={handleGenerateReport} disabled={isLoading}>
                            {isLoading ? (
                                <Spinner className="mr-2 h-4 w-4"/>
                            ) : (
                                <Download className="mr-2 h-4 w-4"/>
                            )}
                            Generate Laporan
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Error on initial load
    if (error && !reportData) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={handleBack} variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    Kembali ke Form
                </Button>
            </div>
        );
    }

    // Report table (unchanged except filters are applied upstream)
    return (
        <>
            <div className="border-b pb-4 ">
                <div className="flex min-w-0 justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Laporan Penjualan {formatDate(dateFrom)} - {formatDate(dateTo)}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Laporan Detail Penjualan Periode {formatDate(dateFrom)} sampai{" "}
                            {formatDate(dateTo)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBack}>
                            <CalendarIcon className="mr-2 h-4 w-4"/>
                            Ubah Periode
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={!reportData?.data?.length || isLoading}
                        >
                            <Download className="mr-2 h-4 w-4"/>
                            Download CSV
                        </Button>
                    </div>
                </div>
            </div>

            {isPaginationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <Spinner/>
                </div>
            )}

            <div className="relative min-w-0">
                {reportData?.data?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            Tidak ada data penjualan pada periode ini
                        </p>
                    </div>
                ) : (
                    <div className="w-full min-w-0 overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow
                                    className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <TableHead className="px-3 py-3">Date</TableHead>
                                    <TableHead className="px-3 py-3">Customer</TableHead>
                                    <TableHead className="px-3 py-3">Kode Lambung</TableHead>
                                    <TableHead className="px-3 py-3">No Penjualan</TableHead>
                                    <TableHead className="px-3 py-3">Status</TableHead>
                                    <TableHead className="px-3 py-3">Item Code</TableHead>
                                    <TableHead className="px-3 py-3">Item Name</TableHead>
                                    <TableHead className="px-3 py-3">Qty</TableHead>
                                    <TableHead className="px-3 py-3">Price</TableHead>
                                    <TableHead className="px-3 py-3">Sub Total</TableHead>
                                    <TableHead className="px-3 py-3">Total</TableHead>
                                    <TableHead className="px-3 py-3">Tax</TableHead>
                                    <TableHead className="px-3 py-3">Grand Total</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-200 bg-white">
                                {reportData?.data?.length ? (
                                    reportData.data.map((row, index) => (
                                        <TableRow
                                            key={`${row.no_penjualan}-${index}`}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell className="px-3 py-4">
                                                {formatDate(row.date)}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                <div title={row.customer}>{row.customer}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {row.kode_lambung_rel || "-"}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {row.no_penjualan}
                                            </TableCell>
                                            <TableCell className="px-4 py-4">
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                row.status === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : row.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                            }`}
                        >
                          {row.status}
                        </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {row.item_code}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                <div className="truncate" title={row.item_name}>
                                                    {row.item_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {row.qty.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {formatMoney(parseFloat(row.price || "0"))}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {formatMoney(parseFloat(row.sub_total || "0"))}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {formatMoney(parseFloat(row.total || "0"))}
                                            </TableCell>
                                            <TableCell className="px-3 py-4">
                                                {formatMoney(parseFloat(row.tax || "0"))}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-right font-semibold">
                                                {formatMoney(parseFloat(row.grand_total || "0"))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={13}
                                            className="px-4 py-8 text-center text-sm text-gray-500"
                                        >
                                            Tidak ada data penjualan pada periode ini
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                            {reportData?.data?.length ? (
                                <tfoot className="sticky bottom-0 bg-gray-100">
                                <tr className="border-t-2 border-gray-300">
                                    <td colSpan={9} className="px-4 py-3 font-semibold">
                                        TOTAL
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {formatMoney(totals.subTotal)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {formatMoney(totals.total)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {formatMoney(totals.tax)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {formatMoney(totals.grandTotal)}
                                    </td>
                                </tr>
                                </tfoot>
                            ) : null}
                        </Table>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {reportData && (
                <GlobalPaginationFunction
                    page={currentPage}
                    total={reportData.total || 0}
                    totalPages={totalPages}
                    rowsPerPage={pageSize}
                    handleRowsPerPageChange={handleRowsPerPageChange}
                    handlePageChange={handlePageChange}
                />
            )}
        </>
    );
};

export default SalesDropdown;
