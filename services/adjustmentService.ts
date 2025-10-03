import Cookies from "js-cookie";
import {Warehouse} from "@/types/types";
import {Attachment} from "./pembelianService";
import {Item} from "@/types/types";

export type StockAdjustmentItemCreate = {
    item_id: number;
    qty: number;
    adj_price: number;
};

export type StockAdjustmentItemResponse = {
    id: number;
    item_id: number;
    qty: number;
    adj_price: number;
    stock_adjustment_id: number;
    item_rel?: Item;
};

export enum AdjustmentType {
    IN = "IN",
    OUT = "OUT",
}

export type StockAdjustmentCreate = {
    adjustment_type: string;
    adjustment_date: string;
    warehouse_id: number;
    stock_adjustment_items: StockAdjustmentItemCreate[];
};

export type StockAdjustmentUpdate = {
    adjustment_type?: string;
    adjustment_date?: string;
    warehouse_id?: number;
    stock_adjustment_items?: StockAdjustmentItemCreate[];
};

export type StockAdjustmentResponse = {
    id: number;
    no_adjustment: string;
    adjustment_date: string;
    adjustment_type: string;
    status_adjustment: string;
    warehouse_id: number;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    is_deleted: boolean;
    stock_adjustment_items: StockAdjustmentItemResponse[];
    warehouse_rel?: Warehouse;
    attachments?: Attachment[];
};

export type StockAdjustmentListResponse = {
    data: StockAdjustmentResponse[];
    total: number;
    skip: number;
    limit: number;
};

export type StockAdjustmentQueryParams = {
    skip?: number;
    limit?: number;
    adjustment_type?: string;
    status?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class StockAdjustmentService {
    private baseUrl = `${API_BASE_URL}/stock-adjustment`;

    async getStockAdjustments(
        params?: StockAdjustmentQueryParams
    ): Promise<{ detail: string } & StockAdjustmentListResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
            if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
            if (params.adjustment_type) queryParams.append("adjustment_type", params.adjustment_type);
            if (params.status) queryParams.append("status", params.status);
            if (params.search) queryParams.append("search", params.search);
            if (params.from_date) queryParams.append("from_date", params.from_date);
            if (params.to_date) queryParams.append("to_date", params.to_date);
        }

        const url = queryParams.toString()
            ? `${this.baseUrl}?${queryParams.toString()}`
            : this.baseUrl;

        const response = await fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) await this.handleError(response, "fetching stock adjustments");

        const data = await response.json();
        return {...data, detail: "Stock adjustments fetched successfully"};
    }

    async getStockAdjustmentById(
        id: number
    ): Promise<{ detail: string } & StockAdjustmentResponse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) await this.handleError(response, "fetching stock adjustment");

        const data = await response.json();
        return {...data, detail: "Stock adjustment fetched successfully"};
    }

    async createStockAdjustment(
        data: StockAdjustmentCreate
    ): Promise<{ detail: string } & StockAdjustmentResponse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) await this.handleError(response, "creating stock adjustment");

        const result = await response.json();
        return {...result, detail: "Stock adjustment created successfully"};
    }

    async updateStockAdjustment(
        id: number,
        data: StockAdjustmentUpdate
    ): Promise<{ detail: string } & StockAdjustmentResponse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) await this.handleError(response, "updating stock adjustment");

        const result = await response.json();
        return {...result, detail: "Stock adjustment updated successfully"};
    }

    async deleteStockAdjustment(id: number): Promise<{ detail: string }> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) await this.handleError(response, "deleting stock adjustment");

        const result = await response.json();
        return {...result, detail: "Stock adjustment deleted successfully"};
    }

    async activateStockAdjustment(id: number): Promise<{ detail: string }> {
        const response = await fetch(`${this.baseUrl}/${id}/finalize`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) await this.handleError(response, "activating stock adjustment");

        const result = await response.json();
        return {...result, detail: result?.detail ?? "Stock adjustment activated successfully"};
    }

    async rollbackStockAdjustment(id: number): Promise<{ detail: string }> {
        const response = await fetch(`${this.baseUrl}/${id}/rollback`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) await this.handleError(response, "rolling back stock adjustment");

        const result = await response.json();
        return {...result, detail: result?.detail ?? "Rollback completed successfully"};
    }

    async downloadAttachment(adjustmentId: string, attachmentId: number): Promise<Blob> {
        const response = await fetch(
            `${this.baseUrl}/${adjustmentId}/download/${attachmentId}`,
            {
                method: "GET",
                headers: this.getAuthHeaders(),
            }
        );

        if (!response.ok) await this.handleError(response, "downloading attachment");

        return response.blob();
    }
    

    async triggerDownload(
        adjustmentId: string,
        attachmentId: number,
        filename: string
    ): Promise<{ detail: string }> {
        try {
            const blob = await this.downloadAttachment(adjustmentId, attachmentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return {detail: "Download completed successfully"};
        } catch (error: any) {
            return {detail: error?.detail ?? "Download failed"};
        }
    }

    private async handleError(response: Response, action: string): Promise<never> {
        let errorBody: any = {};
        try {
            errorBody = await response.json();
        } catch {
            errorBody = {detail: await response.text() || "Unknown error"};
        }

        const detail =
            errorBody?.detail ||
            `Error ${action}: ${response.status} ${response.statusText}`;

        throw {detail, ...errorBody};
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

export const stockAdjustmentService = new StockAdjustmentService();
