import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn, formatMoney } from "@/lib/utils";
import { LabaRugiResponse, utilsService } from "@/services/utilsService";
import toast from "react-hot-toast";

const formatDate = (dateString: any) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const LabaRugiReport = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(2025, 0, 1)); // January 1, 2025
  const [dateTo, setDateTo] = useState<Date>(new Date()); // January 31, 2025
  const [reportData, setReportData] = useState<LabaRugiResponse>();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

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
    try {
      const data = await utilsService.getLabaRugi(dateFrom, dateTo);
      setReportData(data);
      setShowForm(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Gagal menggenerate laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowForm(true);
    setReportData(undefined);
  };

  const toInputDate = (d: Date | null) =>
    d
      ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10)
      : "";

  const handleDownload = () => {
    if (!reportData) {
      toast.error("Tidak ada data untuk didownload");
      return;
    }

    // Create report content as text
    const reportContent = `
LAPORAN LABA RUGI
Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}
Generated: ${new Date().toLocaleString("id-ID")}
================================================================

RINGKASAN KEUANGAN:
================================================================

Penjualan       : ${formatMoney(reportData.total_penjualan)}
Pembelian       : ${formatMoney(reportData.total_pembelian)}
Profit/Loss     : ${formatMoney(reportData.profit_or_loss)}

================================================================
${reportData.profit_or_loss > 0 ? "PROFIT" : "LOSS"}: ${formatMoney(
      Math.abs(reportData.profit_or_loss)
    )}
================================================================
    `.trim();

    // Create and download the file
    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laba-rugi-${format(dateFrom, "yyyy-MM-dd")}-${format(
      dateTo,
      "yyyy-MM-dd"
    )}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Laporan berhasil didownload!");
  };
  if (!showForm && reportData) {
    const isProfit = reportData.profit_or_loss > 0;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Laba Rugi {formatDate(dateFrom)} - {formatDate(dateTo)}
              </h1>
              <p className="text-gray-600 mt-1">
                Laporan Keuangan Periode {formatDate(dateFrom)} sampai{" "}
                {formatDate(dateTo)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Ubah Periode
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">
                    Total Pembelian
                  </p>
                  <p className="text-red-900 text-xl font-bold">
                    {formatMoney(reportData.total_pembelian)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div
              className={`${
                isProfit
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              } border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`${
                      isProfit ? "text-blue-600" : "text-orange-600"
                    } text-sm font-medium`}
                  >
                    {isProfit ? "Profit" : "Loss"}
                  </p>
                  <p
                    className={`${
                      isProfit ? "text-blue-900" : "text-orange-900"
                    } text-xl font-bold`}
                  >
                    {formatMoney(Math.abs(reportData.profit_or_loss))}
                  </p>
                </div>
                {isProfit ? (
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-500" />
                )}
              </div>
            </div>
          </div>

          {/* Detailed Report Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Rincian Laporan
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-gray-900 font-medium">Penjualan</span>
                <span className="text-green-600 font-semibold text-right">
                  {formatMoney(reportData.total_penjualan)}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-gray-900 font-medium">Pembelian</span>
                <span className="text-red-600 font-semibold text-right">
                  {formatMoney(reportData.total_pembelian)}
                </span>
              </div>
              <div
                className={`px-6 py-4 flex justify-between items-center bg-gray-50 ${
                  isProfit
                    ? "border-l-4 border-l-green-500"
                    : "border-l-4 border-l-red-500"
                }`}
              >
                <span className="text-gray-900 font-bold">Profit/Loss</span>
                <span
                  className={`${
                    isProfit ? "text-green-600" : "text-red-600"
                  } font-bold text-lg text-right`}
                >
                  {isProfit ? "+" : "-"}
                  {formatMoney(Math.abs(reportData.profit_or_loss))}
                </span>
              </div>
            </div>
          </div>

          {/* Profit/Loss Indicator */}
        </div>
      </div>
    );
  }

  return (
    <div className="">
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

          {/* --- replace the "Tanggal Selesai" block --- */}
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
};

export default LabaRugiReport;
