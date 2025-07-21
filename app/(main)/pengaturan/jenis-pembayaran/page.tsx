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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertSuccess } from "@/components/alert-success";
import { Badge } from "@/components/ui/badge";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import toast from "react-hot-toast";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";

interface Unit {
  id: string;
  name: string;
  symbol: string;
  status: boolean;
}

const initialUnits: Unit[] = [
  { id: "1", name: "Cash On Delivery", symbol: "COD", status: true },
  { id: "2", name: "Cash", symbol: "CASH", status: false },
  { id: "3", name: "Next 15 Days", symbol: "N/15", status: true },
];

export default function MataUangPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    symbol: string;
    status: boolean;
  }>({
    name: "",
    symbol: "",
    status: true,
  });

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.status ? "aktif" : "non aktif").includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUnit) {
      setUnits(
        units.map((u) =>
          u.id === editingUnit.id
            ? {
                ...u,
                name: formData.name,
                symbol: formData.symbol,
                status: formData.status,
              }
            : u
        )
      );
      toast.success("jenis pembayaran berhasil diperbarui!");
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol,
        status: formData.status,
      };
      setUnits([...units, newUnit]);
      toast.success("jenis pembayaran berhasil ditambahkan!");
    }

    setIsDialogOpen(false);
    setEditingUnit(null);
    setFormData({ name: "", symbol: "", status: true });
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, symbol: unit.symbol, status: unit.status });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUnits(units.filter((u) => u.id !== id));
    toast.success("jenis pembayaran berhasil dihapus!");
  };

  const openAddDialog = () => {
    setEditingUnit(null);
    setFormData({ name: "", symbol: "", status: true });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        title=""
        leftContent={
          <CustomBreadcrumb
            listData={["Pengaturan", "Master Data", "Jenis Pembayaran"]}
            linkData={["pengaturan", "jenis-pembayaran", "jenis-pembayaran"]}
          />
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingUnit
                  ? "Edit jenis pembayaran"
                  : "Tambah jenis pembayaran Baru"}
              </DialogTitle>
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
                <Label htmlFor="symbol" className="text-right">
                  Simbol
                </Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status">
                      {formData.status ? "Aktif" : "Non Aktif"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif ✅</SelectItem>
                    <SelectItem value="false">Non Aktif ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingUnit ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar jenis pembayaran</CardTitle>
          <CardDescription>
            Kelola jenis pembayaran untuk sistem inventory Anda.
          </CardDescription>
          <div className="flex items-center space-x-2 pt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari jenis pembayaran..."
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
                <TableHead className="w-[45%]">Nama</TableHead>
                <TableHead className="w-[20%]">Simbol</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[10%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="w-[10%]">{unit.id}</TableCell>
                  <TableCell className="w-[45%] font-medium break-words">
                    {unit.name}
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <Badge variant="secondary">{unit.symbol}</Badge>
                  </TableCell>
                  <TableCell className="w-[15%]">
                    <Badge variant={unit.status ? "okay" : "destructive"}>
                      {unit.status ? "Aktif" : "Non Aktif"}
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
                        <DropdownMenuItem onClick={() => handleEdit(unit)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(unit.id)}
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
