import carouselone from "@/public/carouselone.jpg";
import {ItemTypeEnum} from "@/services/itemService";
import {StaticImageData} from "next/image";

// Base interface for related entities (Category, Satuan, etc.)
export interface TOPUnit {
    id: number;
    name: string;
    symbol?: string; // Optional since categories might not have symbols
    is_active: boolean;
}

// Interface for Category (extends TOPUnit with category-specific fields)
export interface CategoryOut extends TOPUnit {
    category_type: number; // 1 or 2
}

// Interface for Satuan (Unit) - matches your backend SatuanOut
export interface SatuanOut extends TOPUnit {
    symbol: string; // Required for units
}

// Interface for Vendor - matches your backend VendorOut
export interface VendorOut {
    id: string; // Note: Vendor ID is string, not number
    name: string;
    address: string;
    currency_id: number;
    top_id: number;
    is_active: boolean;
    top_rel: TOPUnit;
    curr_rel: CurrencyOut;
}

// Currency interface (referenced in VendorOut)
export interface CurrencyOut {
    id: number;
    name: string;
    symbol: string;
    is_active: boolean;
}

// Attachment interface - matches your backend AttachmentResponse
export interface AttachmentResponse {
    id: number;
    filename: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    created_at: string; // ISO date string
    url?: string; // The generated URL for accessing the file
}

// Updated Item interface to match your backend ItemResponse
export interface Item {
    id: number; // Changed from string to number to match backend
    type: ItemTypeEnum;
    name: string;
    sku: string;
    is_active: boolean; // Optional since it might not always be returned
    total_item: number;
    price: number;
    created_at: string | null; // ISO date string or null

    // Related entities - can be null if not present
    satuan_rel: SatuanOut | null;
    vendor_rel: VendorOut | null;
    category_one_rel: CategoryOut | null;
    category_two_rel: CategoryOut | null;

    // Attachments array - replaces the 'gambar' field
    attachments: AttachmentResponse[];
}

// Helper type for creating/updating items
export interface ItemCreate {
    type: ItemTypeEnum;
    name: string;
    sku: string;
    total_item: number;
    price: number;
    category_one_id?: number | null;
    category_two_id?: number | null;
    satuan_id?: number | null;
    vendor_id?: string | null; // String for vendor ID
}

export interface ItemUpdate extends ItemCreate {
    id: number;
    is_active?: boolean;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

// Type alias for paginated items response
export type PaginatedItemsResponse = PaginatedResponse<Item>;

// Helper functions for working with attachments
export const getItemImageUrls = (item: Item): string[] => {
    return item.attachments
        .filter((att) => att.mime_type?.startsWith("image/"))
        .map((att) => att.url || att.file_path)
        .filter(Boolean);
};

export const getItemFirstImage = (item: Item): string | null => {
    const images = getItemImageUrls(item);
    return images.length > 0 ? images[0] : null;
};

// Helper function to check if attachment is an image
export const isImageAttachment = (attachment: AttachmentResponse): boolean => {
    return attachment.mime_type?.startsWith("image/") || false;
};

export interface Customer {
    id: string;
    name: string;
    code: string;
    address: string;
    curr_rel: TOPUnit;
    top_rel: TOPUnit;
    is_active: boolean;
}

export interface Vendor {
    id: string;
    name: string;
    address: string;

    curr_rel: TOPUnit;
    top_rel: TOPUnit;
    is_active: boolean;
}

export interface Warehouse {
    id: number;
    name: string;
    address: string;
    is_active: boolean;
}

export interface Unit {
    id: number | string;
    name: string;
    is_active: boolean;
    category_type: number;
}
