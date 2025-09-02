"use client";

import React, {useEffect, useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
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
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {X, Upload, Loader2} from "lucide-react";
import {Item, TOPUnit} from "@/types/types";
import {ItemTypeEnum} from "@/services/itemService";
import SearchableSelect from "../SearchableSelect";

const itemSchema = z.object({
    is_active: z.boolean().default(true),
    type: z.nativeEnum(ItemTypeEnum, {
        required_error: "Type is required",
    }),
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    total_item: z.coerce.number().min(1, "Total item must be at least 1"), // Changed from 0 to 1
    price: z.coerce.number().min(0, "Price must be 0 or greater"),
    satuan_id: z.number({
        required_error: "Satuan is required",
    }),

    category_one: z.number().optional(),
    category_two: z.number().optional(),
    images: z.array(z.instanceof(File)),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface AddEditItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: FormData) => Promise<void>; // Made async to handle loading
    item?: Partial<Item> | null;
    satuanService: any;
    kategoriService: any;
}

const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
                                                                 isOpen,
                                                                 onClose,
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
            total_item: 1, // Changed default from 0 to 1
            price: 0,
            satuan_id: undefined,

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
                total_item: item.total_item || 1,
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
                total_item: 1,
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
        const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
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
            alert("Some files are larger than 2MB. Please choose smaller files.");
            return;
        }

        // Add new files to existing ones
        const newImages = [...currentImages, ...files];
        form.setValue("images", newImages, {shouldValidate: true});
    };

    const removeImage = (idx: number) => {
        const currentImages = form.getValues("images") || [];
        const newImages = currentImages.filter((_, i) => i !== idx);
        form.setValue("images", newImages, {shouldValidate: true});
    };

    const onSubmit = async (data: ItemFormData) => {
        console.log("Form submitted with data:", data); // Debug log

        setIsSubmitting(true); // Start loading

        try {
            // Create FormData for multipart/form-data submission
            const submitFormData = new FormData();

            // Add form fields - match backend field names exactly
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

            // Add images - backend expects 'images' field name
            data.images.forEach((file) => {
                submitFormData.append("images", file);
            });

            console.log("FormData created, calling onSave"); // Debug log
            await onSave(submitFormData);
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            // Handle error here - you might want to show a toast or error message
            // The error will be thrown to the parent component
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };

    const watchedImages = form.watch("images") || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
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
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Nama *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukkan nama item"
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === "true")
                                            }
                                            value={field.value.toString()}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Aktif</SelectItem>
                                                <SelectItem value="false">Tidak Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 2: type, sku */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Type *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Type"/>
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
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sku"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>SKU *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="SKU"
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 3: total_item, price */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="total_item"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Jumlah Unit *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                min="1"
                                                disabled={isSubmitting}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Harga Jual (Rp) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                disabled={isSubmitting}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="satuan_id"
                                render={({field}) => (
                                    <FormItem>
                                        <SearchableSelect<TOPUnit>
                                            label="Satuan *"
                                            placeholder="Pilih satuan"
                                            value={field.value?.toString()}
                                            onChange={(value) => field.onChange(parseInt(value))}
                                            fetchData={(search: string) =>
                                                satuanService.getAllMataUang({
                                                    skip: 0,
                                                    limit: 5,
                                                    search,
                                                })
                                            }
                                            renderLabel={(item: any) =>
                                                `${item.symbol} - ${item.name}`
                                            }
                                            disabled={isSubmitting}
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 5: categories - NOW MANDATORY */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category_one"
                                render={({field}) => (
                                    <FormItem>
                                        <SearchableSelect<TOPUnit>
                                            label="Kategori 1"
                                            placeholder="Pilih kategori 1"
                                            value={field.value?.toString()}
                                            onChange={(value) => field.onChange(parseInt(value))}
                                            fetchData={(search: string) =>
                                                kategoriService.getAllCategories({
                                                    skip: 0,
                                                    limit: 5,
                                                    type: 1,
                                                    search,
                                                })
                                            }
                                            renderLabel={(item: any) => `${item.name}`}
                                            disabled={isSubmitting}
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category_two"
                                render={({field}) => (
                                    <FormItem>
                                        <SearchableSelect<TOPUnit>
                                            label="Kategori 2"
                                            placeholder="Pilih kategori 2"
                                            value={field.value?.toString()}
                                            onChange={(value) => field.onChange(parseInt(value))}
                                            fetchData={(search: string) =>
                                                kategoriService.getAllCategories({
                                                    skip: 0,
                                                    limit: 5,
                                                    type: 2,
                                                    search,
                                                })
                                            }
                                            renderLabel={(item: any) => `${item.name}`}
                                            disabled={isSubmitting}
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Gambar upload - NOW MANDATORY */}
                        <FormField
                            control={form.control}
                            name="images"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Gambar * (Wajib 1-3 gambar)</FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="relative"
                                            type="button"
                                            disabled={watchedImages.length >= 3 || isSubmitting}
                                        >
                                            <Upload className="w-4 h-4 mr-2"/>
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
                                        Wajib upload 1-3 gambar. Maks ukuran file 2 MB. Format JPG,
                                        PNG, GIF, WebP.
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
                                                        <X className="w-3 h-3"/>
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <FormMessage/>
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
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        {item ? "Updating..." : "Menambahkan..."}
                                    </>
                                ) : (
                                    item ? "Update" : "Tambah"
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