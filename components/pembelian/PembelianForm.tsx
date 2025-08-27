"use client";

import * as React from "react";
import {useForm, useFieldArray} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {
    CalendarIcon,
    Plus,
    Trash2,
    FileText,
    X,
    RefreshCw,
} from "lucide-react";
import {cn, formatMoney, roundToPrecision} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {CardTitle} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Calendar} from "@/components/ui/calendar";
import {SidebarHeaderBar} from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import SearchableSelect from "@/components/SearchableSelect";
import ItemSelectorDialog from "@/components/ItemSelectorDialog";
import {FileUploadButton} from "@/components/ImageUpload";

import {
    pembelianService,
    PembelianUpdate,
    Attachment,
} from "@/services/pembelianService";
import {warehouseService} from "@/services/warehouseService";
import {jenisPembayaranService} from "@/services/mataUangService";
import {imageService, ParentType} from "@/services/imageService";
import {Item} from "@/types/types";
import {useState, useEffect} from "react";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {vendorService} from "@/services/vendorService";
import {usePrintInvoice} from "@/hooks/usePrintInvoice";

const FormSection = ({
                         title,
                         children,
                     }: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col md:flex-row w-full justify-between pt-6 border-t first:pt-0 first:border-none">
        <h4 className="text-lg font-semibold mb-4 md:mb-0 md:w-[30%]">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:w-[70%]">
            {children}
        </div>
    </div>
);

// Unified Zod schema for both ADD and EDIT
const pembelianSchema = z.object({
    no_pembelian: z.string().optional(),
    warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
    vendor_id: z.string().min(1, "Vendor harus dipilih"),
    top_id: z.number().min(1, "Jenis Pembayaran harus dipilih"),
    sales_date: z.date({required_error: "Sales Date harus diisi"}),
    sales_due_date: z.date({required_error: "Sales Due Date harus diisi"}),

    additional_discount: z
        .number()
        .min(0, "Additional discount tidak boleh negatif")
        .default(0),
    expense: z.number().min(0, "Expense tidak boleh negatif").default(0),
    items: z
        .array(
            z.object({
                item_id: z.number().min(1, "Item harus dipilih"),
                qty: z.number().min(1, "Quantity harus lebih dari 0"),
                unit_price: z.number().min(0, "Unit price tidak boleh negatif"),
                tax_percentage: z
                    .number()
                    .min(0, "Tax percentage tidak boleh negatif")
                    .default(10),
                price_before_tax: z
                    .number()
                    .min(0, "Price before tax tidak boleh negatif"),
                discount: z.number().min(0, "Discount tidak boleh negatif").default(0),
            })
        )
        .min(1, "Minimal harus ada 1 item"),
    attachments: z.array(z.instanceof(File)).optional(),
    status_pembayaran: z.string().optional(),
    status_pembelian: z.string().optional(),
});

type PembelianFormData = z.infer<typeof pembelianSchema>;

interface PembelianFormProps {
    mode: "add" | "edit" | "view";
    pembelianId?: string;
}

