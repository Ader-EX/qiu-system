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
import { Product } from "@/app/(main)/item/page";
import { StaticImageData } from "next/image";

interface AddEditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Product) => void;
  item?: Partial<Product> | null;
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
    satuan: "",
    vendor: "",
    kategori1: "",
    kategori2: "",
  });

  const vendorOptions = ["Vendor A", "Vendor B", "Vendor C"];
  const typeOptions = ["Elektronik", "Aksesoris", "Storage", "Hardware"];
  const kategori1Options = [
    "Komputer",
    "Input Device",
    "Display",
    "Audio",
    "Storage Device",
    "Memory",
    "Camera",
  ];
  const kategori2Options = ["Premium", "Budget", "Gaming", "Professional"];

  const [uploadedImages, setUploadedImages] = useState<
    (StaticImageData | string)[]
  >([]);

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
        satuan: item.satuan || "", // Changed from "pcs" default
        vendor: item.vendor || "",
        kategori1: item.kategori1 || "",
        kategori2: item.kategori2 || "",
      });
      setUploadedImages(
        Array.isArray(item.gambar)
          ? item.gambar.map((img: any) =>
              typeof img === "string" ? img : img.src
            )
          : []
      );
    } else {
      setFormData({
        type: "",
        status: "Aktif",
        id: "",
        nama: "",
        SKU: "",
        jumlah: "",
        harga: "",
        satuan: "", // Changed from "pcs" to empty string
        vendor: "",
        kategori1: "",
        kategori2: "",
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
    const newItem: Product = {
      type: formData.type,
      status: formData.status === "Aktif" ? "active" : "inactive",
      id: formData.id,
      nama: formData.nama,
      SKU: formData.SKU,
      jumlah: parseInt(formData.jumlah, 10),
      harga: parseInt(formData.harga, 10),
      gambar: uploadedImages,
      satuan: formData.satuan || "",
      vendor: formData.vendor || "",
      kategori1: formData.kategori1 || "",
      kategori2: formData.kategori2 || "",
    };
    onSave(newItem);
    onClose();
  };

  // Updated validation to only check mandatory fields
  const isFormValid =
    formData.nama &&
    formData.type &&
    formData.id &&
    formData.SKU &&
    formData.jumlah &&
    formData.harga;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Tambah Item Baru"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Row 1: nama, status */}
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
          </div>

          {/* Row 2: type, id */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleInputChange("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id">Item ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                placeholder="JSD0001"
              />
            </div>
          </div>

          {/* Row 3: SKU, jumlah, harga */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="SKU">SKU *</Label>
              <Input
                id="SKU"
                value={formData.SKU}
                onChange={(e) => handleInputChange("SKU", e.target.value)}
                placeholder="SKU"
              />
            </div>

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

          {/* Row 4: satuan, vendor (now optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Select
                value={formData.satuan}
                onValueChange={(v) => handleInputChange("satuan", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Satuan " />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select
                value={formData.vendor}
                onValueChange={(v) => handleInputChange("vendor", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Vendor " />
                </SelectTrigger>
                <SelectContent>
                  {vendorOptions.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: categories (now optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori1">Kategori 1</Label>
              <Select
                value={formData.kategori1}
                onValueChange={(v) => handleInputChange("kategori1", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori 1 " />
                </SelectTrigger>
                <SelectContent>
                  {kategori1Options.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori2">Kategori 2</Label>
              <Select
                value={formData.kategori2}
                onValueChange={(v) => handleInputChange("kategori2", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori 2 " />
                </SelectTrigger>
                <SelectContent>
                  {kategori2Options.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <span className="max-w-32 truncate">
                      {typeof img === "string" ? img : img.src}
                    </span>
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
              disabled={!isFormValid}
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
