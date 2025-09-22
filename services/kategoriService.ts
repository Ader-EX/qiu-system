// services/CategoryService.ts
import {Unit} from "@/types/types";
import Cookies from "js-cookie";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export interface KategoriService {
    name: string;
    category_type: number;
    is_active: boolean;
}

export interface CategoryUpdate {
    name?: string;
    category_type: number;
    is_active?: boolean;
}

export type CategoryListResponse = {
    data: Unit[];
    total: number;
};

class CategoryService {
    private baseUrl = `${NEXT_PUBLIC_API_URL}/category`;

    async getAllCategories({
                               skip = 0,
                               limit = 10,
                               type = 1,
                               is_active,
                               search = "",
                               from_date, to_date,
                               contains_deleted
                           }: {
        skip: number;
        limit: number;
        type: number;
        is_active?: boolean;
        search: string;
        from_date?: Date,
        to_date?: Date
        contains_deleted?: boolean
    }): Promise<CategoryListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));
        params.append("cat_type", String(type))

        if (search) {
            params.append("search_key", search);
        }

        if (is_active) {
            params.append("is_active", String(is_active));
        }

        if (from_date && to_date) {
            params.append("from_date", String(from_date));
            params.append("to_date", String(to_date));

        }
        if (contains_deleted)
            params.append("contains_deleted", String(contains_deleted));


        const url = `${this.baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }

            const result = (await response.json()) as CategoryListResponse;
            return result;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    async getById(id: number): Promise<Unit> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch category: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching category:", error);
            throw error;
        }
    }

    async createCategory(categoryData: KategoriService): Promise<Unit> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create category: ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    }

    async updateCategory(
        id: number,
        categoryData: CategoryUpdate
    ): Promise<Unit> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "PUT",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update category: ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete category: ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    }

    private getAuthHeaders(): HeadersInit {
        const token = Cookies.get("access_token");
        return {
            "Content-Type": "application/json",
            ...(token && {Authorization: `Bearer ${token}`}),
        };
    }
}

export const kategoriService = new CategoryService();