export default function PembelianForm({
                                          mode,
                                          pembelianId,
                                      }: PembelianFormProps) {
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [totalPaid, setTotalPaid] = useState<number>(0);
    const [totalReturn, setTotalReturn] = useState<number>(0);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
        []
    );
    const [isActive, setIsActive] = useState<boolean>(true);

    const router = useRouter();

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const form = useForm<PembelianFormData>({
        resolver: zodResolver(pembelianSchema),
        defaultValues: {
            no_pembelian: isEditMode ? "" : `-`,
            warehouse_id: undefined,
            vendor_id: "",
            top_id: undefined,

            additional_discount: 0,
            expense: 0,
            items: [], // This will be populated in edit mode
            attachments: [],
        },
        mode: "onChange",
    });
    useEffect(() => {
        if (isEditMode) {
            const subscription = form.watch((value, {name, type}) => {
                if (name?.includes("tax_percentage")) {
                    console.log(`[Form Watch] ${name} changed:`, value);
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [form.watch, isEditMode]);
    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "items",
    });
    const {simplePrint, previewInvoice, advancedPrint, isPrinting} =
        usePrintInvoice();

    useEffect(() => {
        if ((mode !== "edit" && mode !== "view") || !pembelianId) return;

        const loadPembelianData = async () => {
            try {
                const data = await pembelianService.getPembelianById(
                    Number(pembelianId)
                );

                const formData = {
                    no_pembelian: data.no_pembelian,
                    warehouse_id: Number(data.warehouse_id),
                    vendor_id: String(data.vendor_id),
                    top_id: Number(data.top_id),
                    sales_date: new Date(data.sales_date),
                    sales_due_date: new Date(data.sales_due_date),

                    additional_discount: Number(data.additional_discount ?? 0),
                    expense: Number(data.expense),
                    status_pembayaran: data.status_pembayaran || "UNPAID",
                    status_pembelian: data.status_pembelian || "DRAFT/ACTIVE",
                    items: data.pembelian_items.map((item) => {
                        const up = Number(item.unit_price);
                        const tax = item.tax_percentage ?? 10;

                        return {
                            item_id: Number(item.item_id),
                            qty: Number(item.qty),
                            unit_price: up,
                            discount: Number(item.discount ?? 0),
                            tax_percentage: tax,
                            price_before_tax: up / (1 + tax / 100),
                        };
                    }),
                    attachments: [],
                };
                setTotalPaid(Number(data.total_paid || 0));
                setTotalReturn(Number(data.total_return || 0));
                setIsActive(
                    data.status_pembelian == "ACTIVE" || data.status_pembelian == "DRAFT"
                );

                setTimeout(() => {
                    form.reset(formData);
                }, 100);

                setSelectedItems(
                    data.pembelian_items.map((item) => ({
                        id: Number(item.item_id), // Make sure this matches the form item_id type
                        code: item.item_rel?.code ?? "",
                        name: item.item_name ?? item.item_rel?.name ?? "",
                        price:
                            Number(item.unit_price) / (1 + (item.tax_percentage ?? 10) / 100),
                    }))
                );

                setExistingAttachments(data.attachments || []);
            } catch (error: any) {
                toast.error(error.message || "Failed to load purchase data");
            }
        };

        loadPembelianData();
    }, [isEditMode, isViewMode, pembelianId]);
    const watchedItems = form.watch("items");
    const watchedAdditionalDiscount = Number(
        form.watch("additional_discount") || 0
    );
    const watchedExpense = Number(form.watch("expense") || 0);

    // 1. Sub Total (before tax, before any discounts)
    const subTotalBeforeTax = watchedItems.reduce(
        (sum, item) =>
            sum + Number(item.qty || 0) * Number(item.price_before_tax || 0),
        0
    );

    // 2. Total Item Discounts
    const totalItemDiscounts = watchedItems.reduce(
        (sum, item) => sum + Number(item.qty || 0) * Number(item.discount || 0),
        0
    );

    // 3. Total (after item discounts, before additional discount, before tax)
    // Total: Sum(sub total) - sum(discount) - Additional discount
    const total =
        subTotalBeforeTax - totalItemDiscounts - watchedAdditionalDiscount;

    // 4. TAX CALCULATION - FIXED
    // Tax: sum((Qty*Harga Satuan)*pajak%))
    // But we need to apply tax to the discounted amount per item
    const totalTax = watchedItems.reduce((sum, item) => {
        const priceBeforeTax = Number(item.price_before_tax || 0);
        const taxPercentage = Number(item.tax_percentage || 0);
        const qty = Number(item.qty || 0);

        // Tax calculated on original price, then multiplied by quantity
        const taxPerUnit = (priceBeforeTax * taxPercentage) / 100;
        const totalTaxForItem = taxPerUnit * qty;

        return sum + totalTaxForItem;
    }, 0);

    const grandTotal = total + totalTax + watchedExpense;
    const remaining = grandTotal - (totalPaid + totalReturn);

    const baseForAdditionalDiscount = subTotalBeforeTax - totalItemDiscounts;
    const additionalDiscountPercentage = roundToPrecision(
        baseForAdditionalDiscount > 0
            ? (watchedAdditionalDiscount / baseForAdditionalDiscount) * 100
            : 0
    );
    const handleAddItem = (pickedItem: Item) => {
        const existingItemIndex = fields.findIndex(
            (field) => field.item_id === pickedItem.id
        );

        if (existingItemIndex >= 0) {
            const currentQty = form.getValues(`items.${existingItemIndex}.qty`);
            form.setValue(`items.${existingItemIndex}.qty`, currentQty + 1);
        } else {
            const priceBeforeTax = pickedItem.price;
            const taxPercentage = 11;
            const unitPriceWithTax = priceBeforeTax * (1 + taxPercentage / 100);

            setSelectedItems([...selectedItems, pickedItem]);

            append({
                item_id: pickedItem.id,
                qty: 1,
                unit_price: unitPriceWithTax,
                discount: 0,
                tax_percentage: taxPercentage,
                price_before_tax: priceBeforeTax,
            });
        }
    };

    const handleRemoveItem = (index: number) => {
        remove(index);
        const newSelectedItems = [...selectedItems];
        newSelectedItems.splice(index, 1);
        setSelectedItems(newSelectedItems);
    };
    const handlePriceBeforeTaxChange = (
        index: number,
        newPriceBeforeTax: number
    ) => {
        const taxPercentage = form.getValues(`items.${index}.tax_percentage`) || 0;
        const newUnitPrice = newPriceBeforeTax * (1 + taxPercentage / 100);

        form.setValue(`items.${index}.price_before_tax`, newPriceBeforeTax);
        form.setValue(`items.${index}.unit_price`, newUnitPrice);
    };

    const handleRemoveExistingAttachment = async (attachmentId: number) => {
        if (!pembelianId) return;

        try {
            await pembelianService.deleteAttachment(pembelianId, attachmentId);
            setExistingAttachments((prev) =>
                prev.filter((att) => att.id !== attachmentId)
            );
            toast.success("Attachment removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove attachment");
        }
    };

    const handleSubmit = async (
        data: PembelianFormData,
        finalize: boolean = false
    ) => {
        setIsSubmitting(true);

        try {
            const isValid = await form.trigger();

            if (!isValid) {
                toast.error("Data Anda belum lengkap");
                return;
            }

            const apiPayload = {
                no_pembelian: data.no_pembelian || `-`,
                warehouse_id: Number(data.warehouse_id),
                vendor_id: data.vendor_id,
                top_id: Number(data.top_id),
                sales_date: data.sales_date.toISOString(),
                sales_due_date: data.sales_due_date.toISOString(),

                additional_discount: Number(data.additional_discount || 0),
                expense: Number(data.expense || 0),

                items: data.items.map((item) => ({
                    item_id: Number(item.item_id),

                    qty: Number(item.qty),
                    unit_price: Number(item.unit_price),
                    tax_percentage: Number(item.tax_percentage),
                    discount: Number(item.discount || 0),
                })),
            };
            let resultId: any;

            if ((isViewMode || isEditMode) && pembelianId) {
                const updateResult = await pembelianService.updatePembelian(
                    pembelianId,
                    apiPayload as PembelianUpdate
                );

                resultId = pembelianId;

                await handleAttachmentUpload(data.attachments, resultId);

                toast.success("Purchase successfully updated.");
                if (finalize) {
                    await pembelianService.finalizePembelian(resultId);
                }
                router.back();
            } else {
                const result = await pembelianService.createPembelian(apiPayload);

                console.log("Create result:", result);
                resultId = result.id;
                if (!resultId) throw new Error("Failed to get ID from response.");

                // Handle attachment upload for CREATE mode
                await handleAttachmentUpload(data.attachments, resultId);

                if (finalize) {
                    await pembelianService.finalizePembelian(resultId);
                }

                toast.success("Pembelian Berhasil dibuat");
                router.back();
            }
        } catch (e: any) {
            console.error("Submit error:", e);
            toast.error(e.detail || e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachmentUpload = async (attachments: any, parentId: number) => {
        if (!attachments) {
            console.log("No attachments to upload");
            return;
        }

        try {
            // Handle different attachment data structures
            let filesToUpload: File[] = [];

            if (attachments instanceof File) {
                // Single file
                filesToUpload = [attachments];
            } else if (attachments instanceof FileList) {
                // FileList from input
                filesToUpload = Array.from(attachments);
            } else if (Array.isArray(attachments)) {
                // Array of files
                filesToUpload = attachments.filter((file) => file instanceof File);
            } else {
                console.warn("Unsupported attachment format:", attachments);
                return;
            }

            console.log("Files to upload:", filesToUpload);

            // Upload each file
            const uploadPromises = filesToUpload.map(async (file, index) => {
                try {
                    console.log(`Uploading file ${index + 1}:`, file.name);

                    const validationError = imageService.validateFile(file);
                    if (validationError) {
                        throw new Error(`File "${file.name}": ${validationError}`);
                    }

                    const uploadResult = await imageService.uploadImage({
                        file: file,
                        parent_type: ParentType.PEMBELIANS,
                        parent_id: parentId,
                    });

                    console.log(`Upload result for ${file.name}:`, uploadResult);
                    return uploadResult;
                } catch (error: any) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    // Instead of throwing, we'll collect the error
                    return {error: error.detail, fileName: file.name};
                }
            });

            const uploadResults = await Promise.allSettled(uploadPromises);
        } catch (error: any) {
            console.error("Attachment upload error:", error);
            toast.error(`Attachment upload failed: ${error.detail}`);
        }
    };

    const handleExistingAttachments = async (pembelianId: string) => {
        try {
            console.log("Fetching existing attachments for pembelian:", pembelianId);
            const existingAttachments = await imageService.getAttachmentsByParent(
                ParentType.PEMBELIANS,
                pembelianId
            );

            console.log("Existing attachments:", existingAttachments);
            return existingAttachments;
        } catch (error) {
            console.error("Error fetching existing attachments:", error);
            return [];
        }
    };

    const onDraftClick = form.handleSubmit(
        (data) => {
            handleSubmit(data, false);
        },
        (errors) => {
            toast.error("Silahkan penuhi data Anda terlebih dahulu");
        }
    );

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={[
                            "Pembelian",
                            isEditMode ? "Edit Pembelian" : "Tambah Pembelian",
                        ]}
                        linkData={[
                            "pembelian",
                            isEditMode ? `pembelian/edit/${pembelianId}` : "/pembelian/add",
                        ]}
                    />
                }
            />
            <Form {...form}>
                <form className="space-y-6">
                    {/* Purchase Information */}
                    <FormSection title="Informasi Pembelian">
                        <FormField
                            control={form.control}
                            name="no_pembelian"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>No. Pembelian</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={true}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sales_date"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Sales Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    disabled={isViewMode}
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Sales date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) => date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status_pembelian"
                            render={({field}) => (
                                <div>
                                    <Label>Status</Label>
                                    <div className="mt-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">
                      {field.value || "DRAFT / ACTIVE"}
                    </span>
                                    </div>
                                </div>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sales_due_date"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Sales Due Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    disabled={isViewMode}
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Sales due date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) => date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Warehouse & Vendor */}
                    <FormSection title="Gudang & Vendor">
                        <FormField
                            control={form.control}
                            name="vendor_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Vendor"
                                        placeholder="Pilih Vendor"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        onChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        disabled={isViewMode}
                                        fetchData={async (search) => {
                                            try {
                                                const response = await vendorService.getAllVendors({
                                                    skip: 0,
                                                    limit: 10,
                                                    search_key: search,
                                                });
                                                return response;
                                            } catch (error) {
                                                throw error;
                                            }
                                        }}
                                        renderLabel={(item: any) =>
                                            `${item.id} - ${item.name} ${
                                                item?.curr_rel?.symbol
                                                    ? `(${item.curr_rel.symbol})`
                                                    : ""
                                            }`
                                        }
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="warehouse_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Warehouse"
                                        placeholder="Pilih Warehouse"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        onChange={(value) => {
                                            console.log("[Warehouse] Selected value:", value);
                                            const numValue = Number(value);
                                            field.onChange(numValue);
                                        }}
                                        disabled={isViewMode}
                                        fetchData={async (search) => {
                                            try {
                                                const response =
                                                    await warehouseService.getAllWarehouses({
                                                        skip: 0,
                                                        limit: 10, // Increase limit
                                                        search: search,
                                                    });
                                                return response;
                                            } catch (error) {
                                                throw error;
                                            }
                                        }}
                                        renderLabel={(item: any) => item.name}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Payment Information */}
                    <FormSection title="Informasi Pembayaran">
                        <FormField
                            control={form.control}
                            name="top_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Jenis Pembayaran"
                                        placeholder="Pilih Jenis Pembayaran"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        disabled={isViewMode}
                                        onChange={(value) => {
                                            console.log("[Payment] Selected value:", value);
                                            const numValue = Number(value);
                                            field.onChange(numValue);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response =
                                                    await jenisPembayaranService.getAllMataUang({
                                                        skip: 0,
                                                        limit: 10, // Increase limit
                                                        search: search,
                                                    });
                                                return response;
                                            } catch (error) {
                                                throw error;
                                            }
                                        }}
                                        renderLabel={(item: any) => `${item.symbol} - ${item.name}`}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status_pembayaran"
                            render={({field}) => (
                                <div>
                                    <Label>Status Pembayaran</Label>
                                    <div className="mt-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">
                      {field.value || "UNPAID"}
                    </span>
                                    </div>
                                </div>
                            )}
                        />
                    </FormSection>

                    {/* Attachments Section */}
                    <FormSection title="Lampiran">
                        {(isEditMode || isViewMode) && (
                            <div className="md:col-span-2 space-y-3">
                                <Label>Existing Attachments</Label>
                                {existingAttachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {existingAttachments.map((att) => (
                                            <div
                                                key={att.id}
                                                className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3 truncate">
                                                    <FileText className="h-5 w-5 text-gray-500 flex-shrink-0"/>
                                                    <a
                                                        href={pembelianService.getDownloadUrl(
                                                            pembelianId!,
                                                            att.id
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium hover:underline truncate"
                                                    >
                                                        {att.filename}
                                                    </a>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveExistingAttachment(att.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No existing attachments.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Upload new attachments */}
                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="attachments"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            {isEditMode ? "Add New Attachments" : ""}
                                        </FormLabel>
                                        <FormControl>
                                            <FileUploadButton
                                                disabled={!isActive}
                                                value={field.value || []}
                                                onChangeAction={field.onChange}
                                                maxFiles={3}
                                                maxSizeMB={4}
                                                accept={{"application/pdf": [".pdf"]}}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* Item Details */}

                    <div className="flex w-full justify-between items-center">
                        <CardTitle className="text-lg">Detail Item</CardTitle>
                        {!isViewMode && (
                            <Button
                                type="button"
                                onClick={() => setIsItemDialogOpen(true)}
                                className=""
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Item
                            </Button>
                        )}
                    </div>

                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada item ditambahkan
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Code</TableHead>
                                        <TableHead>Nama Item</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Harga Satuan</TableHead>
                                        <TableHead>Pajak (%)</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Harga Termasuk Pajak</TableHead>
                                        <TableHead>Sub Total</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const item = watchedItems[index];
                                        const subTotal =
                                            (item?.qty || 0) * (item?.unit_price || 0) -
                                            (item?.discount || 0);

                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    {selectedItems[index]?.code || ""}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedItems[index]?.name || ""}
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.qty`}
                                                        render={({field}) => (
                                                            <Input
                                                                disabled={isViewMode || false}
                                                                type="number"
                                                                className=""
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.price_before_tax`}
                                                        render={({field}) => (
                                                            <Input
                                                                disabled={isViewMode || false}
                                                                type="number"
                                                                className=""
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...field}
                                                                onChange={(e) =>
                                                                    handlePriceBeforeTaxChange(
                                                                        index,
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.tax_percentage`}
                                                        render={({field}) => (
                                                            <Input
                                                                disabled={isViewMode || false}
                                                                type="number"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                className=""
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const newTaxPercentage =
                                                                        Number(e.target.value) || 0;
                                                                    field.onChange(newTaxPercentage);

                                                                    // Get current price before tax
                                                                    const priceBeforeTax =
                                                                        form.getValues(
                                                                            `items.${index}.price_before_tax`
                                                                        ) || 0;

                                                                    // Calculate new unit price with updated tax
                                                                    const newUnitPrice =
                                                                        priceBeforeTax *
                                                                        (1 + newTaxPercentage / 100);

                                                                    form.setValue(
                                                                        `items.${index}.unit_price`,
                                                                        newUnitPrice,
                                                                        {
                                                                            shouldDirty: true,
                                                                            shouldValidate: true,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.discount`}
                                                        render={({field}) => (
                                                            <Input
                                                                disabled={isViewMode || false}
                                                                type="number"
                                                                className=""
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                          <span className="text-sm">
                            {(() => {
                                const priceBeforeTax =
                                    Number(
                                        form.watch(`items.${index}.price_before_tax`)
                                    ) || 0;
                                const discount =
                                    Number(form.watch(`items.${index}.discount`)) ||
                                    0;
                                const taxPercentage =
                                    Number(
                                        form.watch(`items.${index}.tax_percentage`)
                                    ) || 0;

                                // Calculate tax on original price before discount
                                const taxAmount =
                                    (priceBeforeTax * taxPercentage) / 100;

                                // Final price = original price + tax - discount
                                const finalPrice =
                                    priceBeforeTax + taxAmount - discount;

                                return Math.max(0, finalPrice).toFixed(2);
                            })()}
                          </span>
                                                </TableCell>
                                                <TableCell>
                          <span className="text-sm font-medium">
                            {(() => {
                                const qty =
                                    Number(form.watch(`items.${index}.qty`)) || 0;
                                const priceBeforeTax =
                                    Number(
                                        form.watch(`items.${index}.price_before_tax`)
                                    ) || 0;
                                const discount =
                                    Number(form.watch(`items.${index}.discount`)) ||
                                    0;
                                const taxPercentage =
                                    Number(
                                        form.watch(`items.${index}.tax_percentage`)
                                    ) || 0;

                                // Calculate tax on original price before discount
                                const taxAmount =
                                    (priceBeforeTax * taxPercentage) / 100;

                                // Final price per unit = original price + tax - discount
                                const finalPricePerUnit = Math.max(
                                    0,
                                    priceBeforeTax + taxAmount - discount
                                );

                                // Sub total = quantity × final price per unit
                                const subTotal = qty * finalPricePerUnit;

                                return subTotal.toFixed(2);
                            })()}
                          </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        disabled={isViewMode}
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Totals */}
                            <div className="flex w-full justify-end mt-4">
                                <div className="flex flex-col space-y-2 gap-2 w-full max-w-sm">
                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Sub Total</span>
                                        <Input
                                            type="text"
                                            disabled={true}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="w-[40%] text-right"
                                            value={formatMoney(subTotalBeforeTax) || 0}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Discount</span>{" "}
                                        <Input
                                            type="text"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            disabled={true}
                                            className="w-[40%] text-right"
                                            value={formatMoney(totalItemDiscounts) || 0}
                                        />
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <span className="mt-2">Additional Discount</span>
                                        <div className="flex flex-col space-y-2">
                                            {/* Percentage Input */}
                                            <div className="flex items-center justify-end ">
                        <span className="text-sm text-muted-foreground w-4">
                          %
                        </span>
                                                <Input
                                                    type="number"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    disabled={isViewMode}
                                                    className="w-[70%] text-right"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                    value={additionalDiscountPercentage.toString()}
                                                    onChange={(e) => {
                                                        const percentage = Number(e.target.value) || 0;
                                                        const baseForAdditionalDiscount =
                                                            subTotalBeforeTax - totalItemDiscounts;

                                                        const amount = roundToPrecision(
                                                            (baseForAdditionalDiscount * percentage) / 100
                                                        );

                                                        form.setValue("additional_discount", amount, {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        });
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end space-x-1">
                                                <FormField
                                                    control={form.control}
                                                    name="additional_discount"
                                                    render={({field}) => (
                                                        <Input
                                                            type="number"
                                                            disabled={isViewMode}
                                                            className="w-[70%] text-right"
                                                            placeholder="0"
                                                            min="0"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between ">
                                        <span className={"mr-4"}>Total</span>
                                        <Input
                                            type="text"
                                            disabled={true}
                                            className="w-[40%] text-right"
                                            value={formatMoney(total) || 0}
                                        />
                                    </div>

                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Tax</span>
                                        <Input
                                            type="text"
                                            disabled={true}
                                            className="w-[40%] text-right"
                                            value={formatMoney(totalTax) || 0}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span>Expense</span>
                                        <FormField
                                            control={form.control}
                                            name="expense"
                                            render={({field}) => (
                                                <Input
                                                    disabled={isViewMode}
                                                    type="number"
                                                    className="w-[40%] text-right"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Grand Total</span>
                                        <span>{formatMoney(grandTotal)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Remaining</span>
                                        <span>{formatMoney(remaining)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isViewMode ? (
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    router.back();
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={onDraftClick}
                                disabled={isSubmitting}
                            >
                                Simpan Sebagai Draft
                            </Button>
                            <Button
                                type="button"
                                className="bg-orange-500 hover:bg-orange-600"
                                disabled={isSubmitting}
                                onClick={() => {
                                    form.handleSubmit((data) => {
                                        handleSubmit(data, true);
                                    })();
                                }}
                            >
                                {isSubmitting
                                    ? isEditMode
                                        ? "Finalizing..."
                                        : "Memfinalisasi..."
                                    : isEditMode
                                        ? "Update & Finalize"
                                        : "Buat Invoice"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    pembelianService
                                        .rollbackPembelian(Number(pembelianId))
                                        .then(() => {
                                            toast.success("Status pembelian berhasil terupdate");
                                            router.back();
                                        });
                                }}
                            >
                                <RefreshCw/>
                                Rollback Pembelian
                            </Button>
                            <Button
                                type="button"
                                onClick={onDraftClick}
                                disabled={isSubmitting || !isActive}
                            >
                                Simpan
                            </Button>
                        </div>
                    )}
                </form>
            </Form>

            <ItemSelectorDialog
                open={isItemDialogOpen}
                onOpenChange={setIsItemDialogOpen}
                onSelect={handleAddItem}
            />
        </div>
    );
}
