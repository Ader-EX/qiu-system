import useProductStore from "@/store/useProductStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStockStatus } from "@/lib/utils";
import Image from "next/image";
import carouselone from "@/public/carouselone.jpg";

export default function ProductListView() {
    const {
        getPaginatedProducts,
        openDetailDialog,
        openEditDialog,
        deleteProduct
    } = useProductStore();

    const paginatedProducts = getPaginatedProducts();

    return (
        <div className="space-y-2 min-w-[900px]">
            {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.jumlah);
                return (
                    <Card key={product.id} className="hover:shadow-sm transition-shadow min-w-[900px]">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                    <Image
                                        src={product.gambar[0] || carouselone}
                                        alt=""
                                        width={44}
                                        height={44}
                                        className="w-12 h-12 rounded flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-base truncate">
                                            {product.nama}
                                        </h3>
                                        <div className="flex items-center space-x-4 mt-1">
                                            <p className="text-sm text-gray-500">
                                                SKU : {product.SKU}
                                            </p>
                                            <p className="text-sm font-semibold text-green-600">
                                                Rp {product.harga}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm text-gray-600 mb-1">
                                            {product.jumlah} {product.satuan} tersisa
                                        </div>
                                        <Badge variant={stockStatus.variant} className="text-xs">
                                            {stockStatus.label}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openDetailDialog(product)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Lihat Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}