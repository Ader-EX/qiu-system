// services/warehouseService.ts

import {SearchableSelectResponse, SearchableSelectResponseVendor, Warehouse} from "@/types/types";
import Cookies from "js-cookie";

const NEXT_PUBLIC_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface WarehouseCreate {
    name: string;
    address: string;
    is_active: boolean;
}

export interface WarehouseUpdate {
    name?: string;
    address?: string;
    isActive?: boolean;
}

export type WarehouseListResponse = {
    data: Warehouse[];
    total: number;
};

class WarehouseService {
    private baseUrl = `${NEXT_PUBLIC_API_URL}/warehouse`;

    async getAllWarehouses({
                               skip = 0,
                               limit = 10,
                               is_active,
                               search,
                               contains_deleted,
                               signal,
                               from_date, to_date
                           }: {
        skip: number;
        limit: number;
        is_active?: boolean;
        search: string;
        contains_deleted?: boolean;
        signal?: AbortSignal;
        from_date?: Date,
        to_date?: Date
    }): Promise<WarehouseListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));
        if (search) params.append("search", search);
        if (is_active) params.append("is_active", String(is_active));
        if (contains_deleted)
            params.append("contains_deleted", String(contains_deleted));


        if (from_date && to_date) {
            params.append("from_date", String(from_date));
            params.append("to_date", String(to_date));

        }
        const url = `${this.baseUrl}?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
            signal: signal,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch warehouses: ${response.statusText}`);
        }

        return response.json();
    }

    async getWarehouse(id: string): Promise<Warehouse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch warehouse: ${response.statusText}`);
        }

        return response.json();
    }

    async createWarehouse(warehouseData: WarehouseCreate): Promise<Warehouse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(warehouseData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create warehouse: ${response.statusText}`);
        }

        return response.json();
    }

    async updateWarehouse(
        id: number,
        warehouseData: WarehouseUpdate
    ): Promise<Warehouse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(warehouseData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update warehouse: ${response.statusText}`);
        }

        return response.json();
    }


    async getForSearchable(id: string | number): Promise<SearchableSelectResponse<number>> {
        const response = await fetch(`${this.baseUrl}/searchable/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Vendor not found");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteWarehouse(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete warehouse: ${response.statusText}`);
        }
    }

    private getAuthHeaders(): HeadersInit {
        const token = Cookies.get("access_token");
        if (!token) throw new Error("No access token found");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }
}

export const warehouseService = new WarehouseService();
