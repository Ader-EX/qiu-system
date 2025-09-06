// services/VendorService.ts

import { Vendor } from "@/types/types";
import Cookies from "js-cookie";

export interface VendorCreate {
  name: string;
  address: string;
  currency_id: number;
  top_id: number;
  is_active: boolean;
}

export interface VendorUpdate {
  id: string;
  name?: string;

  address?: string;
  currency_id?: number;
  top_id?: number;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface VendorFilters {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  search_key?: string;
  contains_deleted?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class VendorService {
  private baseUrl = `${API_BASE_URL}/vendor`;

  async getAllVendors(
    filters: VendorFilters = {},
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Vendor>> {
    const params = new URLSearchParams();

    if (filters.skip) params.append("page", filters.skip.toString());
    if (filters.limit) params.append("rowsPerPage", filters.limit.toString());
    if (filters.is_active !== undefined)
      params.append("is_active", filters.is_active.toString());
    if (filters.search_key) params.append("search_key", filters.search_key);
    if (filters.contains_deleted)
      params.append("contains_deleted", filters.contains_deleted.toString());

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: this.getAuthHeaders(),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getVendorById(id: string): Promise<Vendor> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
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

  async createVendor(vendorData: VendorCreate): Promise<Vendor> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async updateVendor(id: string, vendorData: VendorUpdate): Promise<Vendor> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async deleteVendor(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Vendor not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
}

export const vendorService = new VendorService();
