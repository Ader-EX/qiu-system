"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import Image from "next/image";
import {X} from "lucide-react";
import {Item} from "@/types/types";
import SimpleCarousel from "@/components/ui/simple-carousel";
import carouselone from "@/public/carouselone.jpg";


interface ProductDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: Item;
}

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            product,
                                                                        }) => {
    const statusLabel = product.status === "active" ? "Aktif" : "Tidak Aktif";

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle>Detail Item</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-8 pt-4">
                    {/* Left: Image */}
                    <div className="flex-shrink-0">
                        {product.gambar.length > 0 ? (
                            <SimpleCarousel
                                images={product.gambar}
                                alt={product.name}
                            />
                        ) : (
                            <div className="w-[300px] h-[300px] bg-gray-200 rounded"/>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 flex-1">
                        {/* Column 1 */}
                        <div>

                            <p className="text-sm font-medium text-gray-500 mt-4">Item ID</p>
                            <p className="mt-1">{product.id}</p>

                            <p className="text-sm font-medium text-gray-500 mt-4">Kategori 1</p>
                            <p className="mt-1">{product.category_one_rel}</p>


                            <p className="text-sm font-medium text-gray-500 mt-4">SKU</p>
                            <p className="mt-1">{product.sku}</p>

                            <p className="text-sm font-medium text-gray-500 mt-4">
                                Harga Jual (Rp)
                            </p>
                            <p className="mt-1">{product.price.toLocaleString("id-ID")}</p>

                            <p className="text-sm font-medium text-gray-500 mt-4">Vendor</p>
                            <p className="mt-1">{product.vendor_rel}</p>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <Badge
                                className={`mt-1 inline-block px-2 py-1 text-xs font-semibold ${
                                    product.status === "active"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-400 text-white"
                                } rounded-full`}
                            >
                                {statusLabel}
                            </Badge>

                            <p className="text-sm font-medium text-gray-500 mt-4">
                                Nama Item
                            </p>
                            <p className="mt-1">{product.name}</p>
                            <p className="text-sm font-medium text-gray-500 mt-4">Kategori 2</p>
                            <p className="mt-1">{product.category_two_rel}</p>

                            <p className="text-sm font-medium text-gray-500 mt-4">
                                Jumlah Item
                            </p>
                            <p className="mt-1">
                                {product.total_item.toLocaleString()} {product.satuan_rel}
                            </p>

                            <p className="text-sm font-medium text-gray-500 mt-4">Satuan</p>
                            <p className="mt-1">{product.satuan_rel}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
