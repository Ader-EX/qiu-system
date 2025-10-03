"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Item, TOPUnit } from "@/types/types";
import { ItemTypeEnum } from "@/services/itemService";

import { NumericFormat } from "react-number-format";
import toast from "react-hot-toast";
import { QuickFormSearchableField } from "@/components/form/FormSearchableField";
import { FileSchema } from "@/lib/utils";

const itemSchema = z.object({
  is_active: z.boolean().default(true),
  type: z.nativeEnum(ItemTypeEnum, {
    required_error: "Type is required",
  }),
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  total_item: z.coerce
    .number()
    .min(0, "Total item must be at least 0")
    .default(0), // Changed from 0 to 1
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  satuan_id: z.coerce
    .number({
      required_error: "Satuan is required",
    })
    .min(1, "Please select a satuan"),
  category_one: z.coerce.number().optional(),
  category_two: z.coerce.number().optional(),
  images: z.array(FileSchema).optional(),
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
  satuanService,
  kategoriService,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeOptions = Object.values(ItemTypeEnum);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      is_active: true,
      type: "" as ItemTypeEnum,
      name: "",
      sku: "",
      total_item: 0,
      price: 0,
      satuan_id: 0,

      category_one: undefined, // Changed from null to undefined for required field
      category_two: undefined, // Changed from null to undefined for required field
      images: [],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setIsSubmitting(false); // Reset loading state when dialog closes
      return;
    }

    if (item) {
      form.reset({
        is_active: item.is_active === true,
        type: item.type || ("" as ItemTypeEnum),
        name: item.name || "",
        sku: item.sku || "",
        total_item: item.total_item || 0,
        price: item.price || 0,
        satuan_id:
          typeof item.satuan_rel === "object"
            ? item.satuan_rel?.id || undefined
            : undefined,

        category_one:
          typeof item.category_one_rel === "object"
            ? item.category_one_rel?.id || undefined
            : undefined,
        category_two:
          typeof item.category_two_rel === "object"
            ? item.category_two_rel?.id || undefined
            : undefined,
        images: [], // Always start with empty images for editing
      });
    } else {
      form.reset({
        is_active: true,
        type: "" as ItemTypeEnum,
        name: "",
        sku: "",
        total_item: 0,
        price: 0,
        satuan_id: undefined,

        category_one: undefined,
        category_two: undefined,
        images: [],
      });
    }
  }, [isOpen, item, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    // Clear the input value to allow re-selecting the same files
    e.target.value = "";

    if (files.length === 0) return;

    const currentImages = form.getValues("images") || [];
    const totalImages = currentImages.length + files.length;

    if (totalImages > 3) {
      alert("Maximum 3 images allowed. Please select fewer images.");
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPG, PNG, GIF, WebP).");
      return;
    }

    // Validate file sizes (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(
        "Some files are larger than 2MB. Please choose smaller files."
      );
      return;
    }

    // Add new files to existing ones
    const newImages = [...currentImages, ...files];
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const removeImage = (idx: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== idx);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true); // Start loading

    try {
      const submitFormData = new FormData();

      submitFormData.append("type", data.type);
      submitFormData.append("name", data.name);
      submitFormData.append("sku", data.sku);
      submitFormData.append("total_item", data.total_item.toString());
      submitFormData.append("price", data.price.toString());
      submitFormData.append("is_active", data.is_active.toString());
      submitFormData.append("satuan_id", data.satuan_id.toString());

      if (data.category_one !== undefined)
        submitFormData.append("category_one", data.category_one.toString());
      if (data.category_two !== undefined)
        submitFormData.append("category_two", data.category_two.toString());
      data.images.forEach((file) => {
        submitFormData.append("images", file);
      });

      console.log("FormData created, calling onSave"); // Debug log
      await onSave(submitFormData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const watchedImages = form.watch("images") || [];

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
            <QuickFormSearchableField
              control={form.control}
              name="satuan_id"
              type="satuan"
              isRequired={true}
              label="Satuan"
              placeholder="Pilih Satuan"
            />

            {/* Row 5: categories - NOW MANDATORY */}
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

            {/* Gambar upload - NOW MANDATORY */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gambar</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative"
                      type="button"
                      disabled={watchedImages.length >= 3 || isSubmitting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {watchedImages.length >= 3
                        ? "Maksimal 3 gambar"
                        : "Pilih File"}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={watchedImages.length >= 3 || isSubmitting}
                      />
                    </Button>

                    {watchedImages.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {watchedImages.length} file dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload 1-3 gambar. Maks ukuran file 2 MB. Format JPG, PNG.
                  </p>
                  {watchedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedImages.map((file, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="flex items-center px-3 py-1"
                        >
                          <span className="max-w-32 truncate">{file.name}</span>
                          <button
                            onClick={() => removeImage(i)}
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
