// services/PenjualanService.ts

import Cookies from "js-cookie";

// Enums
export enum StatusPembayaranEnum {
  UNPAID = "UNPAID",
  HALF_PAID = "HALF_PAID",
  PAID = "PAID",
}

export enum StatusPenjualanEnum {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PROCESSED = "PROCESSED",
}

export interface PenjualanItem {
  item_code: any;
  id?: number;
  item_id: string;
  item_name?: string;
  item_sku?: string;
  discount: number;
  item_type?: string;
  satuan_name?: string;
  customer_name?: string;
  qty: number;
  unit_price: number;
  unit_price_rmb: number;
  total_price: number;
  tax_percentage?: number;
  item_rel?: any;
}

export interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}

export interface Penjualan {
  id: number;
  no_penjualan: string;
  status_pembayaran: StatusPembayaranEnum;
  status_penjualan: StatusPenjualanEnum;

  additional_discount: number;
  expense: number;
  sales_date: string;
  sales_due_date: string;
  total_qty: number;
  total_price: number;
  total_paid: number;
  total_return: number;
  warehouse_id?: number;
  currency_amount?: number;
  customer_id?: string;
  kode_lambung: {
    id: number;
    name: number;
  };
  top_id?: number;
  warehouse_name?: string;
  customer_name?: string;
  top_name?: string;
  currency_name?: string;
  created_at: string;
  penjualan_items: PenjualanItem[];
  attachments: Attachment[];
}

export interface PenjualanListResponse {
  id: number;
  no_penjualan: string;
  status_pembayaran: StatusPembayaranEnum;
  status_penjualan: StatusPenjualanEnum;
  sales_date: string;
  total_paid: number;
  total_return: number;
  total_qty: number;
  total_price: number;
  customer_name?: string;
  warehouse_name?: string;
  items_count: number;
  attachments_count: number;
}

export interface PenjualanCreate {
  no_penjualan: string;
  warehouse_id?: number;
  customer_id?: string;
  kode_lambung: string;
  top_id?: number;
  sales_date: string;
  sales_due_date?: string;
  discount?: number;
  additional_discount?: number;
  expense?: number;
  items: Array<{
    item_id: number;
    qty: number;
    unit_price: number;
    tax_percentage: number;
  }>;
}

export interface PenjualanUpdate {
  no_penjualan?: string;
  warehouse_id?: number;
  customer_id?: string;
  kode_lambung?: string;
  top_id?: number;
  sales_date?: string;
  sales_due_date?: string;
  discount?: number;
  additional_discount?: number;
  expense?: number;
  items?: Array<{
    item_id?: number;
    qty?: number;
    unit_price?: number;
    tax_percentage?: number;
  }>;
}

export interface PenjualanStatusUpdate {
  status_penjualan?: StatusPenjualanEnum;
  status_pembayaran?: StatusPembayaranEnum;
}

