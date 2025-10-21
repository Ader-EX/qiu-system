import Cookies from "js-cookie";
import { PaginatedResponse } from "@/types/types";
import { Attachment, StatusPembelianEnum } from "@/services/pembelianService";
import { PembayaranFilters } from "./pembayaranService";

export type PengembalianType = "PENJUALAN" | "PEMBELIAN";

export type StatusPengembalian = "DRAFT" | "ACTIVE";

export type PengembalianItemsCreate = {
  item_id: number;
  qty_returned: number;
  unit_price: number;
  tax_percentage: number;
};

export type PengembalianCreate = {
  payment_date: string;
  reference_type: string;
  currency_id: number;
  warehouse_id: number;
  notes?: string;
  pembelian_id?: number;
  penjualan_id?: number;
  customer_id?: number;
  vendor_id?: string;
  pengembalian_items: PengembalianItemsCreate[];
};

export type PengembalianUpdate = {
  payment_date?: string;
  reference_type?: string;
  currency_id?: number;
  warehouse_id?: number;
  notes?: string;
  pembelian_id?: number;
  penjualan_id?: number;
  customer_id?: number;
  vendor_id?: string;
  pengembalian_items?: PengembalianItemsCreate[];
};

export type PengembalianItemResponse = {
  id: number;
  pengembalian_id: number;
  item_id?: number;
  item_code?: string;
  item_name?: string;
  item_display_code: string;
  item_display_name: string;
  qty_returned: number;
  unit_price: string;
  tax_percentage: number;
  sub_total: string;
  total_return: string;
  primary_image_url?: string;
};

export type PengembalianResponse = {
  id: number;
  no_pengembalian: string;
  status: StatusPembelianEnum;
  created_at: string;
  payment_date: string;
  reference_type: string;
  customer_id?: number;
  vendor_id?: string;
  currency_id: number;
  warehouse_id: number;
  pembelian_id?: number;
  penjualan_id?: number;

  total_subtotal: string;
  total_tax: string;
  total_return: number;
  notes?: string;

  customer_rel?: {
    id: number;
    name: string;
    address: string;
  };
  vend_rel?: {
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
  pembelian_rel?: {
    id: number;
    no_pembelian: string;
    status_pembelian: string;
    sales_date: string;
    sales_due_date: string;
    total_price: string;
    warehouse_name: string;
    vendor_name: string;
  };
  penjualan_rel?: {
    id: number;
    no_penjualan: string;
    status_penjualan: string;
    sales_date: string;
    sales_due_date: string;
    total_price: string;
    warehouse_name: string;
    customer_name: string;
  };

  pengembalian_items: PengembalianItemResponse[];
  attachments: Attachment[];

  reference_number: string;
  partner_display: string;
  updated_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class PengembalianService {
  private baseUrl: string;

  constructor(destination: string = "pengembalian") {
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
    if (filters.size) params.append("limit", filters.size.toString());
    if (filters.from_date && filters.to_date) {
      params.append("from_date", String(filters.from_date));
      params.append("to_date", String(filters.to_date));
    }

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

  getDownloadUrl(pengembalianId: string, attachmentId: number): string {
    const token = Cookies.get("access_token");
    return `${this.baseUrl}/${pengembalianId}/download/${attachmentId}?token=${token}`;
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

  // ROLLBACK
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
