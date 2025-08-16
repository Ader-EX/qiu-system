"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import Image, { StaticImageData } from "next/image";
import { Item } from "@/types/types";
import SimpleCarousel from "@/components/ui/simple-carousel";
import carouselone from "@/public/carouselone.jpg";

interface ProductDetailDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  product: Item;
}

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  isOpen,
  onCloseAction,
  product,
}) => {
  // Get image URLs from attachments
  const imageAttachments = product.attachments.filter((att) =>
    att.mime_type?.startsWith("image/")
  );

  const imageUrls = imageAttachments
    .map((att) => att.url)
    .filter((url): url is string => typeof url === "string");

  const displayPhotos: (string | StaticImageData)[] =
    imageUrls.length > 0 ? imageUrls : [carouselone];

  const statusLabel = product.is_active ? "Aktif" : "Tidak Aktif";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onCloseAction()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detail Item</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 pt-4">
          {/* Left: Image */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            {displayPhotos.length > 0 ? (
              <SimpleCarousel images={displayPhotos} alt={product.name} />
            ) : (
              <div className="w-full lg:w-[300px] h-[300px] bg-gray-200 rounded flex items-center justify-center">
                <Image
                  src={carouselone}
                  alt="No image"
                  width={300}
                  height={300}
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 flex-1">
            {/* Column 1 */}
            <div>
              <p className="text-sm font-medium text-gray-500">Kode Item</p>
              <p className="mt-1">{product.code}</p>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Kategori 1
              </p>
              <p className="mt-1">{product.category_one_rel?.name || "-"}</p>

              <p className="text-sm font-medium text-gray-500 mt-4">SKU</p>
              <p className="mt-1">{product.sku}</p>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Harga Jual (Rp)
              </p>
              <p className="mt-1">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>

              <p className="text-sm font-medium text-gray-500 mt-4">Vendor</p>
              <p className="mt-1">{product.vendor_rel?.name || "-"}</p>
            </div>

            {/* Column 2 */}
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge
                variant={product.is_active ? "okay" : "secondary"}
                className="mt-1"
              >
                {statusLabel}
              </Badge>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Nama Item
              </p>
              <p className="mt-1">{product.name}</p>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Kategori 2
              </p>
              <p className="mt-1">{product.category_two_rel?.name || "-"}</p>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Jumlah Item
              </p>
              <p className="mt-1">
                {product.total_item.toLocaleString()}{" "}
                {product.satuan_rel?.symbol || "unit"}
              </p>

              <p className="text-sm font-medium text-gray-500 mt-4">Satuan</p>
              <p className="mt-1">
                {product.satuan_rel?.name || "-"} (
                {product.satuan_rel?.symbol || "-"})
              </p>

              <p className="text-sm font-medium text-gray-500 mt-4">
                Tipe Item
              </p>
              <p className="mt-1">{product.type.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
