// services/ItemService.ts

import { Item } from "@/types/types";
import Cookies from "js-cookie";

export enum ItemTypeEnum {
  HIGH_QUALITY = "HIGH_QUALITY",
  RAW_MATERIAL = "RAW_MATERIAL",
  SERVICE = "SERVICE",
}

export interface ItemCreate {
  id: string;
  type: string;
  name: string;
  total_item: number;
  min_item: number;
  modal_price: number;
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
  type?: string;
  sku?: string;
  total_item?: number;
  min_item?: number;
  address?: string;
  price?: number;
  modal_price?: number;
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
  search_key?: string;
  is_active?: boolean;
  item_type?: ItemTypeEnum;
  sortBy?: string;
  vendor?: string;
  sortOrder?: "asc" | "desc";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ItemService {
  private baseUrl = `${API_BASE_URL}/item`;

  async getAllItems(
    filters: ItemFilters = {}
  ): Promise<PaginatedResponse<Item>> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.rowsPerPage)
      params.append("rowsPerPage", filters.rowsPerPage.toString());

    // Filtering
    if (filters.is_active !== undefined)
      params.append("is_active", filters.is_active.toString());
    if (filters.item_type !== undefined)
      params.append("item_type", filters.item_type.toString());
    if (filters.search_key) params.append("search_key", filters.search_key);

    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.vendor) params.append("vendor", filters.vendor);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
  async uploadItem(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseUrl}/import-excel?skip_on_error=false&update_existing=true`,
      {
        method: "POST",
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;

      try {
        const errorData = await response.json();

        // If server provides detailed errors array, extract the first one
        if (errorData?.errors?.length > 0) {
          const firstError = errorData.errors[0];
          errorMsg = `Row ${firstError.row}: ${firstError.error}`;
        }
        // Handle backend "detail" or "message" key
        else if (errorData?.detail) {
          errorMsg = errorData.detail;
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
      } catch {
        // Handle cases where server returns non-JSON (like 500 HTML)
        if (response.status === 500) {
          errorMsg =
            "Internal Server Error. Please contact support or try again later.";
        }
      }

      throw new Error(errorMsg);
    }
  }

  async getById(id: string): Promise<Item> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Item not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createItemWithFormData(formData: FormData): Promise<Item> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeadersForFormData(),
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

  // NEW: FormData method for updating items with images
  async updateItemWithFormData(id: number, formData: FormData): Promise<Item> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeadersForFormData(),
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

  async createItem(itemData: ItemCreate): Promise<Item> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async updateItem(id: string, itemData: ItemUpdate): Promise<Item> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Item not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) throw new Error("No access token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private getAuthHeadersForFormData(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) throw new Error("No access token found");
    return {
      // Don't set Content-Type for FormData - let browser set it with boundary
      Authorization: `Bearer ${token}`,
    };
  }
}

export const itemService = new ItemService();
