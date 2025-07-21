"use client";

import React, { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

interface Category {
  id: string;
  name: string;
  status: "Aktif" | "Non Aktif";
}

const initialCategories: Category[] = [
  { id: "1", name: "Elektronik", status: "Aktif" },
  { id: "2", name: "Fashion", status: "Non Aktif" },
  { id: "3", name: "Makanan", status: "Aktif" },
];

export default function Kategori2Page() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{ name: string; status: string }>({
    name: "",
    status: "",
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
                status: formData.status as "Aktif" | "Non Aktif",
              }
            : cat
        )
      );
      toast.success("Kategori 2 berhasil diperbarui!");
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        status: formData.status as "Aktif" | "Non Aktif",
      };
      setCategories([...categories, newCategory]);
      toast.success("Kategori 2 berhasil ditambahkan!");
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", status: "" });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, status: category.status });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
    toast.success("Kategori 2 berhasil dihapus!");
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", status: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Kategori 2"]}
            linkData={["pengaturan", "kategori-2", "kategori-2"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button
              onClick={openAddDialog}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori 2
            </Button>
          </HeaderActions.ActionGroup>
        }
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Kategori 2" : "Tambah Kategori 2 Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Perbarui informasi kategori 2 di bawah ini."
                  : "Masukkan informasi kategori 2 baru di bawah ini."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif ✅</SelectItem>
                    <SelectItem value="Non Aktif">Non Aktif ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingCategory ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori 2</CardTitle>
          <CardDescription>
            Kelola kategori 2 produk untuk sistem inventory Anda.
          </CardDescription>
          <div className="flex items-center space-x-2 pt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
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
                  <TableCell className="w-[10%]">{category.id}</TableCell>
                  <TableCell className="w-[60%] font-medium break-words">
                    {category.name}
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <Badge
                      variant={
                        category.status === "Aktif" ? "okay" : "destructive"
                      }
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[10%] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
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
