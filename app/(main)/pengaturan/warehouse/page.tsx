"use client";

import React, {useState, useMemo} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    MapPin,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {Warehouse} from "@/types/types";


import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import WarehouseForm from "@/components/warehouse/WarehouseForm";


const initialWarehouses: Warehouse[] = [
    {
        id: "1",
        name: "Jakarta Pusat",
        address: "Jl. Sudirman No. 123",
        isActive: true,
    },
    {id: "2", name: "Surabaya", address: "Jl. Pemuda No. 456", isActive: true},
    {
        id: "3",
        name: "Bandung",
        address: "Jl. Asia Afrika No. 789",
        isActive: false,
    },
    // ...additional items for pagination example
    {id: "4", name: "Medan", address: "Jl. Merdeka No. 10", isActive: true},
    {id: "5", name: "Semarang", address: "Jl. Pemuda No. 22", isActive: true},
    {
        id: "6",
        name: "Makassar",
        address: "Jl. Sam Ratulangi No. 5",
        isActive: false,
    },
    {
        id: "7",
        name: "Denpasar",
        address: "Jl. Gatot Subroto No. 50",
        isActive: true,
    },
];

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Warehouse | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        address: string;
        isActive: boolean;
    }>({
        name: "",
        address: "",
        isActive: true,
    });
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const filtered = useMemo(
        () =>
            warehouses.filter(
                (w) =>
                    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    w.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (w.isActive ? "aktif" : "tidak aktif").includes(
                        searchTerm.toLowerCase()
                    )
            ),
        [warehouses, searchTerm]
    );

    const pageCount = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const openEdit = (w: Warehouse) => {
        setEditing(w);
        setFormData({name: w.name, address: w.address, isActive: w.isActive});
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setWarehouses(warehouses.filter((w) => w.id !== id));
        toast.success("Warehouse berhasil dihapus!");
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title=""
                leftContent={
                    <CustomBreadcrumb
                        listData={["Pengaturan", "Master Data", "Warehouse"]}
                        linkData={["pengaturan", "warehouse", "warehouse"]}
                    />
                }
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => {
                                        setEditing(null);
                                        setFormData({name: "", address: "", isActive: true});
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4"/> Tambah Warehouse
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editing ? "Edit Warehouse" : "Tambah Warehouse Baru"}
                                    </DialogTitle>
                                </DialogHeader>
                                <WarehouseForm onSubmit={(data) => {
                                    if (editing) {
                                        setWarehouses(
                                            warehouses.map((w) => (w.id === editing.id ? {...w, ...data} : w))
                                        );
                                        toast.success("Warehouse berhasil diperbarui!");
                                    } else {
                                        const newWh: Warehouse = {
                                            id: Date.now().toString().slice(-4),
                                            ...data,
                                        };
                                        setWarehouses([...warehouses, newWh]);
                                        toast.success("Warehouse berhasil ditambahkan!");
                                    }
                                    setIsDialogOpen(false);
                                    setEditing(null);
                                    setFormData({name: "", address: "", isActive: true});
                                }}
                                               editing={!!editing}
                                               initialData={editing ? formData : undefined}/>
                            </DialogContent>
                        </Dialog>
                    </HeaderActions.ActionGroup>
                }
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2 pt-2">
                        <Search className="h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari warehouse..."
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
                                <TableHead className="">ID</TableHead>
                                <TableHead className="">Nama</TableHead>
                                <TableHead className="">Alamat</TableHead>
                                <TableHead className=" text-right">Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.map((w) => (
                                <TableRow key={w.id}>
                                    <TableCell className="">{w.id}</TableCell>
                                    <TableCell className=" font-medium break-words">
                                        {w.name}
                                    </TableCell>
                                    <TableCell className=" max-w-[200px] break-words flex items-center gap-1">
                                      
                                        {w.address}
                                    </TableCell>
                                    <TableCell className=" text-right">
                                        <Badge variant={w.isActive ? "okay" : "destructive"}>
                                            {w.isActive ? "Aktif" : "Tidak Aktif"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(w)}>
                                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(w.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="">
                        <Pagination className="flex w-full justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        aria-disabled={page === 1}
                                        className={
                                            page === 1 ? "pointer-events-none opacity-50" : ""
                                        }
                                    />
                                </PaginationItem>
                                {Array.from({length: pageCount}, (_, i) => i + 1).map((p) => (
                                    <PaginationItem key={p}>
                                        <PaginationLink onClick={() => setPage(p)}>
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => {
                                            if (page < pageCount) {
                                                setPage((prev) => Math.min(prev + 1, pageCount));
                                            }
                                        }}
                                        aria-disabled={page === pageCount}
                                        className={
                                            page === pageCount ? "pointer-events-none opacity-50" : ""
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
