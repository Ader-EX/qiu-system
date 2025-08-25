import Cookies from "js-cookie";
import { PaginatedResponse } from "@/types/types";
import { Attachment } from "@/services/pembelianService";
import { PembayaranFilters } from "./pembayaranService";

export type PengembalianType = {
  PENJUALAN: "PENJUALAN";
  PEMBELIAN: "PEMBELIAN";
};

export type StatusPengembalian = {
  DRAFT: "DRAFT";
  ACTIVE: "ACTIVE";
};

export type PengembalianDetailCreate = {
  pembelian_id?: number;
  penjualan_id?: number;
  total_return: number;
};

export type PengembalianCreate = {
  payment_date: string;
  reference_type: string;
  currency_id: number;
  warehouse_id: number;
  customer_id?: string;
  vendor_id?: string;
  pembayaran_details: PengembalianDetailCreate[];
};

export type PengembalianUpdate = {
  payment_date?: string;
  total_return?: number;
  reference_type?: string;
  currency_id?: number;
  warehouse_id?: number;

  pembelian_id?: number;
  penjualan_id?: number;
  customer_id?: string;
  vendor_id?: string;
};

export type PengembalianDetail = {
  id: number;
  pembayaran_id: number;
  pembelian_id?: number;
  penjualan_id?: number;
  total_return: string;
  pembelian_rel?: {
    id: number;
    no_pembelian: string;
    status_pembayaran: string;
    status_pembelian: string;
    sales_date: string;
    sales_due_date: string;
    discount: string;
    additional_discount: string;
    expense: string;
    total_qty: number;
    total_price: string;
    warehouse_id: number;
    vendor_id: string;
    top_id: number;
    warehouse_name: string;
    vendor_name: string;
    vendor_address: string;
    top_name: string;
    currency_name: string;
    pembelian_items: any[];
    attachments: any[];
  };
  penjualan_rel?: {
    id: number;
    no_penjualan: string;
    status_pembayaran: string;
    status_penjualan: string;
    sales_date: string;
    sales_due_date: string;
    discount: string;
    additional_discount: string;
    expense: string;
    total_qty: number;
    total_price: string;
    warehouse_id: number;
    customer_id: string;
    top_id: number;
    warehouse_name: string;
    customer_name: string;
    customer_address: string;
    top_name: string;
    currency_name: string;
    penjualan_items: any[];
    attachments: any[];
  };
};

// Updated to match the actual JSON response structure
export type PengembalianResponse = {
  id: number;
  no_pembayaran: string;
  status: string;
  created_at: string;
  payment_date: string;
  reference_type: string;
  customer_id?: string;
  vendor_id?: string;
  currency_id: number;
  warehouse_id: number;
  warehouse_name: string;
  customer_name: string;
  currency_name: string;
  customer_rel: {
    id: string;
    name: string;
    address: string;
  };
  warehouse_rel: {
    id: number;
    name: string;
  };
  curr_rel: {
    id: number;
    name: string;
    symbol: string;
  };
  pembayaran_details: PengembalianDetail[];
  reference_numbers: any[];
  reference_partners: any[];
  updated_at?: string;
  attachments: Attachment[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class PengembalianService {
  private baseUrl: string;

  constructor(destination: string = "pembayaran") {
    this.baseUrl = `${API_BASE_URL}/${destination}`;
  }

  // GET ALL
  async getAllPengembalian(
    filters: PembayaranFilters = {}
  ): Promise<PaginatedResponse<PengembalianResponse>> {
    const params = new URLSearchParams();

    if (filters.search_key) params.append("search_key", filters.search_key);
    if (filters.tipe_referensi && filters.tipe_referensi !== "ALL")
      params.append("reference_type", filters.tipe_referensi);
    if (filters.status && filters.status !== "ALL")
      params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // GET BY ID
  async getPengembalianById(id: number): Promise<PengembalianResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  getDownloadUrl(pembayaranId: string, attachmentId: number): string {
    const token = Cookies.get("access_token");
    return `${this.baseUrl}/${pembayaranId}/download/${attachmentId}?token=${token}`;
  }

  // CREATE
  async createPengembalian(
    data: PengembalianCreate
  ): Promise<PengembalianResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // UPDATE
  async updatePengembalian(
    id: string,
    data: PengembalianUpdate
  ): Promise<PengembalianResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // DELETE
  async deletePengembalian(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }
  }

  // FINALIZE
  async finalizePengembalian(id: number): Promise<PengembalianResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/finalize`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async rollbackPengembalian(id: number): Promise<PengembalianResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/draft`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) throw new Error("No access token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
}

export const pengembalianService = new PengembalianService();
