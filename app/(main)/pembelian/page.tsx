"use client";

import {useState} from "react";
import {Plus, Search, MoreHorizontal, Edit, Trash2, Eye} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {Badge} from "@/components/ui/badge";
import {AlertSuccess} from "@/components/alert-success";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

interface Purchase {
    id: string;
    purchaseNumber: string;
    vendor: string;
    date: string;
    total: number;
    status: "pending" | "completed" | "cancelled";
    paymentStatus: "unpaid" | "partial" | "paid";
    createdAt: string;
}

const initialPurchases: Purchase[] = [
    {
        id: "1",
        purchaseNumber: "PO-001",
        vendor: "PT. Supplier Utama",
        date: "2024-01-15",
        total: 75000000,
        is_active: "completed",
        paymentStatus: "paid",
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        purchaseNumber: "PO-002",
        vendor: "CV. Distributor Jaya",
        date: "2024-01-16",
        total: 45000000,
        is_active: "pending",
        paymentStatus: "unpaid",
        createdAt: "2024-01-16",
    },
    {
        id: "3",
        purchaseNumber: "PO-003",
        vendor: "UD. Grosir Murah",
        date: "2024-01-17",
        total: 25000000,
        is_active: "completed",
        paymentStatus: "partial",
        createdAt: "2024-01-17",
    },
];

export default function PembelianPage() {
    const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const filteredPurchases = purchases.filter(
        (purchase) =>
            purchase.purchaseNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        setPurchases(purchases.filter((purchase) => purchase.id !== id));
        setAlertMessage("Pembelian berhasil dihapus!");
        setShowAlert(true);
    };

    const getStatusBadge = (status: Purchase["status"]) => {
        switch (status) {
            case "completed":
                return <Badge variant="default">Selesai</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Dibatalkan</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: Purchase["paymentStatus"]) => {
        switch (status) {
            case "paid":
                return (
                    <Badge variant="default" className="bg-green-500">
                        Lunas
                    </Badge>
                );
            case "partial":
                return (
                    <Badge variant="secondary" className="bg-yellow-500">
                        Sebagian
                    </Badge>
                );
            case "unpaid":
                return <Badge variant="destructive">Belum Bayar</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {showAlert && (
                <AlertSuccess
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />
            )}

            <SidebarHeaderBar
                title="Pembelian"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Pembelian
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pembelian</CardTitle>
                    <CardDescription>
                        Kelola transaksi pembelian dari vendor dan supplier.
                    </CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari pembelian..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pembelian</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pembayaran</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPurchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell className="font-medium">
                                        <span className="font-mono">{purchase.purchaseNumber}</span>
                                    </TableCell>
                                    <TableCell>{purchase.vendor}</TableCell>
                                    <TableCell>{purchase.date}</TableCell>
                                    <TableCell>Rp {purchase.total.toLocaleString()}</TableCell>
                                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                                    <TableCell>
                                        {getPaymentStatusBadge(purchase.paymentStatus)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/pembelian/${purchase.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(purchase.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
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
        </div>
    );
}
