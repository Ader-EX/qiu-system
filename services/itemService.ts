// services/ItemService.ts


import {Item} from "@/types/types";

export enum ItemTypeEnum {
    FINISH_GOOD = "FINISH_GOOD",
    RAW_MATERIAL = "RAW_MATERIAL",
    SERVICE = "SERVICE",
}

export interface ItemCreate {
    id: string;
    type: ItemTypeEnum;
    name: string;
    total_item: number;
    price: number;
    sku: string;
    
    vendor_id: number;
    satuan_id: number;
    category_one_id: number;
    category_two_id: number;
    is_active: boolean;
}

export interface ItemUpdate {
    name?: string;
    type?: ItemTypeEnum;
    sku?: string;
    total_item?: number;
    address?: string;
    price?: number;
    satuan_id?: number;
    vendor_id?: number;
    category_one_id?: number;
    category_two_id?: number;

    is_active?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

export interface ItemFilters {
    page?: number;
    rowsPerPage?: number;
    is_active?: boolean;
    item_type?: ItemTypeEnum;
    search_key?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ItemService {
    private baseUrl = `${API_BASE_URL}/item`;

    async getAllItems(filters: ItemFilters = {}): Promise<PaginatedResponse<Item>> {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.rowsPerPage) params.append('rowsPerPage', filters.rowsPerPage.toString());
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.item_type !== undefined) params.append('item_type', filters.item_type.toString());
        if (filters.search_key) params.append('search_key', filters.search_key);

        const response = await fetch(`${this.baseUrl}?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        return response.json();
    }

    async getItemById(id: string): Promise<Item> {
        const response = await fetch(`${this.baseUrl}/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Item not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createItem(ItemData: ItemCreate): Promise<Item> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ItemData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async updateItem(id: string, ItemData: ItemUpdate): Promise<Item> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ItemData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteItem(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Item not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }


}

export const itemService = new ItemService();