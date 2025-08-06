"use client";

import React, {useState, useEffect} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2, Search as SearchIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {TOPUnit} from "@/types/types";

import {satuanService} from "@/services/mataUangService";

import CurrencyForm from "@/components/currency/CurrencyForm";

export default function SatuanPage() {
    const [units, setUnits] = useState<TOPUnit[]>([]);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingsatuan, setEditingsatuan] = useState<TOPUnit | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        symbol: string;
        is_active: boolean
    }>({
        name: "",
        symbol: "",
        is_active: true,
    });

    const totalPages = Math.ceil(total / rowsPerPage);

    // Load units on component mount and when page/rowsPerPage changes
    useEffect(() => {
        loadUnits(page, "", rowsPerPage);
    }, [page, rowsPerPage]);

    const loadUnits = async (page: number, searchTerm: string, limit: number) => {
        try {
            setLoading(true);
            const response = await satuanService.getAllMataUang({
                skip: (page - 1) * limit,
                limit: 1000,
                search: searchTerm,
            });

            setUnits(response.data || []);
            setTotal(response.total || 0)
        } catch (error) {
            toast.error("Gagal memuat data satuan");
        } finally {
            setLoading(false);
        }
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleSubmit = async (data: { name: string; symbol: string; is_active: boolean }) => {
        try {
            setLoading(true);

            if (editingsatuan) {
                if (editingsatuan.id) {
                    const updatedsatuan = await satuanService.updateMataUang(
                        editingsatuan.id,
                        {
                            name: data.name,
                            symbol: data.symbol,
                            is_active: data.is_active,

                        }
                    );

                    // Reload data to get fresh results from server
                    await loadUnits(page, searchTerm, rowsPerPage);
                }
                toast.success("Satuan berhasil diperbarui!");
            } else {
                const newsatuan = await satuanService.createMataUang({
                    name: data.name,
                    symbol: data.symbol,
                    is_active: data.is_active,

                });


                await loadUnits(page, searchTerm, rowsPerPage);
                toast.success("Satuan berhasil ditambahkan!");
            }

            setIsDialogOpen(false);
            setEditingsatuan(null);
            setFormData({name: "", symbol: "", is_active: true});

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(editingsatuan ? "Gagal memperbarui satuan" : "Gagal menambahkan satuan");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (unit: TOPUnit) => {
        setEditingsatuan(unit);

        if (unit.symbol) {
            setFormData({
                name: unit.name,
                symbol: unit.symbol,
                is_active: unit.is_active
            });
            setIsDialogOpen(true);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await satuanService.deleteMataUang(id);

            // Reload data to get fresh results from server
            await loadUnits(page, searchTerm, rowsPerPage);
            toast.success("Satuan berhasil dihapus!");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Gagal menghapus satuan");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingsatuan(null);
        setFormData({name: "", symbol: "", is_active: true});
        setIsDialogOpen(true);
    };

    const handleSearch = async () => {
        console.log('Search clicked, searchTerm:', searchTerm); // Debug log
        setPage(1); // Reset to first page
        await loadUnits(1, searchTerm, rowsPerPage); // Direct API call
    };


    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title=""
                leftContent={
                    <CustomBreadcrumb
                        listData={["Pengaturan", "Master Data", "Satuan"]}
                        linkData={["pengaturan", "satuan", "satuan"]}
                    />
                }
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah satuan
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingsatuan ? "Edit satuan" : "Tambah satuan Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingsatuan
                                ? "Perbarui informasi satuan di bawah ini."
                                : "Masukkan informasi satuan baru di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>
                    <CurrencyForm
                        initialdata={editingsatuan ? formData : undefined}
                        editing={!!editingsatuan}
                        onSubmit={handleSubmit}
                        // loading={loading}
                    />
                </DialogContent>
            </Dialog>

            <div className="flex w-full justify-between space-x-2">
                <div className="relative max-w-sm">
                    <Search
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                    <Input
                        placeholder="Cari satuan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="pl-7 w-full"
                    />
                </div>

                <Button onClick={handleSearch} disabled={loading}>
                    <SearchIcon className="mr-2 h-4 w-4"/> Cari
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Memuat data...</div>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[10%]">ID</TableHead>
                            <TableHead className="w-[60%]">Nama</TableHead>
                            <TableHead className="w-[60%]">Symbol</TableHead>
                            <TableHead className="w-[20%]">Status</TableHead>
                            <TableHead className="w-[10%] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Tidak ada satuan yang ditemukan" : "Belum ada data satuan"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            units.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {category.symbol}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                category.is_active
                                                    ? "okay"
                                                    : "secondary"
                                            }
                                        >
                                            {category.is_active ? "Aktif" : "Tidak Aktif"}
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
                                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (category.id) {
                                                            handleDelete(category.id)
                                                        }
                                                    }
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}


        </div>
    );
}