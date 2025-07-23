"use client";

import React, {useState} from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Upload,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {AlertSuccess} from "@/components/alert-success";
import {Badge} from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {Category} from "@/types/types";
import KategoriForm from "@/components/kategori/KategoriForm";


const initialCategories: Category[] = [
    {id: "1", name: "Elektronik", status: true},
    {id: "2", name: "Fashion", status: false},
    {id: "3", name: "Makanan", status: true},
];

export default function Kategori1Page() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<{ name: string; status: boolean }>({
        name: "",
        status: true,
    });


    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            setCategories(
                categories.map((cat) =>
                    cat.id === editingCategory.id
                        ? {
                            ...cat,
                            name: formData.name,
                            status: formData.status,
                        }
                        : cat
                )
            );
            toast.success("Kategori berhasil diperbarui!");
        } else {
            const newCategory: Category = {
                id: Date.now().toString(),
                name: formData.name,
                status: formData.status,
            };
            setCategories([...categories, newCategory]);
            toast.success("Kategori berhasil ditambahkan!");
        }
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({name: "", status: true});

    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({name: category.name, status: category.status});
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setCategories(categories.filter((cat) => cat.id !== id));
        toast.success("Kategori berhasil dihapus!");


    };

    const openAddDialog = () => {
        setEditingCategory(null);
        setFormData({name: "", status: true});
        setIsDialogOpen(true);
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
                        <Button size="sm" onClick={openAddDialog}>
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
                    <KategoriForm initialdata={editingCategory ? formData : undefined} editing={!!editingCategory}
                                  onSubmit={(data) => {

                                      if (editingCategory) {
                                          setCategories(
                                              categories.map((cat) =>
                                                  cat.id === editingCategory.id
                                                      ? {
                                                          ...cat,
                                                          name: formData.name,
                                                          status: formData.status,
                                                      }
                                                      : cat
                                              )
                                          );
                                          toast.success("Kategori berhasil diperbarui!");
                                      } else {
                                          const newCategory: Category = {
                                              id: Date.now().toString().slice(-4),
                                              name: formData.name,
                                              status: formData.status,
                                          };
                                          setCategories([...categories, newCategory]);
                                          toast.success("Kategori berhasil ditambahkan!");
                                      }
                                      setIsDialogOpen(false);
                                      setEditingCategory(null);
                                      setFormData({name: "", status: true});
                                    

                                  }}/>
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2  pt-2 ">
                        <Search className="h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari kategori..."
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
                                <TableHead className="w-[10%]">ID</TableHead>
                                <TableHead className="w-[60%]">Nama</TableHead>
                                <TableHead className="w-[20%]">Status</TableHead>
                                <TableHead className="w-[10%] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell className="font-medium ">
                                        {category.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                category.status
                                                    ? "okay"
                                                    : "destructive"
                                            }
                                        >
                                            {category.status}
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
                                                    onClick={() => handleDelete(category.id)}
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
