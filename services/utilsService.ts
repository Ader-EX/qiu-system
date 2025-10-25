// services/currencyService.ts
import { TOPUnit } from "@/types/types";
import Cookies from "js-cookie";
import { PaginatedResponse } from "./itemService";

export interface LabaRugiDetailRow {
  /** The date of the invoice (tanggal). */
  tanggal: Date;

  /** The unique invoice identifier (no_invoice). */
  no_invoice: string;

  /** The code for the sold item (item_code). */
  item_code: string;

  /** The name of the sold item (item_name). */
  item_name: string;

  /** The quantity of the item sold (qty_terjual). */
  qty_terjual: number;

  /** The cost of goods sold per unit (HPP per unit), which is your calculated pp_per_unit (hpp). */
  hpp: number;

  /** The total cost of goods sold for this line item (total_hpp). */
  total_hpp: number;

  /** The unit selling price (harga_jual). */
  harga_jual: number;

  /** The total revenue from this line item (total_penjualan). */
  total_penjualan: number;

  /** The gross profit (laba_kotor). */
  laba_kotor: number;
}

export interface LabaRugiResponse {
  /** The title of the report. */
  title: string;

  /** The starting date of the report period (date_from). */
  date_from: Date;

  /** The ending date of the report period (date_to). */
  date_to: Date;

  /** A list of all transaction detail rows. */
  details: LabaRugiDetailRow[];

  /** The grand total quantity of items sold. */
  total_qty: number;

  /** The grand total HPP (Cost of Goods Sold) for the period. */
  total_hpp: number;

  /** The grand total revenue for the period. */
  total_penjualan: number;

  /** The grand total gross profit for the period. */
  total_laba_kotor: number;

  /** The total number of detail rows included in the report (total). */
  total: number;
}

export type LaporanPenjualanRows = {
  date: string;
  customer: string;
  kode_lambung_rel: string | null;
  no_penjualan: string;
  status: string;
  item_code: string;
  item_name: string;
  qty: number;
  price: string;
  sub_total: string;
  total: string;
  tax: string;
  grand_total: string;
};

export type LaporanPembelianRows = {
  date: string;
  vendor: string;
  no_pembelian: string;
  status: string;
  item_code: string;
  item_name: string;
  qty: number;
  price: string;
  sub_total: string;
  total: string;
  tax: string;
  grand_total: string;
};

export type DashboardData = {
  total_products: number;
  percentage_month_products: number;
  status_month_products: string;
  total_customer: number;
  percentage_month_customer: number;
  status_month_customer: string;
  total_pembelian: string;
  percentage_month_pembelian: number;
  status_month_pembelian: string;
  total_penjualan: string;
  percentage_month_penjualan: number;
  status_month_penjualan: string;
};

export interface StockAdjustmentItem {
  date: string;
  no_transaksi: string;
  batch: string;
  item_code: string;
  item_name: string;
  qty_masuk: number;
  qty_keluar: number;
  harga_beli: number;
  qty_balance: number;
  harga_masuk: number;
  harga_keluar: number;
  hpp: number;
}

export interface ParentStockAdjustmentItem<T> {
  item_name: string;
  data: T[];
}

export interface StockAdjustmentReport {
  title: string;
  date_from: string;
  date_to: string;
  data: ParentStockAdjustmentItem<StockAdjustmentItem>[];
}

const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class UtilsService {
  private baseUrl: string;

  constructor(destination: string = "utils") {
    this.baseUrl = `${NEXT_PUBLIC_API_URL}/${destination}`;
  }

  async getStatistics(): Promise<DashboardData> {
    const url = this.baseUrl + `/statistics`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch laporan: ${response.statusText}`);
      }

      const result = (await response.json()) as DashboardData;
      return result;
    } catch (error) {
      console.error("Error fetching laporan.h:", error);
      throw error;
    }
  }

  async getLabaRugi(from_date: Date, to_date: Date): Promise<LabaRugiResponse> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });

    const url = this.baseUrl + `/laba-rugi` + `?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch laporan: ${response.statusText}`);
      }

      const result = (await response.json()) as LabaRugiResponse;
      return result;
    } catch (error) {
      console.error("Error fetching laporan.h:", error);
      throw error;
    }
  }

  async getLaporanPenjualan(
    from_date: Date,
    to_date: Date,
    skip: number = 0,
    limit: number = 100,
    customer_id?: number,
    kode_lambung_id?: number
  ): Promise<PaginatedResponse<LaporanPenjualanRows>> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
      skip: skip.toString(),
      limit: limit.toString(),
      ...(customer_id !== undefined
        ? { customer_id: customer_id.toString() }
        : {}),
      ...(kode_lambung_id !== undefined
        ? { kode_lambung_id: kode_lambung_id.toString() }
        : {}),
    });

    const url = this.baseUrl + `/penjualan?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Penjualan: ${response.statusText}`);
      }

      const result =
        (await response.json()) as PaginatedResponse<LaporanPenjualanRows>;
      return result;
    } catch (error) {
      console.error("Error fetching laporan penjualan:", error);
      throw error;
    }
  }

  // New getLaporanPembelian method
  async getLaporanPembelian(
    from_date: Date,
    to_date: Date,
    skip: number = 0,
    limit: number = 100
  ): Promise<PaginatedResponse<LaporanPembelianRows>> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const url = this.baseUrl + `/pembelian?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Pembelian: ${response.statusText}`);
      }

      const result =
        (await response.json()) as PaginatedResponse<LaporanPembelianRows>;
      return result;
    } catch (error) {
      console.error("Error fetching laporan pembelian:", error);
      throw error;
    }
  }

  async downloadLaporanPenjualan(
    from_date: Date,
    to_date: Date,
    customer_id?: number,
    kode_lambung_id?: number
  ): Promise<string> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });

    // Add optional filters only if they have values
    if (customer_id !== undefined && customer_id !== null) {
      params.append("customer_id", customer_id.toString());
    }
    if (kode_lambung_id !== undefined && kode_lambung_id !== null) {
      params.append("kode_lambung_id", kode_lambung_id.toString());
    }

    const url = this.baseUrl + `/penjualan/download?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  async downloadLaporanLabaRugi(
    from_date: Date,
    to_date: Date
  ): Promise<string> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });

    const url = this.baseUrl + `/laba-rugi/download?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  async downloadLaporanPembelian(
    from_date: Date,
    to_date: Date
  ): Promise<string> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });

    const url = this.baseUrl + `/pembelian/download?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  async getLaporanStockAdjustment(
    from_date: Date,
    to_date: Date,
    item_id?: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<
    PaginatedResponse<ParentStockAdjustmentItem<StockAdjustmentItem>>
  > {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (item_id !== undefined) {
      params.set("item_id", item_id.toString());
    }

    const url = this.baseUrl + `/stock-adjustment?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch laporan: ${response.statusText}`);
      }

      const result = (await response.json()) as PaginatedResponse<
        ParentStockAdjustmentItem<StockAdjustmentItem>
      >;
      return result;
    } catch (error) {
      console.error("Error fetching laporan:", error);
      throw error;
    }
  }

  async downloadLaporanStockAdjustment(
    from_date: Date,
    to_date: Date,
    item_id?: number
  ): Promise<string> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });
    if (item_id !== undefined) {
      params.set("item_id", item_id.toString());
    }

    const url =
      this.baseUrl + `/stock-adjustment/download?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

export const utilsService = new UtilsService();
