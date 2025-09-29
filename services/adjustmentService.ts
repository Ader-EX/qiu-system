import Cookies from "js-cookie";
import {WarehouseListResponse} from "@/services/warehouseService";
import {Item, Warehouse} from "@/types/types";


export type StockAdjustmentItemCreate = {
    item_id: number;
    qty: number;
    adj_price: number;
}

export type StockAdjustmentItemResponse = {
    id: number;
    item_id: number;
    qty: number;
    adj_price: number;
    stock_adjustment_id: number;
    item_rel?: Item;
}


export type StockAdjustmentCreate = {
    adjustment_type: string; // "IN" or "OUT"
    adjustment_date: string; // ISO date format
    warehouse_id: number;
    stock_adjustment_items: StockAdjustmentItemCreate[];
}

export type StockAdjustmentUpdate = {
    adjustment_type?: string;
    adjustment_date?: string;
    warehouse_id?: number;
    stock_adjustment_items?: StockAdjustmentItemCreate[];
}

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
}

export type StockAdjustmentListResponse = {
    data: StockAdjustmentResponse[];
    total: number;
    skip: number;
    limit: number;
}

// Query params for filtering
export type StockAdjustmentQueryParams = {
    skip?: number;
    limit?: number;
    adjustment_type?: string;
    status?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class StockAdjustmentService {
    private baseUrl = `${API_BASE_URL}/stock-adjustments`;

    /**
     * Get list of stock adjustments with filtering
     */
    async getStockAdjustments(params?: StockAdjustmentQueryParams): Promise<StockAdjustmentListResponse> {
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

        if (!response.ok) {
            throw new Error(`Error fetching stock adjustments: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get a single stock adjustment by ID
     */
    async getStockAdjustmentById(id: number): Promise<StockAdjustmentResponse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error fetching stock adjustment: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create a new stock adjustment
     */
    async createStockAdjustment(data: StockAdjustmentCreate): Promise<StockAdjustmentResponse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error creating stock adjustment: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update a stock adjustment
     */
    async updateStockAdjustment(id: number, data: StockAdjustmentUpdate): Promise<StockAdjustmentResponse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error updating stock adjustment: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Delete a stock adjustment (soft delete)
     */
    async deleteStockAdjustment(id: number): Promise<{ message: string }> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error deleting stock adjustment: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Activate a stock adjustment (change status to ACTIVE)
     */
    async activateStockAdjustment(id: number): Promise<StockAdjustmentResponse> {
        const response = await fetch(`${this.baseUrl}/${id}/activate`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error activating stock adjustment: ${response.statusText}`);
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

export const stockAdjustmentService = new StockAdjustmentService();