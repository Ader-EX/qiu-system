import carouselone from "@/public/carouselone.jpg";
import {StaticImageData} from "next/image";

export interface Customer {
    id: string;
    name: string;
    code: string;
    address: string;
    currency: string;
    top: string;
    status: "active" | "inactive";
}

export interface Warehouse {
    id: number;
    name: string;
    address: string;
    is_active: boolean;
}

export interface Product {
    id: string;
    nama: string;
    SKU: string;

    is_active: boolean;
    jumlah: number;
    harga: number;
    satuan: string;
    vendor: string;
    gambar: (StaticImageData | string)[];
    kategori1: string;
    kategori2: string;
}

export interface Unit {
    id?: number;
    name: string;
    is_active: boolean;
    category_type: number
}

export interface Unit {
    id: string;
    name: string;
    symbol: string;
    is_active: boolean;
}
