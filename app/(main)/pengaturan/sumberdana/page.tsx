"use client";

import React, {useState, useEffect} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Search as SearchIcon,
    Calendar,
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
import {Sumberdana} from "@/types/types";

import CurrencyForm from "@/components/currency/CurrencyForm";
import GlobalPaginationFunction from "@/components/pagination-global";
import {Spinner} from "@/components/ui/spinner";
import {sumberdanaService} from "@/services/sumberdanaservice";
import KategoriForm from "@/components/kategori/KategoriForm";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar as CalendarComponent} from "@/components/ui/calendar";

export default function SumberdanaPage() {
    const [units, setunits] = useState<Sumberdana[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSumberDana, setEditingSumberDana] = useState<Sumberdana | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;

        is_active: boolean;
    }>({
        name: "",

        is_active: true,
    });

    const totalPages = Math.ceil(total / rowsPerPage);

    useEffect(() => {
        loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
    }, [page, rowsPerPage]);

    const loadUnits = async (
        page: number,
        searchTerm: string,
        limit: number,
        fromDate?: Date,
        toDate?: Date
    ) => {
        try {
            setLoading(true);

            const requestParams: any = {
                skip: (page - 1) * limit,
                limit: limit,
                search: searchTerm,
            };

            if (fromDate) {
                requestParams.from_date = format(fromDate, "yyyy-MM-dd");
            }

            if (toDate) {
                requestParams.to_date = format(toDate, "yyyy-MM-dd");
            }

            const response = await sumberdanaService.getAllSumberdanas(requestParams);

            setunits(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            toast.error("Gagal memuat data sumber dana");
        } finally {
            setLoading(false);
        }
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
        loadUnits(1, searchTerm, value, fromDate, toDate);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            loadUnits(newPage, searchTerm, rowsPerPage, fromDate, toDate);
        }
    };

    const handleSubmit = async (data: {
        name: string;

        is_active: boolean;
    }) => {
        try {
            setLoading(true);

            if (editingSumberDana) {
                if (editingSumberDana.id) {
                    const updatedsatuan = await sumberdanaService.updateSumberdana(
                        editingSumberDana.id,
                        {
                            name: data.name,
                            is_active: data.is_active,
                        }
                    );

                    // Reload data to get fresh results from server
                    await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
                }
                toast.success("Sumber dana berhasil diperbarui!");
            } else {
                const newsatuan = await sumberdanaService.createSumberdana({
                    name: data.name,
                    is_active: data.is_active,
                });

                await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
                toast.success("Sumber dana berhasil ditambahkan!");
            }

            setIsDialogOpen(false);
            setEditingSumberDana(null);
            setFormData({name: "", is_active: true});
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(
                editingSumberDana
                    ? "Gagal memperbarui Sumber dana"
                    : "Gagal menambahkan Sumber dana"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (unit: Sumberdana) => {
        setEditingSumberDana(unit);
        if (unit.name) {
            setFormData({
                name: unit.name,
                is_active: unit.is_active,
            });
            setIsDialogOpen(true);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await sumberdanaService.deleteSumberdana(id);
            await loadUnits(page, searchTerm, rowsPerPage, fromDate, toDate);
            toast.success("Sumber dana berhasil dihapus!");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Gagal menghapus Sumber dana");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingSumberDana(null);
        setFormData({name: "", is_active: true});
        setIsDialogOpen(true);
    };

    const handleSearch = async () => {
        setPage(1); // Reset to first page
        await loadUnits(1, searchTerm, rowsPerPage, fromDate, toDate); // Direct API call
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
                        listData={["Pengaturan", "Master Data", "Sumber Dana"]}
                        linkData={["pengaturan", "sumberdana", "sumberdana"]}
                    />
                }
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Sumber Dana
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSumberDana
                                ? "Edit Sumber Dana"
                                : "Tambah Sumber Dana Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSumberDana
                                ? "Perbarui informasi Sumber Dana di bawah ini."
                                : "Masukkan informasi Sumber Dana baru di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>
                    <KategoriForm
                        initialdata={editingSumberDana ? formData : undefined}
                        editing={!!editingSumberDana}
                        onSubmit={handleSubmit}
                        // loading={loading}
                    />
                </DialogContent>
            </Dialog>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative max-w-sm">
                    <Search
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                    <Input
                        placeholder="Cari Sumber Dana..."
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
                    <Spinner/>
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[10%]">ID</TableHead>
                                <TableHead className="w-[30%]">Nama</TableHead>
                                <TableHead className="w-[20%]">Created At</TableHead>
                                <TableHead className="w-[20%]">Status</TableHead>
                                <TableHead className="w-[10%] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        {searchTerm
                                            ? "Tidak ada sumber dana yang ditemukan"
                                            : "Belum ada data sumber dana"}
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
                                            {new Date(category.created_at).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={category.is_active ? "okay" : "secondary"}
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
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (category.id) {
                                                                handleDelete(category.id);
                                                            }
                                                        }}
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
                    <GlobalPaginationFunction
                        page={page}
                        total={total}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        handleRowsPerPageChange={handleRowsPerPageChange}
                        handlePageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}
