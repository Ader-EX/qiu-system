import carouselone from "@/public/carouselone.jpg";
import {StaticImageData} from "next/image";
import {ItemTypeEnum} from "@/services/itemService";

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
    top_rel: TOPUnit
    is_active: boolean;
}


export interface Warehouse {
    id: number;
    name: string;
    address: string;
    is_active: boolean;
}

export interface Item {
    id: string;
    type: ItemTypeEnum;
    name: string;
    sku: string;

    is_active: boolean;
    total_item: number;
    price: number;
    satuan_rel: TOPUnit;
    vendor_rel: TOPUnit;
    gambar: (StaticImageData | string)[];
    category_one_rel: TOPUnit;
    category_two_rel: TOPUnit;
}

export interface Unit {
    id?: number;
    name: string;
    is_active: boolean;
    category_type: number
}

export interface TOPUnit {
    id: number;
    name: string;
    symbol: string;
    is_active: boolean;
}
