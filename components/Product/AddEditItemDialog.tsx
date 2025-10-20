"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2 } from "lucide-react";
import { Item } from "@/types/types";
import { ItemTypeEnum } from "@/services/itemService";
import { NumericFormat } from "react-number-format";
import toast from "react-hot-toast";
import { QuickFormSearchableField } from "@/components/form/FormSearchableField";
import { FileSchema } from "@/lib/utils";

// Extended type to handle both File and existing image URLs
type ImageType = File | { id: number; url: string; filename: string };

const itemSchema = z.object({
  is_active: z.boolean().default(true),
  type: z.nativeEnum(ItemTypeEnum, {
    required_error: "Tipe barang perlu diisi",
  }),
  name: z.string().min(1, "Nama perlu diisi"),
  sku: z.string().min(1, "SKU perlu diisi"),
  total_item: z.coerce.number().min(0, "Total item harus > 0").default(0),
  min_item: z.coerce.number().min(0, "Min item harus > 0").default(0),
  price: z.coerce.number().min(0, "Harga harus > 0 atau lebih"),
  modal_price: z.coerce.number().min(0, "Modal Harga harus > 0 atau lebih"),
  satuan_id: z.coerce
    .number({
      required_error: "Satuan perlu diisi",
    })
    .min(1, "Tolong pilih satuan yang valid"),
  vendor_id: z.coerce.string().optional(),
  category_one: z.coerce.number().optional(),
  category_two: z.coerce.number().optional(),
  images: z.array(z.any()).optional(), // Changed to z.any() to accept both File and URL objects
  existing_images: z.array(z.number()).optional(), // IDs of existing images to keep
  deleted_images: z.array(z.number()).optional(), // IDs of images to delete
});

type ItemFormData = z.infer<typeof itemSchema>;

interface AddEditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: FormData) => Promise<void>;
  isEdit?: boolean;
  item?: Partial<Item> | null;
  satuanService: any;
  kategoriService: any;
}

