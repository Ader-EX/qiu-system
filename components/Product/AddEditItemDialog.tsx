"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";

// Data shape passed to onSave
interface ItemData {
  type: string;
  status: "active" | "inactive";
  id: string;
  nama: string;
  SKU: string;
  jumlah: number;
  harga: number;
  satuan: string;
  vendor: string;
  gambar: any[];
}

interface AddEditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemData) => void;
  item?: Partial<ItemData> | null;
}

const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item = null,
}) => {
  const [formData, setFormData] = useState({
    type: "",
    status: "Aktif",
    id: "",
    nama: "",
    SKU: "",
    jumlah: "",
    harga: "",
    satuan: "pcs",
    vendor: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      setFormData({
        type: item.type || "",
        status: item.status === "active" ? "Aktif" : "Tidak Aktif",
        id: item.id || "",
        nama: item.nama || "",
        SKU: item.SKU || "",
        jumlah: item.jumlah?.toString() || "",
        harga: item.harga?.toString() || "",
        satuan: item.satuan || "pcs",
        vendor: item.vendor || "",
      });
      setUploadedImages(item.gambar || []);
    } else {
      setFormData({
        type: "",
        status: "Aktif",
        id: "",
        nama: "",
        SKU: "",
        jumlah: "",
        harga: "",
        satuan: "pcs",
        vendor: "",
      });
      setUploadedImages([]);
    }
  }, [isOpen, item]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const names = files.map((f) => f.name);
    setUploadedImages((prev) => [...prev, ...names]);
  };

  const removeImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const newItem: ItemData = {
      type: formData.type,
      status: formData.status === "Aktif" ? "active" : "inactive",
      id: formData.id,
      nama: formData.nama,
      SKU: formData.SKU,
      jumlah: parseInt(formData.jumlah, 10) || 0,
      harga: parseInt(formData.harga, 10) || 0,
      satuan: formData.satuan,
      vendor: formData.vendor,
      gambar: uploadedImages,
    };
    onSave(newItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Tambah Item Baru"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Row 1: type, status, id */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                placeholder="Masukkan nama item"
              />
            </div>
            {/* Type */}

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleInputChange("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* ID */}
          </div>

          {/* Row 2: nama, SKU, jumlah, harga */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id"> Item ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                placeholder="JSD0001"
              />
            </div>
            {/* Nama */}

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="SKU">SKU</Label>
              <Input
                id="SKU"
                value={formData.SKU}
                onChange={(e) => handleInputChange("SKU", e.target.value)}
                placeholder=" SKU"
              />
            </div>
            {/* Jumlah */}
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah Unit</Label>
              <Input
                id="jumlah"
                type="number"
                value={formData.jumlah}
                onChange={(e) => handleInputChange("jumlah", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            {/* Harga */}
            <div className="space-y-2">
              <Label htmlFor="harga">Harga Jual (Rp)</Label>
              <Input
                id="harga"
                type="number"
                value={formData.harga}
                onChange={(e) => handleInputChange("harga", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Row 3: satuan, vendor */}
          <div className="grid grid-cols-2 gap-4">
            {/* Satuan */}

            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Select
                value={formData.satuan}
                onValueChange={(v) => handleInputChange("satuan", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange("vendor", e.target.value)}
                placeholder="Nama vendor"
              />
            </div>
          </div>

          {/* Gambar upload */}
          <div className="space-y-2">
            <Label>Gambar</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="relative">
                <Upload className="w-4 h-4 mr-2" />
                Pilih File
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>

              {uploadedImages.length > 0 && (
                <span className="text-sm text-gray-500">
                  {uploadedImages.length} file dipilih
                </span>
              )}
            </div>
            <span className="opacity-60 text-sm mt-2">
              Maks ukuran file 2 MB. Format JPG
            </span>
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {uploadedImages.map((img, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center px-3 py-1"
                  >
                    <span className="max-w-32 truncate">{img}</span>
                    <button
                      onClick={() => removeImage(i)}
                      className="ml-2 hover:text-red-500"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 space-x-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!formData.nama || !formData.type}
            >
              {item ? "Update" : "Tambah"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditItemDialog;
