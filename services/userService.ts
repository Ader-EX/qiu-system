import {Warehouse} from "@/types/types";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type UserIn = {
    id: number;
    username: string;
    role: number;
    is_active: boolean;
    last_login: Date;
};


export type UserOut = {
    username: string;
    role: number;
    is_active: boolean;
    password: string;
};

export type UserListResponse = {
    data: UserIn[];
    total: number;
};

class UserService {
    private baseUrl = `${API_BASE_URL}`;

    async getAllUsers({
                          skip = 0,
                          limit = 10,
                          search_key = "",
                      }: {
        skip?: number;
        limit?: number;
        search_key?: string;
    }): Promise<UserListResponse> {
        const response = await fetch(
            `${this.baseUrl}/users?skip=${skip}&limit=${limit}&search_key=${search_key}`,
            {
                method: "GET",
                headers: this.getAuthHeaders(),
            }
        );
        return this.handleResponse(response);
    }

    async createUser(userData: {
        username: string;
        password: string;
        is_active: boolean;
        role: number;
    }): Promise<UserIn> {
        const response = await fetch(`${this.baseUrl}/users`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        return this.handleResponse(response);
    }

    async deleteUser(userId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    async updateUser(
        userId: number,
        userData: {
            username?: string;
            password?: string;
            role?: number;
        }
    ): Promise<UserIn> {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: "PATCH",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        return this.handleResponse(response);
    }

    private async handleResponse(response: Response) {
        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch {
                errorBody = {detail: `HTTP error! status: ${response.status}`};
            }
            throw errorBody;
        }
        return response.json();
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

export const userService = new UserService();
