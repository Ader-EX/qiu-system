// services/PembelianService.ts

import Cookies from "js-cookie";

// Enums
export enum StatusPembayaranEnum {
    UNPAID = "UNPAID",
    HALF_PAID = "HALF_PAID",
    PAID = "PAID",
}

export enum StatusPembelianEnum {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PROCESSED = "PROCESSED",
    COMPLETED = "COMPLETED",
}

export interface PembelianItem {
    id?: number;
    code?: string;
    item_id: string;
    item_name?: string;
    item_sku?: string;
    item_type?: string;
    satuan_name?: string;
    vendor_name?: string;
    qty: number;
    discount: number;
    unit_price: number;
    total_price: number;
    tax_percentage?: number;
    item_rel: any;
}

export interface Attachment {
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
}

export interface Pembelian {
    id: number;
    no_pembelian: string;
    status_pembayaran: StatusPembayaranEnum;
    status_pembelian: StatusPembelianEnum;

    additional_discount: number;
    expense: number;
    sales_date: string;
    sales_due_date: string;
    total_qty: number;
    total_price: number;
    total_paid?: number;
    total_return?: number;
    warehouse_id?: number;
    vendor_id?: string;
    top_id?: number;
    warehouse_name?: string;
    vendor_name?: string;
    top_name?: string;
    currency_name?: string;
    created_at: string;
    pembelian_items: any[];
    attachments: Attachment[];
}

export interface PembelianListResponse {
    id: number;
    no_pembelian: string;
    status_pembayaran: StatusPembayaranEnum;
    status_pembelian: StatusPembelianEnum;
    sales_date: string;
    total_paid: number;
    total_return: number;
    total_qty: number;
    total_price: number;
    vendor_name?: string;
    warehouse_name?: string;
    items_count: number;
    attachments_count: number;
}

export interface PembelianCreate {
    no_pembelian: string;
    warehouse_id?: number;
    vendor_id?: string;
    top_id?: number;
    sales_date: string;
    sales_due_date?: string;

    additional_discount?: number;
    expense?: number;
    items: Array<{
        item_id: number;
        qty: number;
        unit_price: number;
        tax_percentage: number;
        discount: number;
    }>;
}

export interface PembelianUpdate {
    no_pembelian?: string;
    warehouse_id?: number;
    vendor_id?: string;
    top_id?: number;
    sales_date?: string;
    sales_due_date?: string;

    additional_discount?: number;
    expense?: number;
    items?: Array<{
        item_id?: number;
        qty?: number;
        unit_price?: number;
        tax_percentage?: number;
        discount?: number;
    }>;
}

export interface PembelianStatusUpdate {
    status_pembelian?: StatusPembelianEnum;
    status_pembayaran?: StatusPembayaranEnum;
}

export interface TotalsResponse {
    subtotal: number;
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

export interface PembelianSummary {
    total_pembelian: number;
    draft_count: number;
    active_count: number;
    completed_count: number;
    total_value: number;
    unpaid_value: number;
}

export interface PembelianFilters {
    status_pembelian?: StatusPembelianEnum;
    status_pembayaran?: StatusPembayaranEnum;
    search_key?: string;
    vendor_id?: string;
    warehouse_id?: number;
    page?: number;
    size?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class PembelianService {
    private baseUrl: string;

    constructor(destination: string = "pembelian") {
        this.baseUrl = `${API_BASE_URL}/${destination}`;
    }

    async getAllPembelian(
        filters: PembelianFilters = {}
    ): Promise<PaginatedResponse<PembelianListResponse>> {
        const params = new URLSearchParams();

        if (filters.status_pembelian)
            params.append("status_pembelian", filters.status_pembelian);
        if (filters.status_pembayaran)
            params.append("status_pembayaran", filters.status_pembayaran);
        if (filters.search_key) params.append("search_key", filters.search_key);
        if (filters.vendor_id) params.append("vendor_id", filters.vendor_id);
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

    async getPembelianById(id: number): Promise<Pembelian> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Pembelian not found");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createPembelian(
        pembelianData: PembelianCreate
    ): Promise<{ detail: string; id: number }> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(pembelianData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async updatePembelian(
        id: string,
        pembelianData: PembelianUpdate
    ): Promise<Pembelian> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(pembelianData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async finalizePembelian(id: number): Promise<Pembelian> {
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
        statusData: PembelianStatusUpdate
    ): Promise<Pembelian> {
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
        pembelianId: string,
        attachmentId: number
    ): Promise<SuccessResponse> {
        const response = await fetch(
            `${API_BASE_URL}/upload/attachments/${attachmentId}`,
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

    async downloadAttachment(pembelianId: string, attachmentId: number): Promise<Blob> {
        console.log(`Attempting to download: ${this.baseUrl}/${pembelianId}/download/${attachmentId}`);

        const response = await fetch(`${this.baseUrl}/${pembelianId}/download/${attachmentId}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, response.headers);

        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
                // Check if response is JSON (error response)
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } else {
                    // If not JSON, get text
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
            } catch (parseError) {
                console.log('Could not parse error response:', parseError);
            }

            console.error('Download failed:', errorMessage);
            throw new Error(errorMessage);
        }

        return response.blob();
    }

    async triggerDownload(pembelianId: string, attachmentId: number, filename: string): Promise<void> {
        try {
            console.log(`Starting download for: ${filename}`);
            const blob = await this.downloadAttachment(pembelianId, attachmentId);

            console.log(`Got blob, size: ${blob.size}, type: ${blob.type}`);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('Download completed successfully');
        } catch (error) {
            console.error('Download failed:', error);
            // Don't re-throw to prevent page refresh, just log
            alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

// Method 3: If you still need a URL (for preview, etc.) - but this won't work directly in browser
    getDownloadUrl(pembelianId: string, attachmentId: number): string {
        // Note: This URL alone won't work in browser without auth headers
        // Use this only if you're making fetch requests with proper headers
        return `${this.baseUrl}/${pembelianId}/download/${attachmentId}`;
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

    async deletePembelian(id: number): Promise<SuccessResponse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Pembelian not found");
            }
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async rollbackPembelian(id: number) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PATCH",
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Pembelian not found");
            }
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async getSummary(): Promise<PembelianSummary> {
        const response = await fetch(`${this.baseUrl}/stats/summary`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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

export const pembelianService = new PembelianService("pembelian");
