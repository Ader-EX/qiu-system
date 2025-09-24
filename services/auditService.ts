import Cookies from "js-cookie";


export type AuditTrailResponse = {
    id: number;
    user_name: string;
    entity_type: string;
    entity_id: string;
    description: string;
    timestamp: string;
}

export type AuditTrailListResponse = {
    total: number;
    items: AuditTrailResponse[];
    limit: number;
    offset: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class AuditService {
    private baseUrl = `${API_BASE_URL}/audit-trail`;

    async getAuditLogsByIdAndType(id: string, type: string): Promise<AuditTrailListResponse> {
        const response = await fetch(this.baseUrl + `/${type}/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error fetching audit logs: ${response.statusText}`);
        }
        return response.json();
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

export const auditService = new AuditService();