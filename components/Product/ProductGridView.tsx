import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import useProductStore from "@/store/useProductStore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image, { StaticImageData } from "next/image";
import {Product} from "@/app/(main)/item/page";

interface ImageCarouselProps {
  photos: StaticImageData[];
  productName: string;
  intervalMs?: number;
  jumlah: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  photos,
  productName,
  intervalMs = 2000,
  jumlah,
}) => {


  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isHovered || photos.length <= 1) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, photos.length, intervalMs]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (!photos.length) return null;

  return (
    <div
      className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {photos.map((src, idx) => (
          <div key={idx} className="relative flex-shrink-0 w-full h-full">
            <Image
              src={src}
              alt={`${productName} - Image ${idx + 1}`}
              fill
              className="object-cover hover:scale-105 transition-all"
              sizes="(max-width: 768px) 07vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {photos.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? "bg-white shadow-sm"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProductGridView: React.FC<{}> = ({}) => {
  const { getPaginatedProducts, deleteProduct, openDetailDialog,closeDetailDialog } = useProductStore();
const paginatedProducts = getPaginatedProducts();

  return (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 relative">
                <ImageCarousel
                    photos={product.gambar}
                    productName={product.nama}
                    jumlah={product.jumlah}
                />
                <Badge className="text-xs absolute">
                  {product.jumlah} unit tersisa
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-lg line-clamp-2">
                    {product.nama}
                  </CardTitle>
                  <CardDescription className="font-mono text-sm">
                    SKU : {product.SKU}
                  </CardDescription>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="text-lg font-bold text-green-600">
                    Rp {Number(product.harga).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                          onClick={() => {
                            openDetailDialog(product)
                          }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>


  )}
