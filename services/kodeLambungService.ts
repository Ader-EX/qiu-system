// services/KodeLambungService.ts
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type KodeLambungData = {
    id: number;
    name: string;
};

export type KodeLambungUpdateData = {
    id?: number;
    name: string;
};


export type KodeLambungListResponse = {
    data: KodeLambungData[];
    total: number;
};

class KodeLambungService {
    private baseUrl = `${API_URL}/kodelambung`;

    async getAll({
                     page = 1,
                     size = 10,
                     search = "",
                     contains_deleted,
                     customer_id
                 }: {
        page?: number;
        size?: number;
        search?: string;
        contains_deleted?: boolean;
        customer_id?: number

    }): Promise<KodeLambungListResponse> {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("size", String(size));
        if (search) params.append("search", search);
        if (contains_deleted) params.append("contains_deleted", String(contains_deleted));
        if (customer_id) params.append("customer_id", String(customer_id));

        const url = `${this.baseUrl}?${params.toString()}`;

        const res = await fetch(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!res.ok) {
            throw new Error(
                `Failed to fetch kode lambung: ${res.status} ${res.statusText}`
            );
        }

        return (await res.json()) as KodeLambungListResponse;
    }

    // GET /kode_lambung/{id}
    async getById(id: number): Promise<KodeLambungData> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        if (!res.ok) {
            throw new Error(
                `Failed to fetch kode lambung: ${res.status} ${res.statusText}`
            );
        }

        return (await res.json()) as KodeLambungData;
    }

    // Auth header (Bearer from cookie)
    private getAuthHeaders(): HeadersInit {
        const token = Cookies.get("access_token");
        return {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        };
    }
}

export const kodeLambungService = new KodeLambungService();
