// services/CustomerService.ts


import {Customer} from "@/types/types";

export interface CustomerCreate {
    id: string;
    name: string;
    address: string;
    currency_id: number;
    top_id: number;
    is_active: boolean;
}

export interface CustomerUpdate {
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

export interface CustomerFilters {
    page?: number;
    rowsPerPage?: number;
    is_active?: boolean;
    search_key?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class CustomerService {
    private baseUrl = `${API_BASE_URL}/customer`;

    async getAllCustomers(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.rowsPerPage) params.append('rowsPerPage', filters.rowsPerPage.toString());
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.search_key) params.append('search_key', filters.search_key);

        const response = await fetch(`${this.baseUrl}?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        return response.json();
    }

    async getCustomerById(id: string): Promise<Customer> {
        const response = await fetch(`${this.baseUrl}/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Customer not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async createCustomer(CustomerData: CustomerCreate): Promise<Customer> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(CustomerData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async updateCustomer(id: string, CustomerData: CustomerUpdate): Promise<Customer> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(CustomerData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteCustomer(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Customer not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }


}

export const customerService = new CustomerService();