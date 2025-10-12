import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn, formatMoney } from "@/lib/utils";
import { LaporanPembelianRows, utilsService } from "@/services/utilsService";
import { Spinner } from "../ui/spinner";
import GlobalPaginationFunction from "../pagination-global";
import { PaginatedResponse } from "@/types/types";
import toast from "react-hot-toast";

const formatDate = (dateString: any) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PurchaseDropdown = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportData, setReportData] =
    useState<PaginatedResponse<LaporanPembelianRows> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await utilsService.getLaporanPembelian(
        dateFrom,
        dateTo,
        0, // Start with page 1
        pageSize
      );
      setReportData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
    try {
      const url = await utilsService.downloadLaporanPembelian(dateFrom, dateTo);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-pembelian-${format(
        dateFrom,
        "yyyy-MM-dd"
      )}-${format(dateTo, "yyyy-MM-dd")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download report");
      console.error("Download error:", error);
    }
  };

  // Calculate pagination info
  const totalPages = reportData ? Math.ceil(reportData.total / pageSize) : 0;
  const startItem = reportData ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = reportData
    ? Math.min(currentPage * pageSize, reportData.total)
    : 0;

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
        subTotal: acc.subTotal + parseFloat(row.sub_total),
        total: acc.total + parseFloat(row.total),
        tax: acc.tax + parseFloat(row.tax),
        grandTotal: acc.grandTotal + parseFloat(row.grand_total),
      }),
      { subTotal: 0, total: 0, tax: 0, grandTotal: 0 }
    );
  };

  const totals = calculateTotals();

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setIsLoading(true);
    setError(null);

    try {
      const data = await utilsService.getLaporanPembelian(
        dateFrom,
        dateTo,
        page,
        pageSize
      );
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowsPerPageChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    // Re-fetch with new page size
    handlePageChange(1);
  };

  // Loading State
  if (isLoading && showForm) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
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
              <Download className="mr-2 h-4 w-4" />
              Generate Laporan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Report Display State
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan Pembelian {formatDate(dateFrom)} - {formatDate(dateTo)}
            </h1>
            <p className="text-gray-600 mt-1">
              Laporan Detail Pembelian Periode {formatDate(dateFrom)} sampai{" "}
              {formatDate(dateTo)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Ubah Periode
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!reportData?.data?.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Download XLSX
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Data Table Container - Fixed Height with Scrollable Table Only */}
      <div className="bg-white border rounded-lg overflow-hidden mb-4">
        {/* Table Container with Fixed Height and Scroll */}
        <div className="overflow-auto max-h-96 max-w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="w-full ">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Pembelian
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Total
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.data?.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                        {row.vendor}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                        {row.no_pembelian}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            row.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                        {row.item_code}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 max-w-xs whitespace-normal break-words">
                        {row.item_name}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                        {row.qty.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                        {formatMoney(parseFloat(row.price))}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                        {formatMoney(parseFloat(row.sub_total))}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                        {formatMoney(parseFloat(row.total))}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                        {formatMoney(parseFloat(row.tax))}
                      </td>
                      <td className="px-3 py-4 whitespace-normal break-words text-sm font-semibold text-gray-900 text-right">
                        {formatMoney(parseFloat(row.grand_total))}
                      </td>
                    </tr>
                  ))}
                  {reportData?.data && reportData.data.length > 0 && (
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td
                        colSpan={8}
                        className="px-2 py-3 text-xs font-semibold text-gray-900"
                      >
                        TOTAL
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-gray-900 text-right">
                        {formatMoney(totals.subTotal)}
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-gray-900 text-right">
                        {formatMoney(totals.total)}
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-gray-900 text-right">
                        {formatMoney(totals.tax)}
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-gray-900 text-right">
                        {formatMoney(totals.grandTotal)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && reportData?.data?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Tidak ada data pembelian pada periode ini
            </p>
          </div>
        )}
      </div>

      <GlobalPaginationFunction
        page={currentPage}
        total={reportData?.total || 0}
        totalPages={totalPages}
        rowsPerPage={pageSize}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default PurchaseDropdown;