export interface TotalsResponse {
  subtotal: number;
  discount: number;
  additional_discount: number;
  expense: number;
  total_qty: number;
  final_total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface UploadResponse {
  message: string;
  files: Array<{
    filename: string;
    size: number;
    type: string;
  }>;
}

export interface SuccessResponse {
  message: string;
}

export interface PenjualanSummary {
  total_penjualan: number;
  draft_count: number;
  active_count: number;
  completed_count: number;
  total_value: number;
  unpaid_value: number;
}

export interface PenjualanFilters {
  status_penjualan?: StatusPenjualanEnum;
  status_pembayaran?: StatusPembayaranEnum;
  search_key?: string;
  customer_id?: string;
  warehouse_id?: number;
  page?: number;
  size?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class PenjualanService {
  private baseUrl: string;

  constructor(destination: string = "penjualan") {
    this.baseUrl = `${API_BASE_URL}/${destination}`;
  }

  async getAllPenjualan(
    filters: PenjualanFilters = {}
  ): Promise<PaginatedResponse<PenjualanListResponse>> {
    const params = new URLSearchParams();

    if (filters.status_penjualan)
      params.append("status_penjualan", filters.status_penjualan);
    if (filters.status_pembayaran)
      params.append("status_pembayaran", filters.status_pembayaran);
    if (filters.search_key) params.append("search_key", filters.search_key);
    if (filters.customer_id) params.append("customer_id", filters.customer_id);
    if (filters.warehouse_id)
      params.append("warehouse_id", filters.warehouse_id.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getById(id: number): Promise<Penjualan> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Penjualan not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const raw = await response.json();
    return this.normalizePenjualan(raw);
  }

  async createPenjualan(
    penjualanData: PenjualanCreate
  ): Promise<{ detail: string; id: number }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(penjualanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async updatePenjualan(
    id: string,
    penjualanData: PenjualanUpdate
  ): Promise<Penjualan> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(penjualanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async finalizePenjualan(id: number): Promise<Penjualan> {
    const response = await fetch(`${this.baseUrl}/${id}/finalize`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    console.log("MASUK");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async updateStatus(
    id: string,
    statusData: PenjualanStatusUpdate
  ): Promise<Penjualan> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async uploadAttachments(
    id: string,
    files: FileList
  ): Promise<UploadResponse> {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const response = await fetch(`${this.baseUrl}/${id}/upload-attachments`, {
      method: "POST",
      headers: this.getAuthHeadersForFile(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async deleteAttachment(
    penjualanId: string,
    attachmentId: number
  ): Promise<SuccessResponse> {
    const response = await fetch(
      `${this.baseUrl}/${penjualanId}/attachments/${attachmentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async downloadAttachment(
    penjualanId: string,
    attachmentId: number
  ): Promise<Blob> {
    console.log(
      `Attempting to download: ${this.baseUrl}/${penjualanId}/download/${attachmentId}`
    );

    const response = await fetch(
      `${this.baseUrl}/${penjualanId}/download/${attachmentId}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        // Check if response is JSON (error response)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } else {
          // If not JSON, get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.log("Could not parse error response:", parseError);
      }

      console.error("Download failed:", errorMessage);
      throw new Error(errorMessage);
    }

    return response.blob();
  }

  async triggerDownload(
    pembelianId: string,
    attachmentId: number,
    filename: string
  ): Promise<void> {
    try {
      console.log(`Starting download for: ${filename}`);
      const blob = await this.downloadAttachment(pembelianId, attachmentId);

      console.log(`Got blob, size: ${blob.size}, type: ${blob.type}`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download completed successfully");
    } catch (error) {
      console.error("Download failed:", error);
      // Don't re-throw to prevent page refresh, just log
      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getTotals(id: string): Promise<TotalsResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/totals`, {
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

  async recalculateTotals(id: string): Promise<TotalsResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/recalculate`, {
      method: "POST",
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

  async deletePenjualan(id: number): Promise<SuccessResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Penjualan not found");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getSummary(): Promise<PenjualanSummary> {
    const response = await fetch(`${this.baseUrl}/stats/summary`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async rollbackPenjualan(id: number) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Penjualan not found");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getInvoice(parentId: number) {
    const response = await fetch(`${this.baseUrl}/${parentId}/invoice/html`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  }

  private toNum(n: any): number {
    if (typeof n === "number") return n;
    if (typeof n === "string") {
      const x = Number(n);
      return Number.isFinite(x) ? x : 0;
    }
    return 0;
  }

  private normalizePenjualan(raw: any): Penjualan {
    // Items: accept both "pembelian_items" and "items"
    const itemsAny = Array.isArray(raw?.pembelian_items)
      ? raw.pembelian_items
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

    const normalizedItems: PenjualanItem[] = itemsAny.map((it: any) => ({
      id: this.toNum(it.id),
      item_id: this.toNum(it.item_id),
      qty: this.toNum(it.qty),
      unit_price: this.toNum(it.unit_price),
      unit_price_rmb: this.toNum(it.unit_price_rmb),
      discount: this.toNum(it.discount),
      total_price: this.toNum(it.total_price),
      tax_percentage: this.toNum(it.tax_percentage),
      item: it.item ?? it.item_rel ?? null,
      item_rel: it.item_rel ?? it.item ?? null,
      code: it.code ?? it.item_code ?? it.item?.code,
      item_name: it.item_name ?? it.item?.name,
      item_sku: it.item_sku ?? it.item?.sku,
      item_type: it.item_type ?? it.item?.type,
      satuan_name: it.satuan_name ?? it.item?.satuan_rel?.name,
      vendor_name: it.vendor_name,
    }));

    const noDoc = raw.no_pembelian ?? raw.no_penjualan ?? raw.no ?? "";

    const statusPembayaran =
      raw.status_pembayaran ?? raw.payment_status ?? "UNPAID";

    const statusPenjualan =
      raw.status_penjualan ?? raw.status_penjualan ?? "DRAFT";

    return {
      id: this.toNum(raw.id),
      no_penjualan: String(noDoc),
      status_pembayaran: statusPembayaran,
      status_penjualan: statusPenjualan,

      additional_discount: this.toNum(raw.additional_discount),
      expense: this.toNum(raw.expense),

      sales_date: raw.sales_date,
      sales_due_date: raw.sales_due_date,
      created_at: raw.created_at,

      total_qty: this.toNum(raw.total_qty),
      total_price: this.toNum(raw.total_price),

      total_paid: this.toNum(raw.total_paid),
      total_return: this.toNum(raw.total_return),

      warehouse_id: this.toNum(raw.warehouse_id),
      customer_id: String(raw.customer_id ?? ""),
      kode_lambung: {
        id: this.toNum(raw.kode_lambung.id),
        name: raw.kode_lambung.name,
      },
      top_id: this.toNum(raw.top_id),

      warehouse_name: raw.warehouse_name,
      customer_name: raw.customer_name,
      top_name: raw.top_name,
      currency_name: raw.currency_name,

      penjualan_items: normalizedItems,

      attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    };
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private getAuthHeadersForFile(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

export const penjualanService = new PenjualanService("penjualan");
