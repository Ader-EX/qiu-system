// services/currencyService.ts
import { TOPUnit } from "@/types/types";
import Cookies from "js-cookie";
import { PaginatedResponse } from "./itemService";

export type LabaRugiResponse = {
  total_penjualan: number;
  total_pembelian: number;
  profit_or_loss: number;
};
export type LaporanPenjualanRows = {
  date: string;
  customer: string;
  kode_lambung: string | null;
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
    limit: number = 100
  ): Promise<PaginatedResponse<LaporanPenjualanRows>> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
      skip: skip.toString(),
      limit: limit.toString(),
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
    to_date: Date
  ): Promise<string> {
    const params = new URLSearchParams({
      from_date: from_date.toISOString().split("T")[0],
      to_date: to_date.toISOString().split("T")[0],
    });

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
  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}
export const utilsService = new UtilsService();
