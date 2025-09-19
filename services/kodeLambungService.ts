// services/KodeLambungService.ts
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type KodeLambungData = {
  id: number;
  name: string;
};

export type KodeLambungListResponse = {
  data: KodeLambungData[];
  total: number;
};

class KodeLambungService {
  private baseUrl = `${API_URL}/kodelambung`;

  // GET /kode_lambung?search=&page=&size=
  async getAll({
    page = 1,
    size = 50,
    search = "",
  }: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<KodeLambungListResponse> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (search) params.append("search", search);

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
}

export const kodeLambungService = new KodeLambungService();
