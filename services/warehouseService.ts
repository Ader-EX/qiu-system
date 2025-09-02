// services/warehouseService.ts

import {Warehouse} from "@/types/types";
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
                           }: {
        skip: number;
        limit: number;
        is_active?: boolean;
        search: string;
    }): Promise<WarehouseListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));
        if (search) params.append("search", search);
        if (is_active) params.append("is_active", String(is_active));

        const url = `${this.baseUrl}?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
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
