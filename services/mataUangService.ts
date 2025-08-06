// services/currencyService.ts
import {TOPUnit} from "@/types/types";
import Cookies from "js-cookie";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export interface unitService {
    name: string;
    symbol: string;
    is_active: boolean;
}

export interface MataUangUpdate {
    name?: string;
    symbol: string;
    is_active?: boolean;
}

export type MataUangListResponse = {
    data: TOPUnit[];
    total: number;
};


export type ItemListResponse = {
    data: TOPUnit[];
    total: number;
};

class MataUangService {
    private baseUrl: string;

    constructor(destination: string = "currency") {
        this.baseUrl = `${NEXT_PUBLIC_API_URL}/${destination}`;
    }

    async getAllMataUang({
                             skip = 0,
                             limit = 10,
                             search = "",

                         }: {
        skip: number;
        limit: number;
        search: string;

    }): Promise<MataUangListResponse> {
        const params = new URLSearchParams();
        params.append("skip", String(skip));
        params.append("limit", String(limit));


        if (search) {
            params.append("search_key", search);
        }

        const url = `${this.baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch currencies: ${response.statusText}`);
            }

            const result = (await response.json()) as MataUangListResponse;
            return result;
        } catch (error) {
            console.error("Error fetching currencies.h:", error);
            throw error;
        }
    }


    async getAllItem({
                         skip = 0,
                         limit = 10,
                         search = "",

                     }: {
        skip: number;
        limit: number;
        search: string;

    }): Promise<MataUangListResponse> {
        const params = new URLSearchParams();
        params.append("page", String(skip));
        params.append("rowsPerPage", String(limit));


        if (search) {
            params.append("search_key", search);
        }

        const url = `${this.baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch item: ${response.statusText}`);
            }

            const result = (await response.json()) as MataUangListResponse;
            return result;
        } catch (error) {
            console.error("Error fetching item:", error);
            throw error;
        }
    }

    async getMataUang(id: string): Promise<TOPUnit> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch currency: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching currency:", error);
            throw error;
        }
    }

    async createMataUang(currencyData: unitService): Promise<TOPUnit> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(currencyData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create currency: ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating currency:", error);
            throw error;
        }
    }

    async updateMataUang(
        id: number,
        mataUangUpdate: MataUangUpdate
    ): Promise<TOPUnit> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "PUT",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(mataUangUpdate),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update currency: ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating currency:", error);
            throw error;
        }
    }

    async deleteMataUang(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete currency: ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error deleting currency:", error);
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


export const mataUangService = new MataUangService("currency");
export const jenisPembayaranService = new MataUangService("top")
export const satuanService = new MataUangService("satuan")
export const itemService = new MataUangService("item")