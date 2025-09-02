import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Download,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {format} from "date-fns";
import {cn, formatMoney} from "@/lib/utils";
import {LaporanPenjualanRows, utilsService} from "@/services/utilsService";
import {Spinner} from "../ui/spinner";
import GlobalPaginationFunction from "../pagination-global";
import {PaginatedResponse} from "@/types/types";
import toast from "react-hot-toast";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
            // Use consistent page numbering (1-based)
            const response = await utilsService.getLaporanPenjualan(
                dateFrom,
                dateTo,
                1, // Start with page 1 consistently
                pageSize
            );
            setReportData(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setShowForm(true); // Return to form if initial load fails
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
            downloadUrl = await utilsService.downloadLaporanPenjualan(
                dateFrom,
                dateTo
            );
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `laporan-penjualan-${format(
                dateFrom,
                "yyyy-MM-dd"
            )}-${format(dateTo, "yyyy-MM-dd")}.csv`;
            document.body.appendChild(a); // Ensure it's in DOM
            a.click();
            document.body.removeChild(a); // Clean up
            toast.success("Report downloaded successfully");
        } catch (error) {
            toast.error("Failed to download report");
            console.error("Download error:", error);
        } finally {
            // Always clean up the URL
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl);
            }
        }
    };

    // Calculate totals
    const calculateTotals = () => {
        if (!reportData?.data?.length) {
            return {
                subTotal: 0,
                total: 0,
                tax: 0,
                grandTotal: 0,
            };
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

    // Calculate pagination info
    const totalPages = reportData ? Math.ceil(reportData.total / pageSize) : 0;
    const startItem = reportData ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = reportData
        ? Math.min(currentPage * pageSize, reportData.total)
        : 0;

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
                pageSize
            );
            setReportData(data);
        } catch (err) {
            // Revert page if failed
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
                newPageSize
            );
            setReportData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error("Failed to change page size");
        } finally {
            setIsPaginationLoading(false);
        }
    };

    // Loading State
    if (isLoading && showForm) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner/>
            </div>
        );
    }

    // Form State
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

    // Error State
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

    // Report Display State
    return (
        <>
            {/* Header - Fixed width, no horizontal scroll */}
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

            {/* Loading overlay for pagination */}
            {isPaginationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <Spinner/>
                </div>
            )}

            {/* Table Container - ONLY table scrolls */}
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
                            {/* Sticky header with explicit column widths */}
                            <TableHeader className="bg-gray-50">
                                <TableRow
                                    className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                                    <TableHead
                                        className=" px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kode Lambung
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No Penjualan
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item Code
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item Name
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Qty
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sub Total
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tax
                                    </TableHead>
                                    <TableHead
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grand Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-200 bg-white">
                                {reportData?.data?.length ? (
                                    reportData.data.map((row, index) => (
                                        <TableRow
                                            key={`${row.no_penjualan}-${index}`}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {formatDate(row.date)}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                <div className="" title={row.customer}>
                                                    {row.customer}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {row.kode_lambung || "-"}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {row.no_penjualan}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 whitespace-nowrap">
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
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {row.item_code}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                <div className="truncate" title={row.item_name}>
                                                    {row.item_name}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {row.qty.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {formatMoney(parseFloat(row.price || "0"))}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {formatMoney(parseFloat(row.sub_total || "0"))}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {formatMoney(parseFloat(row.total || "0"))}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                                                {formatMoney(parseFloat(row.tax || "0"))}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
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

                            {/* Proper footer for totals (don’t keep this in <tbody>) */}
                            {reportData?.data?.length ? (
                                <tfoot className="sticky bottom-0 bg-gray-100">
                                <tr className="border-t-2 border-gray-300">
                                    <td
                                        colSpan={9}
                                        className="px-4 py-3 text-sm font-semibold text-gray-900"
                                    >
                                        TOTAL
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatMoney(totals.subTotal)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatMoney(totals.total)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatMoney(totals.tax)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatMoney(totals.grandTotal)}
                                    </td>
                                </tr>
                                </tfoot>
                            ) : null}
                        </Table>
                    </div>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Pagination - Fixed width, no horizontal scroll */}
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
