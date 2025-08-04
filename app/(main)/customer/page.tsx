"use client";

import React, {useState, useEffect} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search as SearchIcon,
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

import {
    jenisPembayaranService,
    MataUangListResponse,
    mataUangService,
} from "@/services/mataUangService";
import {TOPUnit, Customer} from "@/types/types";
import GlobalPaginationFunction from "@/components/pagination-global";
import SearchableSelect from "@/components/SearchableSelect";
import {
    CustomerCreate,
    customerService,
    CustomerUpdate,
} from "@/services/customerService";
import {CustomerDetailDialog} from "@/components/customer/CustomerDetailDialog";

export default function CustomerPage() {
    const [Customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    );

    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        address: "",
        currency_id: "",
        top_id: "",
        is_active: true,
    });

    // Load initial data
    useEffect(() => {
        loadCustomers();
    }, [currentPage, rowsPerPage, filterStatus]);

    const handleSearch = async () => {
        setCurrentPage(1);
        await loadCustomers();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setCurrentPage(1);
    };

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const filters = {
                page: currentPage,
                rowsPerPage,
                ...(searchTerm && {search_key: searchTerm}),
                ...(filterStatus !== "all" && {is_active: filterStatus === "active"}),
            };

            const response = await customerService.getAllCustomers(filters);
            console.log(response);
            setCustomers(response.data);
            setTotalCount(response.total);
        } catch (error) {
            console.error("Error loading Customers:", error);
            toast.error("Gagal memuat data Customer");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: "",
            name: "",
            address: "",
            currency_id: "",
            top_id: "",
            is_active: true,
        });
    };

    const generateCustomerId = () => {
        return `CUS-${Date.now() % 1000}-${Math.floor(Math.random() * 10)}`;
    };

    const openAddDialog = () => {
        setDialogMode("add");
        resetForm();
        setFormData((prev) => ({...prev, id: generateCustomerId()}));
        setIsDialogOpen(true);
    };

    const openEditDialog = (Customer: Customer) => {
        setDialogMode("edit");
        setEditingCustomer(Customer);
        setFormData({
            id: Customer.id,
            name: Customer.name,
            address: Customer.address,
            currency_id: Customer?.curr_rel?.id?.toString() || "",
            top_id: Customer?.top_rel?.id?.toString() || "",
            is_active: Customer.is_active,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCustomer(null);
        resetForm();
    };

    const openDetailDialog = (Customer: Customer) => {
        setSelectedCustomer(Customer);
        setDetailDialogOpen(true);
    };

    const closeDetailDialog = () => {
        setSelectedCustomer(null);
        setDetailDialogOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.address.trim() ||
            !formData.currency_id ||
            !formData.top_id
        ) {
            toast.error("Semua field wajib diisi");
            return;
        }

        try {
            setLoading(true);

            if (dialogMode === "add") {
                const newCustomerData: CustomerCreate = {
                    id: formData.id,
                    name: formData.name,
                    address: formData.address,
                    currency_id: parseInt(formData.currency_id),
                    top_id: parseInt(formData.top_id),
                    is_active: formData.is_active,
                };

                await customerService.createCustomer(newCustomerData);
                toast.success("Customer berhasil ditambahkan!");
            } else if (editingCustomer) {
                const updateData: CustomerUpdate = {
                    id: formData.id,
                    name: formData.name,
                    address: formData.address,
                    currency_id: parseInt(formData.currency_id),
                    top_id: parseInt(formData.top_id),
                    is_active: formData.is_active,
                };

                await customerService.updateCustomer(editingCustomer.id, updateData);
                toast.success("Customer berhasil diperbarui!");
            }

            closeDialog();
            loadCustomers();
        } catch (error: any) {
            console.error("Error saving Customer:", error);
            toast.error(error.detail || "Gagal menyimpan Customer");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await customerService.deleteCustomer(id);
            toast.success("Customer berhasil dihapus!");
            loadCustomers();
        } catch (error: any) {
            console.error("Error deleting Customer:", error);
            toast.error(error.detail || "Gagal menghapus Customer");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof typeof formData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Customer"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Button size="sm" onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Customer
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            <div className="flex space-x-2">
                <div className="flex w-full  space-x-2">
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
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Nama Customer</TableHead>
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
                    ) : Customers.length > 0 ? (
                        Customers.map((Customer) => (
                            <TableRow key={Customer.id}>
                                <TableCell>
                                    <span className="font-mono text-sm">{Customer.id}</span>
                                </TableCell>
                                <TableCell className="font-medium">{Customer.name}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {Customer.address}
                                </TableCell>
                                <TableCell>{Customer.curr_rel?.symbol || "-"}</TableCell>
                                <TableCell>{Customer.top_rel?.symbol || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={Customer.is_active ? "okay" : "secondary"}>
                                        {Customer.is_active ? "Aktif" : "Tidak Aktif"}
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
                                                onClick={() => openDetailDialog(Customer)}
                                            >
                                                <Eye className="mr-2 h-4 w-4"/>
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openEditDialog(Customer)}
                                            >
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(Customer.id)}
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
                                Tidak ada Customer yang ditemukan
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
                            {dialogMode === "add" ? "Tambah Customer Baru" : "Edit Customer"}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === "add"
                                ? "Masukkan informasi Customer baru di bawah ini."
                                : "Perbarui informasi Customer di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="id">ID Customer</Label>
                                <Input
                                    id="id"
                                    value={formData.id}
                                    onChange={(e) => handleInputChange("id", e.target.value)}
                                    placeholder="VEN-001"
                                    disabled={dialogMode === "edit"}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.is_active ? "active" : "inactive"}
                                    onValueChange={(value) =>
                                        handleInputChange("is_active", value === "active")
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

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Customer</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nama Customer"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SearchableSelect<TOPUnit>
                                label="Mata Uang"
                                placeholder="Pilih mata uang"
                                value={formData.currency_id}
                                onChange={(val) => handleInputChange("currency_id", val)}
                                fetchData={(search) =>
                                    mataUangService.getAllMataUang({skip: 0, limit: 5, search})
                                }
                                renderLabel={(item) => `${item.symbol} - ${item.name}`}
                            />

                            <SearchableSelect<TOPUnit>
                                label="Jenis Pembayaran"
                                placeholder="Pilih jenis pembayaran"
                                value={formData.top_id}
                                onChange={(val) => handleInputChange("top_id", val)}
                                fetchData={(search) =>
                                    jenisPembayaranService.getAllMataUang({
                                        skip: 0,
                                        limit: 5,
                                        search,
                                    })
                                }
                                renderLabel={(item) => `${item.symbol} - ${item.name}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="Masukkan alamat lengkap Customer"
                                rows={3}
                                required
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading
                                    ? "Loading..."
                                    : dialogMode === "add"
                                        ? "Tambah Customer"
                                        : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {selectedCustomer && (
                <CustomerDetailDialog
                    isOpen={detailDialogOpen}
                    onClose={closeDetailDialog}
                    customer={selectedCustomer}
                />
            )}
        </div>
    );
}
