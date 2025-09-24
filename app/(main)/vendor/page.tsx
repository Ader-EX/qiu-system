"use client";

import React, {useState, useEffect, useCallback, useMemo} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search as SearchIcon, Newspaper,
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
import {Badge} from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import toast from "react-hot-toast";
import {VendorDetailDialog} from "@/components/vendor/VendorDetailDialog";
import {
    vendorService,
    VendorCreate,
    VendorUpdate,
} from "@/services/vendorService";
import {
    jenisPembayaranService,
    MataUangListResponse,
    mataUangService,
} from "@/services/mataUangService";
import {TOPUnit, Vendor} from "@/types/types";
import GlobalPaginationFunction from "@/components/pagination-global";
import SearchableSelect from "@/components/SearchableSelect";
import {QuickFormSearchableField} from "@/components/form/FormSearchableField";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import AuditDialog from "@/components/AuditDialog";

export default function VendorPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const vendorFormSchema = z.object({
        name: z.string().min(1, "Nama vendor wajib diisi"),
        address: z.string().min(1, "Alamat wajib diisi"),
        currency_id: z.coerce.number({
            required_error: "Mata uang wajib dipilih",
            invalid_type_error: "Mata uang wajib dipilih",
        }).min(1, "Mata uang wajib dipilih"),
        top_id: z.number({
            required_error: "Jenis pembayaran wajib dipilih",
            invalid_type_error: "Jenis pembayaran wajib dipilih",
        }).min(1),
        is_active: z.boolean(),
    });

    type VendorFormData = z.infer<typeof vendorFormSchema>;
    const form = useForm<VendorFormData>({
        resolver: zodResolver(vendorFormSchema),
        defaultValues: {
            name: "",
            address: "",
            currency_id: 0,
            top_id: 0,
            is_active: true,
        },
    });

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        address: "",
        currency_id: "",
        top_id: "",
        is_active: true,
    });

    useEffect(() => {
        loadVendors();
    }, [currentPage, rowsPerPage, filterStatus]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setCurrentPage(1);
    };

    const loadVendors = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                page: currentPage,
                rowsPerPage,
                ...(searchTerm && {search_key: searchTerm}),
                ...(filterStatus !== "all" && {is_active: filterStatus === "active"}),
            };

            const response = await vendorService.getAllVendors(filters);
            console.log(response);
            setVendors(response.data);
            setTotalCount(response.total);
        } catch (error) {
            console.error("Error loading vendors:", error);
            toast.error("Gagal memuat data vendor");
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, filterStatus, searchTerm]);
    const resetForm = () => {
        form.reset({
            name: "",
            address: "",
            currency_id: 0,
            top_id: 0,
            is_active: true,
        });
    };

    useEffect(() => {
        loadVendors();
    }, [loadVendors]);

    const handleSearch = useCallback(async () => {
        console.log("Search clicked, searchTerm:", searchTerm);
        setCurrentPage(1);
        await loadVendors();
    }, [searchTerm, loadVendors]);

    const openAddDialog = useCallback(() => {
        setDialogMode("add");
        resetForm();
        setIsDialogOpen(true);
    }, []);

    const openEditDialog = (vendor: Vendor) => {
        setDialogMode("edit");
        setEditingVendor(vendor);
        form.reset({
            name: vendor.name,
            address: vendor.address,
            currency_id: vendor?.curr_rel?.id || undefined,
            top_id: vendor?.top_rel?.id || undefined,
            is_active: vendor.is_active,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingVendor(null);
        resetForm();
    };

    const openDetailDialog = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setDetailDialogOpen(true);
    };

    const closeDetailDialog = () => {
        setSelectedVendor(null);
        setDetailDialogOpen(false);
    };

    const handleSubmit = async (data: VendorFormData) => {
        try {
            setLoading(true);

            if (dialogMode === "add") {
                const newVendorData: VendorCreate = {
                    name: data.name,
                    address: data.address,
                    currency_id: data.currency_id,
                    top_id: data.top_id,
                    is_active: data.is_active,
                };

                await vendorService.createVendor(newVendorData);
                toast.success("Vendor berhasil ditambahkan!");
            } else if (editingVendor) {
                const updateData: VendorUpdate = {
                    id: editingVendor.id,
                    name: data.name,
                    address: data.address,
                    currency_id: data.currency_id,
                    top_id: data.top_id,
                    is_active: data.is_active,
                };

                await vendorService.updateVendor(editingVendor.id, updateData);
                toast.success("Vendor berhasil diperbarui!");
            }

            closeDialog();
            loadVendors();
        } catch (error: any) {
            console.error("Error saving vendor:", error);
            toast.error(error.message || "Gagal menyimpan vendor");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await vendorService.deleteVendor(id);
            toast.success("Vendor berhasil dihapus!");
            loadVendors();
        } catch (error: any) {
            console.error("Error deleting vendor:", error);
            toast.error(error.message || "Gagal menghapus vendor");
        } finally {
            setLoading(false);
        }
    };

    // Stable callback for form input changes
    const handleInputChange = useCallback(
        (field: keyof typeof formData, value: string | boolean) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );


    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Vendor"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Vendor
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <div className="flex space-x-2">
                <div className="flex w-full space-x-2">
                    <div className="relative max-w-sm">
                        <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Cari Vendor..."
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
                <Select
                    value={filterStatus}
                    onValueChange={(value) => {
                        setFilterStatus(value);
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor ID</TableHead>
                        <TableHead>Nama Vendor</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Mata Uang</TableHead>
                        <TableHead>Jenis Pembayaran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : vendors.length > 0 ? (
                        vendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                                <TableCell>
                                    <span className="font-mono text-sm">{vendor.id}</span>
                                </TableCell>
                                <TableCell className="font-medium">{vendor.name}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {vendor.address}
                                </TableCell>
                                <TableCell>{vendor.curr_rel?.symbol || "-"}</TableCell>
                                <TableCell>{vendor.top_rel?.symbol || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={vendor.is_active ? "okay" : "secondary"}>
                                        {vendor.is_active ? "Aktif" : "Tidak Aktif"}
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
                                                onClick={() => openDetailDialog(vendor)}
                                            >
                                                <Eye className="mr-2 h-4 w-4"/>
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Edit
                                            </DropdownMenuItem>
                                            <AuditDialog id={vendor.id} type={"VENDOR"}/>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(vendor.id)}
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
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center py-8 text-muted-foreground"
                            >
                                Tidak ada vendor yang ditemukan
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <GlobalPaginationFunction
                page={currentPage}
                total={totalCount}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                handleRowsPerPageChange={handleRowsPerPageChange}
                handlePageChange={setCurrentPage}
            />

            <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === "add" ? "Tambah Vendor Baru" : "Edit Vendor"}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === "add"
                                ? "Masukkan informasi vendor baru di bawah ini."
                                : "Perbarui informasi vendor di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Vendor</Label>
                                    <Input
                                        id="name"
                                        {...form.register("name")}
                                        placeholder="Nama vendor"
                                        required
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={form.watch("is_active") ? "active" : "inactive"}
                                        onValueChange={(value) =>
                                            form.setValue("is_active", value === "active")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <QuickFormSearchableField
                                    control={form.control}
                                    name="currency_id"
                                    type="currency"
                                    label="Mata Uang"
                                    placeholder="Pilih Mata Uang"
                                />

                                <QuickFormSearchableField
                                    control={form.control}
                                    name="top_id"
                                    type="payment_type"
                                    label="Jenis Pembayaran"
                                    placeholder="Pilih Jenis Pembayaran"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    {...form.register("address")}
                                    placeholder="Masukkan alamat lengkap vendor"
                                    rows={3}
                                    required
                                />
                                {form.formState.errors.address && (
                                    <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={closeDialog}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading
                                        ? "Loading..."
                                        : dialogMode === "add"
                                            ? "Tambah Vendor"
                                            : "Simpan Perubahan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {selectedVendor && (
                <VendorDetailDialog
                    isOpen={detailDialogOpen}
                    onCloseAction={closeDetailDialog}
                    vendor={selectedVendor}
                />
            )}
        </div>
    );
}
