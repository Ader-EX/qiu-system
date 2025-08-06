"use client";

import * as React from "react";
import {useForm, useFieldArray} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {CalendarIcon, Plus, Trash2, Search, X, Upload, FileText} from "lucide-react";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
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
import {Calendar} from "@/components/ui/calendar";
import {HeaderActions, SidebarHeaderBar} from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import SearchableSelect from "@/components/SearchableSelect";
import {vendorService} from "@/services/vendorService";
import {warehouseService} from "@/services/warehouseService";
import {mataUangService} from "@/services/mataUangService";
import GlobalPaginationFunction from "@/components/pagination-global";
import {customerService} from "@/services/customerService";
import ItemSelectorDialog from "@/components/ItemSelectorDialog";
import {Item} from "@/types/types";
import {useState} from "react";
import toast from "react-hot-toast";
import {pembelianService} from "@/services/pembelianService";
import {useRouter} from "next/navigation";
import {AttachmentInfo, imageService, ParentType} from "@/services/imageService";

const FormSection = ({title, children}: { title: string; children: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row w-full justify-between">
        <h4 className="text-lg font-bold mb-4 md:mb-0 md:w-[30%]">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:w-[70%]">
            {children}
        </div>
    </div>
);

const pembelianSchema = z.object({
    no_pembelian: z.string().min(1, "No. Pembelian harus diisi"),
    warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
    customer_id: z.string().min(1, "Customer harus dipilih"),
    top_id: z.number().min(1, "Jenis Pembayaran harus dipilih"),
    sales_date: z.date({
        required_error: "Sales Date harus diisi",
    }),
    sales_due_date: z.date({
        required_error: "Sales Due Date harus diisi",
    }),
    discount: z.number().min(0, "Discount tidak boleh negatif").default(0),
    additional_discount: z.number().min(0, "Additional discount tidak boleh negatif").default(0),
    expense: z.number().min(0, "Expense tidak boleh negatif").default(0),
    items: z.array(
        z.object({
            item_id: z.number().min(1, "Item harus dipilih"),
            qty: z.number().min(1, "Quantity harus lebih dari 0"),
            unit_price: z.number().min(0, "Unit price tidak boleh negatif"),
            tax_percentage: z.number().min(0, "Tax percentage tidak boleh negatif").default(10),
            price_before_tax: z.number().min(0, "Price before tax tidak boleh negatif"),
        })
    ).min(1, "Minimal harus ada 1 item"),
});

type PembelianFormData = z.infer<typeof pembelianSchema>;

export default function PembelianForm() {
    const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [selectedItem, setSelectedItem] = useState<Item[]>([]);
    const [attachments, setAttachments] = React.useState<AttachmentInfo[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadedAttachmentIds, setUploadedAttachmentIds] = React.useState<number[]>([]);

    const form = useForm<PembelianFormData>({
        resolver: zodResolver(pembelianSchema),
        defaultValues: {
            no_pembelian: `KP-${Math.floor(Math.random() * 100000)}`,
            discount: 0,
            additional_discount: 0,
            expense: 0,
            items: [],
        },
    });

    const router = useRouter();

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchedItems = form.watch("items");
    const watchedDiscount = form.watch("discount");
    const watchedAdditionalDiscount = form.watch("additional_discount");
    const watchedExpense = form.watch("expense");

    // Calculate subtotal from items (before tax)
    const subTotal = watchedItems.reduce(
        (sum, item) => sum + (item.qty * (item.price_before_tax || 0)),
        0
    );

    // Calculate total tax amount
    const totalTax = watchedItems.reduce(
        (sum, item) => {
            const beforeTax = item.price_before_tax || 0;
            const taxAmount = (beforeTax * (item.tax_percentage || 0)) / 100;
            return sum + (item.qty * taxAmount);
        },
        0
    );

    const discountAmount = (subTotal * (watchedDiscount || 0)) / 100;
    const totalAfterDiscount = subTotal - discountAmount - (watchedAdditionalDiscount || 0);
    const grandTotal = totalAfterDiscount + totalTax + (watchedExpense || 0);

    const handleAddItem = (pickedItem: Item) => {
        const existingItemIndex = fields.findIndex(
            (field) => field.item_id === pickedItem.id
        );

        if (existingItemIndex >= 0) {
            const currentQty = form.getValues(`items.${existingItemIndex}.qty`);
            form.setValue(`items.${existingItemIndex}.qty`, currentQty + 1);
        } else {
            const priceBeforeTax = pickedItem.price;
            const taxPercentage = 10; // Default 10%
            const taxAmount = (priceBeforeTax * taxPercentage) / 100;
            const unitPriceWithTax = priceBeforeTax + taxAmount;

            setSelectedItem([...selectedItem, pickedItem]);

            append({
                item_id: pickedItem.id,
                qty: 1,
                unit_price: unitPriceWithTax, // This is what goes to API
                tax_percentage: taxPercentage,
                price_before_tax: priceBeforeTax,
            });
        }
    };

    const handleTaxChange = (index: number, newTaxPercentage: number) => {
        const priceBeforeTax = form.getValues(`items.${index}.price_before_tax`);
        const taxAmount = (priceBeforeTax * newTaxPercentage) / 100;
        const newUnitPrice = priceBeforeTax + taxAmount;

        form.setValue(`items.${index}.tax_percentage`, newTaxPercentage);
        form.setValue(`items.${index}.unit_price`, newUnitPrice);
    };

    const handlePriceBeforeTaxChange = (index: number, newPriceBeforeTax: number) => {
        const taxPercentage = form.getValues(`items.${index}.tax_percentage`);
        const taxAmount = (newPriceBeforeTax * taxPercentage) / 100;
        const newUnitPrice = newPriceBeforeTax + taxAmount;

        form.setValue(`items.${index}.price_before_tax`, newPriceBeforeTax);
        form.setValue(`items.${index}.unit_price`, newUnitPrice);
    };
    const handleRemoveAttachment = async (attachmentId: number) => {
        try {
            await imageService.deleteAttachment(attachmentId);
            setAttachments(prev => prev.filter(att => att.id !== attachmentId));
            setUploadedAttachmentIds(prev => prev.filter(id => id !== attachmentId));
            toast.success("Attachment removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove attachment");
        }
    };


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validationError = imageService.validateFile(file, ['application/pdf'], 2);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsUploading(true);
        try {
            const response = await imageService.uploadImage({
                file,
                parent_type: ParentType.PEMBELIANS,
                parent_id: 0
            });


            const newAttachment: AttachmentInfo = {
                id: response.attachment_id,
                parent_type: ParentType.PEMBELIANS,
                filename: file.name,
                file_path: response.file_path,
                file_size: file.size,
                mime_type: file.type,
                created_at: new Date().toISOString(),
                url: response.url
            };

            setAttachments(prev => [...prev, newAttachment]);
            setUploadedAttachmentIds(prev => [...prev, response.attachment_id]);
            toast.success("File uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload file");
        } finally {
            setIsUploading(false);

            event.target.value = '';
        }
    };

    const handleSubmit = async (data: PembelianFormData, finalize: boolean = false) => {
        setIsSubmitting(true);
        try {
            const apiPayload = {
                no_pembelian: data.no_pembelian,
                warehouse_id: data.warehouse_id,
                customer_id: data.customer_id,
                top_id: data.top_id,
                sales_date: data.sales_date.toISOString(),
                sales_due_date: data.sales_due_date.toISOString(),
                discount: data.discount,
                additional_discount: data.additional_discount,
                expense: data.expense,
                items: data.items.map(item => ({
                    item_id: item.item_id,
                    qty: item.qty,
                    unit_price: item.unit_price,
                })),
                attachment_ids: uploadedAttachmentIds // Include attachment IDs
            };

            try {
                const result = await pembelianService.createPembelian(apiPayload);

                if (finalize) {
                    await pembelianService.finalizePembelian(result.id);
                    toast.success(`Pembelian telah sukses dibuat`);
                } else {
                    toast.success(`Pembelian telah sukses disimpan`);
                }

                form.reset({
                    no_pembelian: `KP-${Math.floor(Math.random() * 100000)}`,
                    discount: 0,
                    additional_discount: 0,
                    expense: 0,
                    items: [],
                });
                setSelectedItem([]);
                setAttachments([]);
                setUploadedAttachmentIds([]);
                router.back();
            } catch (e: any) {
                toast.error(e?.message || "Error creating pembelian");
            }
        } catch (error: any) {
            toast.error(error?.message || "Error creating pembelian");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleRemoveItem = (index: number) => {
        remove(index);
        const newSelectedItems = [...selectedItem];
        newSelectedItems.splice(index, 1);
        setSelectedItem(newSelectedItems);
    };

    return (
        <div className="space-y-6 ">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={["Pembelian", "Tambah Pembelian"]}
                        linkData={["pembelian", "add"]}
                    />
                }

            />
            <Form {...form}>
                <form className="space-y-6">
                    {/* Purchase Information */}
                    <FormSection title={"Informasi Pembelian"}>
                        <FormField
                            control={form.control}
                            name="no_pembelian"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>No. Pembelian</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                                disabled={(date: Date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div>
                            <Label>Status</Label>
                            <div className="mt-2 p-2 bg-muted rounded">
                                <span className="text-sm text-muted-foreground">DRAFT / ACTIVE</span>
                            </div>
                        </div>

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
                                                disabled={(date: Date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    <FormSection title={"Gudang & Customer"}>
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Customer"
                                        placeholder="Pilih Customer"
                                        value={field.value}
                                        onChange={field.onChange}
                                        fetchData={(search) => customerService.getAllCustomers({
                                            page: 0,
                                            rowsPerPage: 5,
                                            search_key: search
                                        })}
                                        renderLabel={(item: any) => `${item.id} - ${item.name} (${item?.curr_rel?.symbol})`}
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
                                        value={field.value}
                                        onChange={(value) => field.onChange(Number(value))}
                                        fetchData={(search) => warehouseService.getAllWarehouses({
                                            skip: 0,
                                            limit: 5,
                                            search: search
                                        })}
                                        renderLabel={(item: any) => item.name}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    <FormSection title={"Informasi Pembayaran"}>
                        <FormField
                            control={form.control}
                            name="top_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Jenis Pembayaran"
                                        placeholder="Pilih Jenis Pembayaran"
                                        value={field.value}
                                        onChange={(value) => field.onChange(Number(value))}
                                        fetchData={(search) => mataUangService.getAllMataUang({
                                            skip: 0,
                                            limit: 5,
                                            search: search
                                        })}
                                        renderLabel={(item: any) => `${item.symbol} - ${item.name}`}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="discount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Discount (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div>
                            <Label>Status Pembayaran</Label>
                            <div className="mt-2 p-2 bg-muted rounded">
                                <span className="text-sm text-muted-foreground">UNPAID</span>
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title={"Lampiran"}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Attachment</Label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="relative"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Upload className="h-4 w-4 mr-2 animate-spin"/>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2"/>
                                                Choose file
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-muted-foreground">
                    {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'select attachment'}
                </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Maks. ukuran file 2 MB. Format: PDF
                                </p>
                            </div>

                            {/* Display uploaded attachments */}
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Uploaded Files</Label>
                                    <div className="space-y-2">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-5 w-5 text-red-500"/>
                                                    <div>
                                                        <p className="text-sm font-medium">{attachment.filename}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(attachment.file_size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(attachment.url, '_blank')}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveAttachment(attachment.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormSection>
                    <div className={"flex w-full justify-between items-center"}>
                        <CardTitle className={"text-lg"}>Detail Item</CardTitle>
                        <Button
                            type="button"
                            onClick={() => setIsItemDialogOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Item
                        </Button>
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
                                        <TableHead>Harga Sebelum Pajak</TableHead>
                                        <TableHead>Pajak (%)</TableHead>
                                        <TableHead>Harga Setelah Pajak</TableHead>
                                        <TableHead>Sub Total</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const item = watchedItems[index];
                                        const subTotal = (item?.qty || 0) * (item?.unit_price || 0);

                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell>{selectedItem[index]?.id || ''}</TableCell>
                                                <TableCell>{selectedItem[index]?.name || ''}</TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.qty`}
                                                        render={({field}) => (
                                                            <Input
                                                                type="number"
                                                                className="w-20"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                                                type="number"
                                                                className="w-32"
                                                                {...field}
                                                                onChange={(e) => handlePriceBeforeTaxChange(index, Number(e.target.value))}
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
                                                                type="number"
                                                                className="w-20"
                                                                {...field}
                                                                onChange={(e) => handleTaxChange(index, Number(e.target.value))}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {item?.unit_price?.toFixed(2) || "0.00"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium">
                                                        {subTotal.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
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
                                        <span>Sub Total (Before Tax)</span>
                                        <span>Rp {subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount ({watchedDiscount}%)</span>
                                        <span>Rp {discountAmount.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Additional Discount</span>
                                        <FormField
                                            control={form.control}
                                            name="additional_discount"
                                            render={({field}) => (
                                                <Input
                                                    type="number"
                                                    className="w-32 text-right"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total (After Discount)</span>
                                        <span>Rp {totalAfterDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>Rp {totalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Expense</span>
                                        <FormField
                                            control={form.control}
                                            name="expense"
                                            render={({field}) => (
                                                <Input
                                                    type="number"
                                                    className="w-32 text-right"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Grand Total</span>
                                        <span>Rp {grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4">
                        <Button type={"button"} variant={"outline"} onClick={() => {
                            router.back()
                        }}>Batal</Button>
                        <Button
                            type="button"
                            variant="blue"
                            disabled={isSubmitting}
                            onClick={form.handleSubmit((data) => handleSubmit(data, false))}
                        >
                            {isSubmitting ? "Menyimpan..." : "Simpan Sebagai Draft"}
                        </Button>
                        <Button
                            type="button"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={isSubmitting}
                            onClick={form.handleSubmit((data) => handleSubmit(data, true))}
                        >
                            {isSubmitting ? "Memfinalisasi..." : "Buat Invoice"}
                        </Button>
                    </div>
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