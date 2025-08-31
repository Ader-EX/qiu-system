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
import { LaporanPenjualanRows, utilsService } from "@/services/utilsService";
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

const SalesReport = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(2025, 0, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportData, setReportData] =
    useState<PaginatedResponse<LaporanPenjualanRows> | null>(null);
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
      const response = await utilsService.getLaporanPenjualan(
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
      const url = await utilsService.downloadLaporanPenjualan(dateFrom, dateTo);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-penjualan-${format(
        dateFrom,
        "yyyy-MM-dd"
      )}-${format(dateTo, "yyyy-MM-dd")}.csv`;
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

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setIsLoading(true);
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
              Laporan Penjualan {formatDate(dateFrom)} - {formatDate(dateTo)}
            </h1>
            <p className="text-gray-600 mt-1">
              Laporan Detail Penjualan Periode {formatDate(dateFrom)} sampai{" "}
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
              Download CSV
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

      <div className="w-full border rounded-lg bg-white overflow-hidden mb-4">
        <div className="overflow-auto max-h-96 w-full max-w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Lambung
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Penjualan
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Code
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Total
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.data?.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {row.customer}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {row.kode_lambung || "-"}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {row.no_penjualan}
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                            row.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {row.item_code}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 truncate">
                        {row.item_name}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 text-right truncate">
                        {row.qty.toLocaleString("id-ID")}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 text-right truncate">
                        {formatMoney(parseFloat(row.price))}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 text-right truncate">
                        {formatMoney(parseFloat(row.sub_total))}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 text-right truncate">
                        {formatMoney(parseFloat(row.total))}
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-900 text-right truncate">
                        {formatMoney(parseFloat(row.tax))}
                      </td>
                      <td className="px-2 py-4 text-xs font-semibold text-gray-900 text-right truncate">
                        {formatMoney(parseFloat(row.grand_total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && reportData?.data?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Tidak ada data penjualan pada periode ini
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

export default SalesReport;
