import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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

import { Product } from "@/app/(main)/item/page";
import { getStockStatus } from "@/lib/utils";
import Image from "next/image";

interface ProductInterface {
  paginatedProducts: Product[];
  handleDelete: (id: string) => void;
}

interface ImageCarouselProps {
  photos: any[];
  productName: string;
  intervalMs?: number;
}

// Image Carousel Component
const ImageCarousel: React.FC<ImageCarouselProps> = ({
  photos,
  productName,
  intervalMs = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate only when hovered and has multiple photos
  useEffect(() => {
    if (!isHovered || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isHovered, photos.length, intervalMs]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (photos.length === 0) {
    return null;
  }

  if (photos.length <= 1) {
    return (
      <div
        className="relative w-full h-[150px] overflow-hidden rounded group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={photos[0]}
          alt={productName}
          width={200}
          height={150}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[150px] overflow-hidden rounded group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={photos[currentIndex]}
        alt={`${productName} - Image ${currentIndex + 1}`}
        width={200}
        height={150}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isHovered ? "scale-110" : "scale-100"
        }`}
      />
      {/* Navigation arrows */}
      {isHovered && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

export const ProductGridView: React.FC<ProductInterface> = ({
  paginatedProducts,
  handleDelete,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {paginatedProducts.map((product) => {
      const stockStatus = getStockStatus(product.stock);
      return (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 ">
                <div className="mb-3">
                  <ImageCarousel
                    photos={product.photos}
                    productName={product.name}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {product.sku}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Kategori</p>
              <p className="text-sm font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Harga</p>
              <p className="text-lg font-bold text-green-600">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Stok</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {product.stock} {product.unit}
                  </span>
                  <Badge variant={stockStatus.variant} className="text-xs">
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>
              <Badge
                variant={product.status === "active" ? "default" : "secondary"}
              >
                {product.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);
