import useProductStore from "@/store/useProductStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductTableView() {
    const {
        getPaginatedProducts,
        openDetailDialog,
        openEditDialog,
        deleteProduct
    } = useProductStore();

    const paginatedProducts = getPaginatedProducts();

    return (
        <Card>
            <CardContent className="p-0 min-w-[900px]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Item ID</TableHead>
                            <TableHead className="font-semibold">Item</TableHead>
                            <TableHead className="font-semibold">Jumlah</TableHead>
                            <TableHead className="font-semibold">Unit</TableHead>
                            <TableHead className="font-semibold">Satuan</TableHead>
                            <TableHead className="font-semibold">Harga Jual (Rp)</TableHead>
                            <TableHead className="font-semibold">Vendor</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{product.id}</TableCell>
                                <TableCell className="font-medium">{product.nama}</TableCell>
                                <TableCell>{product.jumlah}</TableCell>
                                <TableCell>{product.satuan}</TableCell>
                                <TableCell>{product.satuan}</TableCell>
                                <TableCell className="font-semibold">{product.harga}</TableCell>
                                <TableCell>{product.vendor || "PT. Aksa Prima Jaya"}</TableCell>
                                <TableCell>
                                    {product.jumlah <= 50 ? (
                                        <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs">
                                            Tidak Aktif
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs">
                                            Aktif
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}