// imports (added kodeLambungService)
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { formatMoney } from "@/lib/utils";
import {
  LaporanPenjualanRows,
  ParentStockAdjustmentItem,
  StockAdjustmentItem,
  StockAdjustmentReport,
  utilsService,
} from "@/services/utilsService";
import { Spinner } from "../ui/spinner";
import GlobalPaginationFunction from "../pagination-global";
import { PaginatedResponse } from "@/types/types";
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
import { customerService } from "@/services/customerService";
import { kodeLambungService } from "@/services/kodeLambungService";
import { itemService } from "@/services/itemService";

export const formatDate = (dateString: any) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const StockAdjDropdown = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(2025, 0, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemId, setItemId] = useState<number | undefined>(undefined);

  const [showForm, setShowForm] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportData, setReportData] = useState<PaginatedResponse<
    ParentStockAdjustmentItem<StockAdjustmentItem>
  > | null>(null);
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
      const response = await utilsService.getLaporanStockAdjustment(
        dateFrom,
        dateTo,
        itemId,
        0,
        pageSize
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
      downloadUrl = await utilsService.downloadLaporanStockAdjustment(
        dateFrom,
        dateTo,
        itemId
      );
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `laporan-stock-card-${format(
        dateFrom,
        "yyyy-MM-dd"
      )}-${format(dateTo, "yyyy-MM-dd")}.xlsx`;
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
  const totalPages = reportData ? Math.ceil(reportData.total / pageSize) : 0;
  const handlePageChange = async (page: number) => {
    const previousPage = currentPage;
    setCurrentPage(page);
    setIsPaginationLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * pageSize; // Calculate skip from page number
      const data = await utilsService.getLaporanStockAdjustment(
        dateFrom,
        dateTo,
        itemId, // Don't forget itemId
        skip,
        pageSize
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
      const data = await utilsService.getLaporanStockAdjustment(
        dateFrom,
        dateTo,
        itemId, // Don't forget itemId
        0, // Reset to first page (skip = 0)
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
  if (isLoading && showForm) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item (Opsional)
            </label>
            <SearchableSelect
              label=""
              placeholder="Pilih Item"
              value={selectedItem} // pass the object, not just the id
              onChange={(opt: any | null) => {
                // receive the object
                setSelectedItem(opt);
                setItemId(opt ? Number(opt) : undefined);
              }}
              fetchData={async (search) => {
                const res = await itemService.getAllItems({
                  page: 0,
                  rowsPerPage: 10,
                  search_key: search,
                });
                return res;
              }}
              renderLabel={(item: any) => `${item.code} - ${item.name}`}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
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
          <CalendarIcon className="mr-2 h-4 w-4" />
          Kembali ke Form
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border-b pb-4 ">
        <div className="flex min-w-0 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan Stock Card {formatDate(dateFrom)} - {formatDate(dateTo)}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Ubah Periode
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!reportData?.data?.length || isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download XLSX
            </Button>
          </div>
        </div>
      </div>

      {isPaginationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}

      <div className="relative min-w-0">
        {reportData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data pada periode ini</p>
          </div>
        ) : (
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <TableHead className="px-3 py-3 w-[10%]">Date</TableHead>
                  <TableHead className="px-3 py-3 w-[15%]">
                    No. Transaksi
                  </TableHead>
                  <TableHead className="px-3 py-3w-[15%]">Item Code</TableHead>
                  <TableHead className="px-3 py-3  w-[20%]">
                    Item Name
                  </TableHead>
                  <TableHead className="px-3 py-3 w-[10%]">Qty Masuk</TableHead>
                  <TableHead className="px-3 py-3 w-[10%]">
                    Qty Keluar
                  </TableHead>
                  <TableHead className="px-3 py-3  w-[10%]">
                    Qty Balance
                  </TableHead>
                  <TableHead className="px-3 py-3 w-[10%]">
                    Harga Modal
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-white">
                {reportData?.data?.length ? (
                  reportData.data?.map((itemGroup, groupIndex) => (
                    <React.Fragment key={`group-${groupIndex}`}>
                      <TableRow className="bg-white border-t-2 border-gray-300">
                        <TableCell
                          colSpan={8}
                          className="px-3 py-3 font-bold text-sm bg-gray-50  border-gray-600"
                        >
                          {itemGroup.item_name}
                        </TableCell>
                      </TableRow>
                      {itemGroup.data?.map((row: any, rowIndex: number) => (
                        <TableRow
                          key={`${row.no_transaksi}-${rowIndex}`}
                          className="hover:bg-gray-50 border-b border-gray-200"
                        >
                          <TableCell className="px-3 py-4">
                            {formatDate(row.date)}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <div title={row.no_transaksi}>
                              {row.no_transaksi}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {row.item_code || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {row.item_name || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {row.qty_masuk || 0}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {row.qty_keluar || 0}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {row.qty_balance || 0}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            {formatMoney(row.hpp || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      Tidak ada data pada periode ini
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
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

export default StockAdjDropdown;
