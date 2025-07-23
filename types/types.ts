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
    id: string;
    name: string;
    address: string;
    isActive: boolean;
}



export interface Product {
    id: string;
    nama: string;
    SKU: string;
    type: string;
    status: "active" | "inactive";
    jumlah: number;
    harga: number;
    satuan: string;
    vendor: string;
    gambar: (StaticImageData | string)[];
    kategori1: string;
    kategori2: string;
}


export interface Category {
    id: string;
    name: string;
    status: "Aktif" | "Non Aktif";
}

export interface Unit {
    id: string;
    name: string;
    symbol: string;
    status: boolean;
}

