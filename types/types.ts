import carouselone from "@/public/carouselone.jpg";
import { ItemTypeEnum } from "@/services/itemService";
import { StaticImageData } from "next/image";

export interface TOPUnit {
  id: number;
  name: string;
  symbol?: string;
  is_active: boolean;
}

export interface CategoryOut extends TOPUnit {
  category_type: number; // 1 or 2
}

export interface SatuanOut extends TOPUnit {
  symbol: string; // Required for units
}

export interface VendorOut {
  id: string;
  name: string;
  address: string;
  currency_id: number;
  top_id: number;
  is_active: boolean;
  top_rel: TOPUnit;
  curr_rel: CurrencyOut;
}

export interface CurrencyOut {
  id: number;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface AttachmentResponse {
  id: number;
  filename: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  url?: string;
}

export interface Item {
  id: number;
  code: string;
  type: ItemTypeEnum;
  name: string;
  sku: string;
  is_active: boolean;
  total_item: number;
  price: number;
  created_at: string | null;
  satuan_rel: SatuanOut | null;
  kode_lambung?: string;
  category_one_rel: CategoryOut | null;
  category_two_rel: CategoryOut | null;
  attachments: AttachmentResponse[];
}

export interface ItemCreate {
  type: ItemTypeEnum;
  name: string;
  sku: string;
  total_item: number;
  price: number;
  category_one_id?: number | null;
  category_two_id?: number | null;
  satuan_id?: number | null;
  kode_lambung?: string;
}

export interface ItemUpdate extends ItemCreate {
  id: number;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export type PaginatedItemsResponse = PaginatedResponse<Item>;

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
  is_active: boolean;
  kode_lambung?: string;
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
