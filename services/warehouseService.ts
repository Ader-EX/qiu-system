// services/warehouseService.ts
import {Warehouse} from "@/types/types";

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
                               search,
                           }: {
        skip: number;
        limit: number;
        search: string;
    }): Promise<WarehouseListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));
        if (search) {
            params.append("search", search);
        }

        const url = `${this.baseUrl}?${params.toString()}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch warehouses: ${response.statusText}`);
        }

        const result = (await response.json()) as WarehouseListResponse;
        return result;
    }

    async getWarehouse(id: string): Promise<Warehouse> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch warehouse: ${response.statusText}`);
        }

        return response.json();
    }

    async createWarehouse(warehouseData: WarehouseCreate): Promise<Warehouse> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
            headers: {
                "Content-Type": "application/json",
            },
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
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete warehouse: ${response.statusText}`);
        }
    }
}

export const warehouseService = new WarehouseService();
