import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Eye, Edit, Trash2} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {formatMoney, getStockStatus} from "@/lib/utils";
import Image from "next/image";
import carouselone from "@/public/not-found.png";
import {Item, AttachmentResponse} from "@/types/types";
import AuditDialog from "@/components/AuditDialog";
import React from "react";

interface ProductListViewProps {
    products?: Item[];
    onEdit?: (item: Item) => void;
    onDelete?: (id: number) => Promise<void>;
    onView?: (product: Item) => void;
}

export default function ProductListView({
                                            products,
                                            onEdit,
                                            onDelete,
                                            onView,
                                        }: ProductListViewProps) {
    const paginatedProducts = products;

    const getProductImage = (attachments: AttachmentResponse[]) => {
        const imageAttachments = attachments.filter((att) =>
            att.mime_type?.startsWith("image/")
        );

        if (imageAttachments.length === 0) {
            return carouselone;
        }

        const firstImage = imageAttachments[0];
        return firstImage.url;
    };

    return (
        <div className="space-y-2 ">
            {paginatedProducts?.map((product) => {
                const productImage =
                    getProductImage(product.attachments) ?? carouselone;
                console.log("productImage:", productImage);
                return (
                    <Card
                        key={product.id}
                        className="hover:shadow-sm transition-shadow  min-h-[100px]"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                    <Image
                                        src={productImage}
                                        alt={product.name}
                                        width={100}
                                        height={100}
                                        className="w-50 h-50 rounded  flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className={"flex w-full justify-between"}>
                                            <h3 className="font-medium text-base truncate">
                                                {product.name}
                                            </h3>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                                                        <MoreHorizontal className="h-4 w-4"/>
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
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <AuditDialog id={product.id} type={"ITEM"}/>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (onDelete && product) onDelete(product.id);
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <p className="text-sm text-gray-500">SKU : {product.sku}</p>

                                        <div className={"flex w-full justify-between"}>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatMoney(product.price)}
                                                </p>
                                            </div>
                                            <Badge
                                                className="text-sm  mb-1"
                                                variant={product.total_item <= product.min_item ? `secondary` : `okay`}
                                            >
                                                {product.total_item} unit tersisa
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