const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
  isOpen,
  onClose,
  isEdit = false,
  onSave,
  item = null,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string; filename: string }>
  >([]);
  const typeOptions = Object.values(ItemTypeEnum);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      is_active: true,
      type: "" as ItemTypeEnum,
      name: "",
      sku: "",
      total_item: 0,
      min_item: 0,
      price: 0,
      modal_price: 0,
      satuan_id: 0,
      vendor_id: "",
      category_one: undefined,
      category_two: undefined,
      images: [],
      existing_images: [],
      deleted_images: [],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setIsSubmitting(false);
      setExistingImages([]);
      return;
    }

    if (item) {
      // Extract existing images from attachments
      const attachments = item.attachments || [];
      const imageData = attachments.map((att: any) => ({
        id: att.id,
        url: att.url,
        filename: att.filename,
      }));

      setExistingImages(imageData);

      form.reset({
        is_active: item.is_active === true,
        type: item.type || ("" as ItemTypeEnum),
        name: item.name || "",
        sku: item.sku || "",
        total_item: item.total_item || 0,
        min_item: item.min_item || 0,
        price: item.price || 0,
        modal_price: item.modal_price || 0,
        satuan_id:
          typeof item.satuan_rel === "object"
            ? item.satuan_rel?.id || undefined
            : undefined,
        vendor_id:
          typeof item.vendor_rel === "object"
            ? item.vendor_rel?.id || undefined
            : undefined,
        category_one:
          typeof item.category_one_rel === "object"
            ? item.category_one_rel?.id || undefined
            : undefined,
        category_two:
          typeof item.category_two_rel === "object"
            ? item.category_two_rel?.id || undefined
            : undefined,
        images: [],
        existing_images: imageData.map((img: any) => img.id),
        deleted_images: [],
      });
    } else {
      setExistingImages([]);
      form.reset({
        is_active: true,
        type: "" as ItemTypeEnum,
        name: "",
        sku: "",
        total_item: 0,
        price: 0,
        min_item: 0,
        modal_price: 0,
        satuan_id: undefined,
        vendor_id: undefined,
        category_one: undefined,
        category_two: undefined,
        images: [],
        existing_images: [],
        deleted_images: [],
      });
    }
  }, [isOpen, item, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";

    if (files.length === 0) return;

    const currentImages = form.getValues("images") || [];
    const currentExistingImages = form.getValues("existing_images") || [];
    const totalImages =
      currentImages.length + currentExistingImages.length + files.length;

    if (totalImages > 3) {
      toast.error("Maximum 3 gambar diperbolehkan.");
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Format gambar yang diterima hanya (JPG, PNG).");
      return;
    }

    // Validate file sizes (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(
        "File anda terlalu besar ( > 2MB). Tolong upload file dengan ukuran lebih kecil."
      );
      return;
    }

    const newImages = [...currentImages, ...files];
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const removeNewImage = (idx: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== idx);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const removeExistingImage = (imageId: number) => {
    const currentExisting = form.getValues("existing_images") || [];
    const currentDeleted = form.getValues("deleted_images") || [];

    // Remove from existing_images
    const newExisting = currentExisting.filter((id) => id !== imageId);
    form.setValue("existing_images", newExisting, { shouldValidate: true });

    // Add to deleted_images
    form.setValue("deleted_images", [...currentDeleted, imageId], {
      shouldValidate: true,
    });

    // Update local state for UI
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();

      submitFormData.append("type", data.type);
      submitFormData.append("name", data.name);
      submitFormData.append("sku", data.sku);
      submitFormData.append("total_item", data.total_item.toString());
      submitFormData.append("price", data.price.toString());
      submitFormData.append("min_item", data.min_item.toString());
      submitFormData.append("modal_price", data.modal_price.toString());
      submitFormData.append("is_active", data.is_active.toString());
      submitFormData.append("satuan_id", data.satuan_id.toString());

      if (data.vendor_id !== undefined)
        submitFormData.append("vendor_id", data.vendor_id.toString());
      if (data.category_one !== undefined)
        submitFormData.append("category_one", data.category_one.toString());
      if (data.category_two !== undefined)
        submitFormData.append("category_two", data.category_two.toString());

      // Add new image files
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          submitFormData.append("images", file);
        });
      }

      // Add existing image IDs to keep
      if (data.existing_images && data.existing_images.length > 0) {
        data.existing_images.forEach((id) => {
          submitFormData.append("existing_images", id.toString());
        });
      }

      // Add deleted image IDs
      if (data.deleted_images && data.deleted_images.length > 0) {
        data.deleted_images.forEach((id) => {
          submitFormData.append("deleted_images", id.toString());
        });
      }

      await onSave(submitFormData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedNewImages = form.watch("images") || [];
  const watchedExistingImages = form.watch("existing_images") || [];
  const totalImageCount =
    watchedNewImages.length + watchedExistingImages.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Tambah Item Baru"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: name, status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama item"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value.toString()}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Aktif</SelectItem>
                        <SelectItem value="false">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: type, sku */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting || isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      SKU <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SKU"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: total_item, price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga Jual (Rp) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="decimal"
                        value={form.watch("price")}
                        onValueChange={(v) =>
                          form.setValue("price", v.floatValue ?? 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        disabled
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modal_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga Modal (Rp) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="decimal"
                        value={form.watch("modal_price")}
                        onValueChange={(v) =>
                          form.setValue("modal_price", v.floatValue ?? 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Minimal Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <QuickFormSearchableField
                control={form.control}
                name="satuan_id"
                type="satuan"
                isRequired={true}
                label="Satuan"
                placeholder="Pilih Satuan"
              />
              <QuickFormSearchableField
                control={form.control}
                name="vendor_id"
                type="vendor"
                label="Vendor"
                placeholder="Pilih Vendor"
              />
            </div>

            {/* Row 5: categories */}
            <div className="grid grid-cols-2 gap-4">
              <QuickFormSearchableField
                control={form.control}
                name="category_one"
                type="category_one"
                label="Brand"
                placeholder="Pilih Brand"
              />

              <QuickFormSearchableField
                control={form.control}
                name="category_two"
                type="category_two"
                label="Jenis Barang"
                placeholder="Pilih jenis barang"
              />
            </div>

            {/* Image upload section */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gambar</FormLabel>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Gambar saat ini:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.url}
                              alt={img.filename}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                              disabled={isSubmitting}
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-center mt-1 truncate w-20">
                              {img.filename}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload new images */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative"
                      type="button"
                      disabled={totalImageCount >= 3 || isSubmitting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {totalImageCount >= 3
                        ? "Maksimal 3 gambar"
                        : "Pilih File"}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={totalImageCount >= 3 || isSubmitting}
                      />
                    </Button>

                    {watchedNewImages.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {watchedNewImages.length} file baru dipilih
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Upload 1-3 gambar total. Maks ukuran file 2 MB. Format JPG,
                    PNG.
                  </p>

                  {/* New images preview */}
                  {watchedNewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedNewImages.map((file: File, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="flex items-center px-3 py-1"
                        >
                          <span className="max-w-32 truncate">{file.name}</span>
                          <button
                            onClick={() => removeNewImage(i)}
                            className="ml-2 hover:text-red-500"
                            type="button"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end pt-4 space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {item ? "Updating..." : "Menambahkan..."}
                  </>
                ) : item ? (
                  "Update"
                ) : (
                  "Tambah"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditItemDialog;
