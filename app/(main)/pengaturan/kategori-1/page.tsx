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
    Card,
    CardContent,
    CardHeader,
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
import {Unit} from "@/types/types";
import KategoriForm from "@/components/kategori/KategoriForm";
import {kategoriService} from "@/services/kategoriService";
import Cookies from "js-cookie";
import GlobalPaginationFunction from "@/components/pagination-global";

export default function Kategori1Page() {
    const [categories, setCategories] = useState<Unit[]>([]);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        is_active: boolean
    }>({
        name: "",
        is_active: true,
    });

    const totalPages = Math.ceil(total / rowsPerPage);

    // Load categories on component mount and when page/rowsPerPage changes
    useEffect(() => {
        loadCategories(page, "", rowsPerPage);
    }, [page, rowsPerPage]);

    // Remove client-side filtering since server handles it
    // const filteredCategories = categories?.filter((cat) =>
    //     cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const loadCategories = async (page: number, searchTerm: string, limit: number) => {
        try {
            console.log('Loading categories with:', {page, searchTerm, limit}); // Debug log
            setLoading(true);
            const response = await kategoriService.getAllCategories({
                skip: (page - 1) * limit,
                limit: limit,
                search: searchTerm,
                type: 1
            });

            console.log('API response:', response); // Debug log
            setCategories(response.data || []);
            setTotal(response.total || 0)
        } catch (error) {
            console.error("Error loading categories:", error);
            toast.error("Gagal memuat data kategori");
        } finally {
            setLoading(false);
        }
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleSubmit = async (data: { name: string; is_active: boolean }) => {
        try {
            setLoading(true);

            if (editingCategory) {
                if (editingCategory.id) {
                    const updatedCategory = await kategoriService.updateCategory(
                        editingCategory.id,
                        {
                            name: data.name,
                            is_active: data.is_active,
                            category_type: 1
                        }
                    );

                    // Reload data to get fresh results from server
                    await loadCategories(page, searchTerm, rowsPerPage);
                }
                toast.success("Kategori berhasil diperbarui!");
            } else {
                const newCategory = await kategoriService.createCategory({
                    name: data.name,
                    is_active: data.is_active,
                    category_type: 1
                });

                // Reload data to get fresh results from server
                await loadCategories(page, searchTerm, rowsPerPage);
                toast.success("Kategori berhasil ditambahkan!");
            }

            setIsDialogOpen(false);
            setEditingCategory(null);
            setFormData({name: "", is_active: true});

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(editingCategory ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Unit) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            is_active: category.is_active
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await kategoriService.deleteCategory(id);

            // Reload data to get fresh results from server
            await loadCategories(page, searchTerm, rowsPerPage);
            toast.success("Kategori berhasil dihapus!");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Gagal menghapus kategori");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingCategory(null);
        setFormData({name: "", is_active: true});
        setIsDialogOpen(true);
    };

    const handleSearch = async () => {
        console.log('Search clicked, searchTerm:', searchTerm); // Debug log
        setPage(1); // Reset to first page
        await loadCategories(1, searchTerm, rowsPerPage); // Direct API call
    };

    // Handle Enter key in search input
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
                        listData={["Pengaturan", "Master Data", "Kategori 1"]}
                        linkData={["pengaturan", "kategori-1", "kategori-1"]}
                    />
                }
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Kategori
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "Perbarui informasi kategori di bawah ini."
                                : "Masukkan informasi kategori baru di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>
                    <KategoriForm
                        initialdata={editingCategory ? formData : undefined}
                        editing={!!editingCategory}
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
                        placeholder="Cari kategori..."
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
                            <TableHead className="w-[20%]">Status</TableHead>
                            <TableHead className="w-[10%] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Tidak ada kategori yang ditemukan" : "Belum ada data kategori"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {category.name}
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

            <GlobalPaginationFunction
                page={page}
                total={total}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                handleRowsPerPageChange={handleRowsPerPageChange}
                handlePageChange={handlePageChange}
            />
        </div>
    );
}