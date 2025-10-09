import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useState, useEffect, useRef} from "react";

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
import carouselone from "@/public/not-found.png";
import {Badge} from "@/components/ui/badge";
import Image, {StaticImageData} from "next/image";
import {Item, AttachmentResponse} from "@/types/types";
import {formatMoney} from "@/lib/utils";
import AuditDialog from "@/components/AuditDialog";

interface ImageCarouselProps {
    attachments: AttachmentResponse[]; // Changed from photos to attachments
    productName: string;
    intervalMs?: number;
    jumlah: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
                                                                attachments,
                                                                productName,
                                                                intervalMs = 2000,
                                                            }) => {
    // 1. Filter for image attachments and extract URLs
    const imageAttachments = attachments.filter((att) =>
        att.mime_type?.startsWith("image/")
    );

    // 2. Get image URLs (prefer the generated URL, fallback to file_path)
    const imageUrls = imageAttachments
        .map((att) => att.url)
        .filter((url): url is string => typeof url === "string");

    const displayPhotos: (string | StaticImageData)[] =
        imageUrls.length > 0 ? imageUrls : [carouselone];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isHovered || displayPhotos.length <= 1) return;
        intervalRef.current = window.setInterval(() => {
            setCurrentIndex((i) => (i + 1) % displayPhotos.length);
        }, intervalMs);
        return () => {
            if (intervalRef.current != null)
                window.clearInterval(intervalRef.current);
        };
    }, [isHovered, displayPhotos.length, intervalMs]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === displayPhotos.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? displayPhotos.length - 1 : prevIndex - 1
        );
    };

    return (
        <div
            className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="flex h-full w-full transition-transform duration-500 ease-in-out"
                style={{transform: `translateX(-${currentIndex * 100}%)`}}
            >
                {displayPhotos.map((src, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-full h-full">
                        <Image
                            src={src}
                            alt={`${productName} – Image ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-all"
                            sizes="(max-width: 768px) 80vw, (max-width: 1024px) 33vw, 20vw"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation arrows - only show when multiple images and hovered */}
            {displayPhotos.length > 1 && isHovered && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                </>
            )}

            {/* Dots indicator */}
            {displayPhotos.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {displayPhotos.map((_, idx) => (
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

            {/* Image count badge */}
            {/* {imageAttachments.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {imageAttachments.length} foto
        </div>
      )} */}
        </div>
    );
};

export const ProductGridView: React.FC<{
    products?: Item[];
    onEdit?: (item: Item) => void;
    onDelete?: (id: number) => Promise<void>;
    onView?: (product: Item) => void;
}> = ({products, onEdit, onDelete, onView}) => {
    const paginatedProducts = products;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {paginatedProducts?.map((product: Item) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <div className=" relative ">
                        <ImageCarousel
                            attachments={product.attachments}
                            productName={product.name}
                            jumlah={product.total_item}
                        />
                        <Badge
                            className="text-xs absolute top-4 right-4"
                            variant={product.total_item <= product.min_item ? `secondary` : `okay`}
                        >
                            {product.total_item} unit tersisa
                        </Badge>
                    </div>

                    <CardContent className="space-y-2 p-3">
                        <div>
                            <CardTitle className="text-sm line-clamp-2 leading-tight">
                                {product.name}
                            </CardTitle>
                            <CardDescription className=" text-xs">
                                SKU: {product.sku}
                            </CardDescription>
                        </div>

                        <div className="flex w-full justify-between items-center">
                            <p className="text-sm font-bold text-green-600">
                                {formatMoney(Number(product.price))}
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (onView && product) onView(product);
                                        }}
                                    >
                                        <Eye className="mr-2 h-4 w-4"/>
                                        Lihat Detail
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (onEdit && product) onEdit(product);
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                    </DropdownMenuItem>

                                    <AuditDialog id={product.id} type={"ITEM"}/>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (onDelete && product) onDelete(product.id);
                                        }}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4"/> Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
