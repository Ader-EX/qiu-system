import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { formatMoney } from "@/lib/utils";
import { LabaRugiResponse, utilsService } from "@/services/utilsService";
import { Spinner } from "../ui/spinner";
import toast from "react-hot-toast";

const formatDate = (dateString: any) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const LabaRugiReport = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(2025, 0, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<LabaRugiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
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

    setLoading(true);
    setError(null);
    setShowForm(false);

    try {
      const data = await utilsService.getLabaRugi(dateFrom, dateTo);
      setReportData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menggenerate laporan"
      );
      toast.error("Gagal menggenerate laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowForm(true);
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
      downloadUrl = await utilsService.downloadLaporanLabaRugi(
        dateFrom,
        dateTo
      );
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `laporan-labarugi-${format(dateFrom, "yyyy-MM-dd")}-${format(
        dateTo,
        "yyyy-MM-dd"
      )}.xlsx`;
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

  // Loading State
  if (loading && showForm) {
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Laporan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Report Display State
  if (!showForm && reportData) {
    const isProfit = reportData.total_laba_kotor > 0;

    return (
      <div className="w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Laporan Laba Rugi {formatDate(dateFrom)} - {formatDate(dateTo)}
              </h1>
              <p className="text-gray-600 mt-1">
                Laporan Detail Laba Rugi Periode {formatDate(dateFrom)} sampai{" "}
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
                disabled={!reportData?.details?.length}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Total Qty Terjual
                </p>
                <p className="text-blue-900 text-xl font-bold">
                  {reportData.total_qty.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total HPP</p>
                <p className="text-red-900 text-xl font-bold">
                  {formatMoney(reportData.total_hpp)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Total Penjualan
                </p>
                <p className="text-green-900 text-xl font-bold">
                  {formatMoney(reportData.total_penjualan)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div
            className={`${
              isProfit
                ? "bg-emerald-50 border-emerald-200"
                : "bg-orange-50 border-orange-200"
            } border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`${
                    isProfit ? "text-emerald-600" : "text-orange-600"
                  } text-sm font-medium`}
                >
                  Laba Kotor
                </p>
                <p
                  className={`${
                    isProfit ? "text-emerald-900" : "text-orange-900"
                  } text-xl font-bold`}
                >
                  {formatMoney(Math.abs(reportData.total_laba_kotor))}
                </p>
              </div>
              {isProfit ? (
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-orange-500" />
              )}
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white border rounded-lg overflow-hidden mb-4">
          {/* Table Container with Fixed Height and Scroll */}
          <div className="overflow-auto max-h-96 max-w-full">
            {loading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <Spinner />
              </div>
            ) : (
              <div className="w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Invoice
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty Terjual
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HPP
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total HPP
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga Jual (unit)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Penjualan
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laba Kotor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.details?.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                          {formatDate(row.tanggal)}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                          {row.no_invoice}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900">
                          {row.item_code}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 max-w-xs whitespace-normal break-words">
                          {row.item_name}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                          {row.qty_terjual.toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                          {formatMoney(row.hpp)}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                          {formatMoney(row.total_hpp)}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                          {formatMoney(row.harga_jual)}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm text-gray-900 text-right">
                          {formatMoney(row.total_penjualan)}
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words text-sm font-semibold text-green-600 text-right">
                          {formatMoney(row.laba_kotor)}
                        </td>
                      </tr>
                    ))}
                    {reportData?.details && reportData.details.length > 0 && (
                      <tr className="bg-gray-100 border-t-2 border-gray-300">
                        <td
                          colSpan={4}
                          className="px-3 py-3 text-sm font-bold text-gray-900"
                        >
                          TOTAL
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right">
                          {reportData.total_qty.toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right"></td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatMoney(reportData.total_hpp)}
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right"></td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatMoney(reportData.total_penjualan)}
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-green-600 text-right">
                          {formatMoney(reportData.total_laba_kotor)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!loading && reportData?.details?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Tidak ada data laba rugi pada periode ini
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LabaRugiReport;
