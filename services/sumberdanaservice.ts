// services/warehouseService.ts

import {Sumberdana} from "@/types/types";
import Cookies from "js-cookie";

const NEXT_PUBLIC_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SumberdanaCreate {
    name: string;
    is_active: boolean;
}

export interface SumberdanaUpdate {
    name?: string;
    is_active?: boolean;
}

export type SumberdanaListResponse = {
    data: Sumberdana[];
    total: number;
};

class SumberdanaService {
    private baseUrl = `${NEXT_PUBLIC_API_URL}/sumberdana`;

    async getAllSumberdanas({
                                skip = 0,
                                limit = 10,
                                is_active,
                                search,
                                contains_deleted,
                                signal,
                                from_date,
                                to_date
                            }: {
        skip: number;
        limit: number;
        is_active?: boolean;
        search: string;
        contains_deleted?: boolean;
        signal?: AbortSignal;
        from_date?: Date;
        to_date?: Date;
    }): Promise<SumberdanaListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));
        if (search) params.append("search_key", search);
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
            throw new Error(`Failed to fetch sumber dana: ${response.statusText}`);
        }

        return response.json();
    }

    async getById(id: number): Promise<Sumberdana> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sumber dana: ${response.statusText}`);
        }

        return response.json();
    }

    async createSumberdana(sumberDanadata: SumberdanaCreate): Promise<Sumberdana> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(sumberDanadata),
        });

        if (!response.ok) {
            throw new Error(`Failed to create sumber dana: ${response.statusText}`);
        }

        return response.json();
    }

    async updateSumberdana(
        id: number,
        sumberdanaUpdateData: SumberdanaUpdate
    ): Promise<Sumberdana> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(sumberdanaUpdateData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update sumber dana: ${response.statusText}`);
        }

        return response.json();
    }

    async deleteSumberdana(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete sumber dana: ${response.statusText}`);
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

export const sumberdanaService = new SumberdanaService();
