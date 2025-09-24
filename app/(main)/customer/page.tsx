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
import Link from "next/link";
import AuditDialog from "@/components/AuditDialog";

export default function CustomerPage() {
    const [Customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const [formData, setFormData] = useState({

        name: "",
        address: "",
        currency_id: "",

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

            name: "",
            address: "",
            currency_id: "",

            is_active: true,
        });
    };

    const generateCustomerId = () => {
        return `CUS-${Date.now() % 1000}-${Math.floor(Math.random() * 10)}`;
    };


    const handleDelete = async (id: number) => {
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


    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Customer"
                rightContent={
                    <HeaderActions.ActionGroup>
                        <Link href={`/customer/add`} className={"flex gap-x-2"}>
                            <Button size="sm" disabled={loading}>
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Customer
                            </Button>
                        </Link>
                    </HeaderActions.ActionGroup>
                }
            />

            <div className="flex space-x-2">
                <div className="flex w-full  space-x-2">
                    <div className="relative max-w-sm">
                        <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Cari customer..."
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
                        <TableHead>Customer Code</TableHead>
                        <TableHead>Nama Customer</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Mata Uang</TableHead>

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
                        Customers.map((cust) => (
                            <TableRow key={cust.id}>
                                <TableCell>
                                    <span className="font-mono text-sm">{cust.code}</span>
                                </TableCell>
                                <TableCell className="font-medium">{cust.name}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {cust.address}
                                </TableCell>
                                <TableCell>{cust.curr_rel?.symbol || "-"}</TableCell>

                                <TableCell>
                                    <Badge variant={cust.is_active ? "okay" : "secondary"}>
                                        {cust.is_active ? "Aktif" : "Tidak Aktif"}
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
                                            <DropdownMenuItem>
                                                <Link
                                                    href={`/customer/${cust.id}/view`}
                                                    className={"flex gap-x-2"}
                                                >
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Lihat Detail
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Link
                                                    href={`/customer/${cust.id}/edit`}
                                                    className={"flex gap-x-2"}
                                                >
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <AuditDialog id={cust.id} type={"CUSTOMER"}/>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(cust.id)}
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
        </div>
    );
}
