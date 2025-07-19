import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

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
interface ProductInterface {
  paginatedProducts: Product[];
  handleDelete: (id: string) => void;
}

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
              <div className="flex-1">
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
