// services/CustomerService.ts

import {Customer} from "@/types/types";
import Cookies from "js-cookie";
import {KodeLambungData, KodeLambungUpdateData} from "@/services/kodeLambungService";
import {param} from "ts-interface-checker";

export interface CustomerCreate {
    name: string;
    address: string;
    currency_id: number;
    kode_lambungs?: string[];
    is_active: boolean;
}

export interface CustomerUpdate {
    id?: string;
    name?: string;
    address?: string;
    kode_lambungs?: KodeLambungUpdateData[];
    currency_id?: number;
    is_active?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

export interface CustomerFilters {
    page?: number;
    rowsPerPage?: number;
    is_active?: boolean;
    search_key?: string;
    contains_deleted?: boolean;
    from_date?: Date;
    to_date?: Date
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class CustomerService {
    private baseUrl = `${API_BASE_URL}/customer`;

    async getAllCustomers(
        filters: CustomerFilters = {}
    ): Promise<PaginatedResponse<Customer>> {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.rowsPerPage)
            params.append("rowsPerPage", filters.rowsPerPage.toString());
        if (filters.is_active !== undefined)
            params.append("is_active", filters.is_active.toString());
        if (filters.search_key) params.append("search_key", filters.search_key);
        if (filters.contains_deleted)
            params.append("contains_deleted", filters.contains_deleted.toString());
        if (filters.from_date && filters.to_date) {
            params.append("from_date", String(filters.from_date));
            params.append("to_date", String(filters.to_date));
        }

        const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getById(id: number, is_kodelambung_active?: boolean): Promise<Customer> {
        const params = new URLSearchParams();

        if (is_kodelambung_active) params.append("is_kodelambung_active", String(is_kodelambung_active));
        params.append("contains_deleted", "false")
        const response = await fetch(`${this.baseUrl}/${id}?${params}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Customer not found");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createCustomer(customerData: CustomerCreate): Promise<Customer> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(customerData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async updateCustomer(
        id: string,
        customerData: CustomerUpdate
    ): Promise<Customer> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(customerData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    async deleteCustomer(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Customer not found");
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
}

export const customerService = new CustomerService();
