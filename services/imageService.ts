// services/imageService.ts

import Cookies from "js-cookie";

export enum ParentType {
  ITEMS = "ITEMS",
  PEMBELIANS = "PEMBELIANS",
  PENJUALANS = "PENJUALANS",
  PEMBAYARANS = "PEMBAYARANS",
  PENGEMBALIANS = "PENGEMBALIANS",
  STOCK_ADJUSTMENTS = "STOCK_ADJUSTMENTS",
}

export interface ImageUploadRequest {
  file: File;
  parent_type: ParentType;
  parent_id: number;
}

export interface ImageUploadResponse {
  attachment_id: number;
  file_path: string;
  url: string;
}

export interface AttachmentInfo {
  id: number;
  parent_type: ParentType;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  url: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ImageService {
  private baseUrl = `${API_BASE_URL}`;

  async uploadImage(request: ImageUploadRequest): Promise<ImageUploadResponse> {
    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (request.file.size > maxSize) {
      throw new Error("File size must be less than 2MB");
    }

    // Validate file type (only PDF for this case, but can be extended)
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(request.file.type)) {
      throw new Error("Only PDF files are allowed");
    }

    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("parent_type", request.parent_type);
    formData.append("parent_id", request.parent_id.toString());

    const response = await fetch(`${this.baseUrl}/upload/upload-image`, {
      method: "POST",
      headers: this.getAuthHeadersWithoutContentType(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async downloadAttachment(attachment_id: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/upload/attachments/${attachment_id}/download`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Attachment not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob(); // <-- instead of .json()
  }

  async getAttachmentsByParent(
    parentType: ParentType,
    parentId: string
  ): Promise<AttachmentInfo[]> {
    const params = new URLSearchParams();
    params.append("parent_type", parentType);
    params.append("parent_id", parentId.toString());

    const response = await fetch(`${this.baseUrl}/attachments?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/upload/attachments/${attachmentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Attachment not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  validateFile(
    file: File,
    allowedTypes: string[] = ["application/pdf"],
    maxSizeMB: number = 2
  ): string | null {
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes
        .map((type) => {
          switch (type) {
            case "application/pdf":
              return "PDF";
            case "image/jpeg":
              return "JPEG";
            case "image/png":
              return "PNG";
            case "image/gif":
              return "GIF";
            default:
              return type;
          }
        })
        .join(", ");
      return `Only ${allowedExtensions} files are allowed`;
    }

    return null;
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

  private getAuthHeadersWithoutContentType(): HeadersInit {
    const token = Cookies.get("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  handleDownload = async (att: { id: any; filename: any }) => {
    const blob = await imageService.downloadAttachment(att.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = att.filename; // trigger browser download
    link.click();
    URL.revokeObjectURL(url);
  };
}

export const imageService = new ImageService();
