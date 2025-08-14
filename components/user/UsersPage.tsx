"use client";

import React, {useState, useEffect} from "react";
import {
    Plus,
    Search as SearchIcon,
    MoreHorizontal,
    Edit,
    Trash2,
    Loader2,
    Search,
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";


import toast from "react-hot-toast";

import GlobalPaginationFunction from "@/components/pagination-global";
import {UserIn, UserOut, userService} from "@/services/userService";
import UserMgmtForm from "@/components/user/UserMgmtForm";

export default function UsersPage() {
    const [users, setUsers] = useState<UserIn[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editing, setEditing] = useState<UserIn | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const totalPages = Math.ceil(total / rowsPerPage);


    const fetchUsers = async (
        pageNumber: number,
        query: string,
        limit: number
    ) => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers({
                skip: (pageNumber - 1) * limit,
                limit,
                search_key: query,
            });

            setUsers(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data warehouse");
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers(page, searchTerm, rowsPerPage);
    }, [page, rowsPerPage]);

    const handleSearch = () => {
        setPage(1);
        fetchUsers(1, searchTerm, rowsPerPage);
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
    const openEdit = (w: UserIn) => {
        setEditing(w);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await userService.deleteUser(id);
            await fetchUsers(page, searchTerm, rowsPerPage);
            toast.success("User berhasil dihapus!");
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus user");
        }
    };

    const handleSubmit = async (data: UserOut) => {
        setSubmitting(true);
        try {
            if (editing) {
                await userService.updateUser(editing.id, data);
                toast.success("User berhasil diperbarui!");
            } else {
                await userService.createUser(data);
                toast.success("User berhasil ditambahkan!");
            }
            setIsDialogOpen(false);
            setEditing(null);
            await fetchUsers(page, searchTerm, rowsPerPage);
        } catch (error) {
            console.error(error);
            toast.error(
                editing ? "Gagal memperbarui data User" : "Gagal menambahkan data user"
            );
        } finally {
            setSubmitting(false);
        }
    };
    const convertToRole = (role: number) => {
        switch (role) {
            case 0:
                return "Owner";
            case 1:
                return "Manager";
            case 2:
                return "Staff";
            default:
                return "Unknown";
        }
    }

    return (
        <div className="flex w-full flex-1">
            <div className="flex flex-1 flex-col space-y-6">
                <SidebarHeaderBar
                    showToggle={false}
                    title=""
                    leftContent={
                        <div className="flex w-full justify-between space-x-2">
                            <div className="relative max-w-sm">
                                <Search
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                <Input
                                    placeholder="Cari user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-7 w-full"
                                />
                            </div>

                            <Button onClick={handleSearch} disabled={loading}>
                                <SearchIcon className="mr-2 h-4 w-4"/> Cari
                            </Button>
                        </div>

                    }
                    rightContent={
                        <HeaderActions.ActionGroup>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setIsDialogOpen(true)}
                                        disabled={submitting}
                                    >
                                        <Plus className="mr-2 h-4 w-4"/> Tambah User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editing ? "Edit Warehouse" : "Tambah Warehouse Baru"}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <UserMgmtForm
                                        onSubmit={(d: UserOut) =>
                                            handleSubmit({
                                                username: d.username,
                                                role: d.role,
                                                password: d.password,
                                                is_active: d.is_active,
                                            })
                                        }
                                        editing={!!editing}
                                        initialData={editing ?? undefined}
                                    />
                                </DialogContent>
                            </Dialog>
                        </HeaderActions.ActionGroup>
                    }
                />

                {/* Search Bar with Button */}

                {/* Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Login Terakhir</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="animate-spin mx-auto h-6 w-6"/>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    {searchTerm
                                        ? "Tidak ada user yang sesuai dengan pencarian"
                                        : "Belum ada data user"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((w: UserIn) => (
                                <TableRow key={w.id}>
                                    <TableCell>{w.id}</TableCell>
                                    <TableCell className="font-medium break-words">
                                        {w.username}
                                    </TableCell>
                                    <TableCell className="">
                                        {convertToRole(w.role)}
                                    </TableCell>
                                    <TableCell className="">
                                        {w.last_login
                                            ? new Date(w.last_login).toLocaleString()
                                            : "Belum pernah login"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={w.is_active ? "okay" : "secondary"}>
                                            {w.is_active ? "Aktif" : "Tidak Aktif"}
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
                                                    onClick={() => openEdit(w)}
                                                    disabled={submitting}
                                                >
                                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(w.id)}
                                                    className="text-red-600"
                                                    disabled={submitting}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/> Hapus
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
            </div>
        </div>
    );
}
