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
import {
    cn,
    formatDateForAPI,
    formatMoney,
    roundToPrecision,
} from "@/lib/utils";

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
import ItemSelectorDialog from "@/components/ItemSelectorDialog";
import {FileUploadButton} from "@/components/ImageUpload";

import {imageService, ParentType} from "@/services/imageService";
import {Item} from "@/types/types";
import {useState, useEffect, useMemo} from "react";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {
    Attachment,
    penjualanService,
    PenjualanUpdate,
} from "@/services/penjualanService";
import {usePrintInvoice} from "@/hooks/usePrintInvoice";
import {NumericFormat} from "react-number-format";
import {calcRowTotalData} from "@/services/pembelianService";
import {debounce} from "lodash";
import {QuickFormSearchableField} from "@/components/form/FormSearchableField";

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

const penjualanSchema = z.object({
    no_penjualan: z.string().optional(),
    warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
    customer_id: z.number().min(1, "Customer harus dipilih"),
    kode_lambung_id: z.number().min(1, "Kode Lambung harus diisi"),
    top_id: z.number().min(1, "Jenis Pembayaran harus dipilih"),
    sales_date: z.date({required_error: "Sales Date harus diisi"}),
    sales_due_date: z.date({required_error: "Sales Due Date harus diisi"}),
    currency_amount: z
        .number({required_error: "Currency harus diisi"})
        .min(0.01)
        .default(1),
    additional_discount: z.number().min(0).default(0),
    expense: z.number().min(0).default(0),
    items: z
        .array(
            z.object({
                item_id: z.number().min(1),
                qty: z.number().min(1),
                unit_price: z.number().min(0),
                unit_price_rmb: z.number().min(0),
                tax_percentage: z.number().min(0).max(100).default(10),
                discount: z.number().min(0).default(0),
            })
        )
        .min(1),
    attachments: z.array(z.instanceof(File)).optional(),
    status_pembayaran: z.string().optional(),
    status_penjualan: z.string().optional(),
});

type PenjualanFormData = z.infer<typeof penjualanSchema>;

interface PenjualanFormProps {
    mode: "add" | "edit" | "view";
    penjualanId?: string;
}

export default function PenjualanForm({
                                          mode,
                                          penjualanId,
                                      }: PenjualanFormProps) {
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [totalPaid, setTotalPaid] = useState<number>(0);
    const [totalReturn, setTotalReturn] = useState<number>(0);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
        []
    );
    const [isActive, setIsActive] = useState<boolean>(true);
    const [activeFields, setActiveFields] = useState({
        customer_id: false,
        warehouse_id: false,
        top_id: false,
    });
    const [loadedData, setLoadedData] = useState({
        customer_name: "",
        customer_code: "",
        warehouse_name: "",
        top_name: "",
        top_code: ""
    });

    const router = useRouter();

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const form = useForm<PenjualanFormData>({
        resolver: zodResolver(penjualanSchema),
        defaultValues: {
            no_penjualan: isEditMode ? "" : `-`,
            warehouse_id: 0,
            customer_id: 0,
            kode_lambung_id: 0,
            top_id: 0,
            currency_amount: 1,
            additional_discount: 0,
            expense: 0,
            items: [],
            attachments: [],
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (isEditMode) {
            const subscription = form.watch((value, {name}) => {
                if (name?.includes("tax_percentage")) {
                    // debug watcher like PembelianForm
                    // console.log(`[Form Watch] ${name} changed:`, value);
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [form.watch, isEditMode]);

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "items",
    });

    const {isPrinting} = usePrintInvoice();

    const currencyAmount = form.watch("currency_amount") || 1;

    const convertRMBToIDR = (rmbPrice: number, currencyRate: number) => {
        return roundToPrecision(rmbPrice * currencyRate);
    };

    const convertIDRToRMB = (idrPrice: number, currencyRate: number) => {
        return roundToPrecision(idrPrice / currencyRate);
    };

    const debouncedConvertIDRToRMB = useMemo(
        () =>
            debounce((index: number, idrPrice: number, currencyRate: number) => {
                if (currencyRate > 0) {
                    const rmbPrice = convertIDRToRMB(idrPrice, currencyRate);
                    form.setValue(`items.${index}.unit_price_rmb`, rmbPrice, {
                        shouldValidate: false,
                        shouldDirty: true,
                    });
                }
            }, 300),
        [form]
    );

    const debouncedConvertRMBToIDR = useMemo(
        () =>
            debounce((index: number, rmbPrice: number, currencyRate: number) => {
                if (currencyRate > 0) {
                    const idrPrice = convertRMBToIDR(rmbPrice, currencyRate);
                    form.setValue(`items.${index}.unit_price`, idrPrice, {
                        shouldValidate: false,
                        shouldDirty: true,
                    });
                }
            }, 300),
        [form]
    );

    useEffect(() => {
        if ((mode !== "edit" && mode !== "view") || !penjualanId) return;

        const loadPenjualanData = async () => {
            try {
                const data = await penjualanService.getById(Number(penjualanId));

                const formData: PenjualanFormData = {
                    no_penjualan: data.no_penjualan,
                    warehouse_id: Number(data.warehouse_id),
                    customer_id: Number(data.customer_id),
                    top_id: Number(data.top_id),
                    sales_date: new Date(data.sales_date),
                    sales_due_date: new Date(data.sales_due_date),
                    currency_amount: Number(data.currency_amount),
                    kode_lambung_id: Number(data.kode_lambung?.id || 0),
                    additional_discount: Number(data.additional_discount ?? 0),
                    expense: Number(data.expense ?? 0),
                    status_pembayaran: data.status_pembayaran || "UNPAID",
                    status_penjualan: data.status_penjualan || "DRAFT",
                    items: data.penjualan_items.map((item: any) => ({
                        item_id: Number(item.item_id),
                        qty: Number(item.qty),
                        unit_price: Number(item.unit_price),
                        unit_price_rmb: Number(item.unit_price_rmb),
                        discount: Number(item.discount ?? 0),
                        tax_percentage: Number(item.tax_percentage ?? 10),
                    })),
                    attachments: [],
                };

                // Select list visual data
                setSelectedItems(
                    data.penjualan_items.map((item: any) => ({
                        id: Number(item.item_id),
                        code: item.item_code ?? item.item_rel?.code ?? item.code ?? "",
                        name: item.item_name ?? item.item_rel?.name ?? "",
                        price: Number(item.unit_price),
                    }))
                );

                setTotalPaid(Number(data.total_paid || 0));
                setTotalReturn(Number(data.total_return || 0));
                setIsActive(
                    data.status_penjualan === "ACTIVE" ||
                    data.status_penjualan === "DRAFT"
                );
                setExistingAttachments(data.attachments || []);

                // Store loaded names for display
                setLoadedData({
                    customer_name: data.customer_name || "",
                    customer_code: data.customer_rel.code || "",
                    warehouse_name: data.warehouse_name || "",
                    top_code: data.top_rel.symbol || "",
                    top_name: data.top_name || "",
                });

                form.reset(formData);
            } catch (error: any) {
                toast.error(error.message || "Failed to load sales data");
            }
        };

        loadPenjualanData();
    }, [isEditMode, isViewMode, penjualanId]);

    const watchedItems = form.watch("items") || [];
    const rows = watchedItems.map((it) => {
        const qty = Number(it?.qty ?? 0);
        const unit = Number(it?.unit_price ?? 0);
        const taxPct = Number(it?.tax_percentage ?? 0);
        const discount = Number(it?.discount ?? 0);

        const {
            subTotal: rowSubTotal,
            taxableBase,
            tax: rowTax,
            total: rowTotal,
        } = calcRowTotalData(qty, unit, taxPct, discount);

        return {
            qty,
            unit,
            taxPct,
            discount,
            rowSubTotal,
            taxableBase,
            rowTax,
            rowTotal,
        };
    });

    const additionalDiscount = Number(form.watch("additional_discount") || 0);
    const expense = Number(form.watch("expense") || 0);

    const subTotal = rows.reduce((s, r) => s + r.rowSubTotal, 0);
    const totalItemDiscounts = rows.reduce((s, r) => s + r.discount, 0);
    const subtotalAfterItemDiscounts = Math.max(subTotal - totalItemDiscounts, 0);

    const finalTotalBeforeTax = Math.max(
        subtotalAfterItemDiscounts - additionalDiscount,
        0
    );

    const totalTax = rows.reduce((s, r) => s + r.rowTax, 0);
    const total = Math.max(subTotal - totalItemDiscounts, 0);
    const grandTotal = finalTotalBeforeTax + totalTax + expense;


    const remaining = grandTotal - (totalPaid + totalReturn);

    const totalBeforeDiscount = Math.max(subTotal - totalItemDiscounts, 0);
    const baseForAdditionalDiscount = totalBeforeDiscount;
    const clampedAdditionalDiscount = Math.min(
        Math.max(additionalDiscount, 0),
        baseForAdditionalDiscount
    );
    const additionalDiscountPercentage =
        baseForAdditionalDiscount > 0
            ? roundToPrecision(
                (clampedAdditionalDiscount / baseForAdditionalDiscount) * 100
            )
            : 0;

    const handleAddItem = (pickedItem: Item) => {
        const existingItemIndex = fields.findIndex(
            (field) => field.item_id === pickedItem.id
        );

        if (existingItemIndex >= 0) {
            const currentQty = form.getValues(`items.${existingItemIndex}.qty`);
            form.setValue(`items.${existingItemIndex}.qty`, currentQty + 1);
        } else {
            setSelectedItems([...selectedItems, pickedItem]);

            const currentCurrency = currencyAmount || 1;
            const rmbPrice =
                currentCurrency > 0
                    ? convertIDRToRMB(pickedItem.price, currentCurrency)
                    : 0;

            append({
                item_id: pickedItem.id,
                qty: 1,
                unit_price: pickedItem.price,
                unit_price_rmb: rmbPrice,
                discount: 0,
                tax_percentage: 10,
            });
        }
    };

    const handleRemoveItem = (index: number) => {
        remove(index);
        const newSelectedItems = [...selectedItems];
        newSelectedItems.splice(index, 1);
        setSelectedItems(newSelectedItems);
    };

    const handleRemoveExistingAttachment = async (attachmentId: number) => {
        if (!penjualanId) return;
        try {
            await penjualanService.deleteAttachment(penjualanId, attachmentId);
            setExistingAttachments((prev) =>
                prev.filter((att) => att.id !== attachmentId)
            );
            toast.success("Attachment berhasil dihapus");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove attachment");
        }
    };

    const handleAttachmentUpload = async (attachments: any, parentId: number) => {
        if (!attachments) return;
        try {
            let filesToUpload: File[] = [];
            if (attachments instanceof File) filesToUpload = [attachments];
            else if (attachments instanceof FileList)
                filesToUpload = Array.from(attachments);
            else if (Array.isArray(attachments))
                filesToUpload = attachments.filter((f) => f instanceof File);
            else return;

            await Promise.allSettled(
                filesToUpload.map(async (file) => {
                    const validationError = imageService.validateFile(file);
                    if (validationError)
                        throw new Error(`File "${file.name}": ${validationError}`);
                    return imageService.uploadImage({
                        file,
                        parent_type: ParentType.PENJUALANS,
                        parent_id: parentId,
                    });
                })
            );
        } catch (error: any) {
            toast.error(
                `Attachment upload failed: ${error?.detail || error?.message}`
            );
        }
    };

    const handleSubmit = async (data: PenjualanFormData, finalize = false) => {
        setIsSubmitting(true);
        try {
            const isValid = await form.trigger();
            if (!isValid) {
                toast.error("Data Anda belum lengkap");
                return;
            }

            const apiPayload = {
                no_penjualan: data.no_penjualan || `-`,
                warehouse_id: Number(data.warehouse_id),
                customer_id: Number(data.customer_id),
                top_id: Number(data.top_id),
                kode_lambung_id: Number(data.kode_lambung_id),
                sales_date: formatDateForAPI(data.sales_date),
                sales_due_date: formatDateForAPI(data.sales_due_date),
                additional_discount: Number(data.additional_discount || 0),
                currency_amount: Number(data.currency_amount || 0),
                expense: Number(data.expense || 0),
                items: data.items.map((item) => ({
                    item_id: Number(item.item_id),
                    qty: Number(item.qty),
                    unit_price: Number(item.unit_price),
                    unit_price_rmb: Number(item.unit_price_rmb),
                    tax_percentage: Number(item.tax_percentage),
                    discount: Number(item.discount || 0),
                })),
            };

            let resultId: any;

            if ((isViewMode || isEditMode) && penjualanId) {
                await penjualanService.updatePenjualan(
                    penjualanId,
                    apiPayload as PenjualanUpdate
                );
                resultId = penjualanId;
                await handleAttachmentUpload(data.attachments, Number(resultId));
                toast.success("Sales berhasil diperbarui");
                if (finalize) await penjualanService.finalizePenjualan(resultId);
                router.back();
            } else {
                const result = await penjualanService.createPenjualan(apiPayload);
                resultId = result.id;
                if (!resultId) throw new Error("Failed to get ID from response.");
                await handleAttachmentUpload(data.attachments, Number(resultId));
                if (finalize) await penjualanService.finalizePenjualan(resultId);
                toast.success("Penjualan Berhasil dibuat");
                router.back();
            }
        } catch (e: any) {
            console.error("Submit error:", e);
            toast.error(e?.detail || e?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDraftClick = form.handleSubmit(
        (data) => handleSubmit(data, false),
        () => toast.error("Silahkan penuhi data Anda terlebih dahulu")
    );

    const handleTaxPercentageChange = (index: number, newValue: number) => {
        form.setValue(`items.${index}.tax_percentage`, newValue);

        const currentItems = form.getValues("items");
        currentItems.forEach((_, itemIndex) => {
            if (itemIndex !== index) {
                form.setValue(`items.${itemIndex}.tax_percentage`, newValue);
            }
        });
    };

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={[
                            "Penjualan",
                            isEditMode ? "Edit Penjualan" : "Tambah Penjualan",
                        ]}
                        linkData={[
                            "penjualan",
                            isEditMode ? `penjualan/edit/${penjualanId}` : "/penjualan/add",
                        ]}
                    />
                }
            />

            <Form {...form}>
                <form className="space-y-6">
                    <FormSection title="Informasi Penjualan">
                        <FormField
                            control={form.control}
                            name="no_penjualan"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>No. Penjualan</FormLabel>
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
                                    <FormLabel>
                                        Sales Date <span className="text-red-500">*</span>
                                    </FormLabel>
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
                            name="status_penjualan"
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
                                    <FormLabel>
                                        Sales Due Date <span className="text-red-500">*</span>
                                    </FormLabel>
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

                    <FormSection title="Gudang & Customer">
                        {!activeFields.customer_id && (isEditMode || isViewMode) ? (
                            <div>
                                <Label>Customer <span className="text-red-500">*</span></Label>
                                <div
                                    className={cn(
                                        "mt-2 p-2 bg-background border rounded-md min-h-10 flex items-center",
                                        !isViewMode && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => !isViewMode && setActiveFields(prev => ({
                                        ...prev,
                                        customer_id: true
                                    }))}
                                >
                                    <span className="text-sm">
                                        {loadedData.customer_code || "-"} - {loadedData.customer_name || "-"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <QuickFormSearchableField
                                control={form.control}
                                name="customer_id"
                                type="customer"
                                isRequired={true}
                                label="Customer"
                                placeholder="Pilih Customer"
                                disabled={isViewMode}
                            />
                        )}

                        <QuickFormSearchableField
                            control={form.control}
                            name="kode_lambung_id"
                            isRequired={true}
                            type="kodelambung"
                            label="Kode Lambung"
                            placeholder="Pilih Kode Lambung"
                            disabled={isViewMode}
                            dynamicParam={form.watch("customer_id")}
                            watchField="customer_id"
                            showCondition={(customerId) =>
                                customerId && customerId !== 0
                            }
                        />

                        {!activeFields.warehouse_id && (isEditMode || isViewMode) ? (
                            <div>
                                <Label>Warehouse <span className="text-red-500">*</span></Label>
                                <div
                                    className={cn(
                                        "mt-2 p-2 bg-background border rounded-md min-h-10 flex items-center",
                                        !isViewMode && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => !isViewMode && setActiveFields(prev => ({
                                        ...prev,
                                        warehouse_id: true
                                    }))}
                                >
                                    <span className="text-sm">
                                        {loadedData.warehouse_name || "-"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <QuickFormSearchableField
                                control={form.control}
                                name="warehouse_id"
                                type="warehouse"
                                isRequired={true}
                                label="Warehouse"
                                placeholder="Pilih Warehouse"
                                disabled={isViewMode}
                            />
                        )}
                    </FormSection>

                    <FormSection title="Informasi Pembayaran">
                        {!activeFields.top_id && (isEditMode || isViewMode) ? (
                            <div>
                                <Label>Jenis Pembayaran <span className="text-red-500">*</span></Label>
                                <div
                                    className={cn(
                                        "mt-2 p-2 bg-background border rounded-md min-h-10 flex items-center",
                                        !isViewMode && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => !isViewMode && setActiveFields(prev => ({...prev, top_id: true}))}
                                >
                                    <span className="text-sm">
                                        {loadedData.top_code || ""} - {loadedData.top_name || ""}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <QuickFormSearchableField
                                control={form.control}
                                name="top_id"
                                type="payment_type"
                                isRequired={true}
                                disabled={isViewMode}
                                label="Jenis Pembayaran"
                                placeholder="Pilih Jenis Pembayaran"
                            />
                        )}

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
                        <FormField
                            control={form.control}
                            name="currency_amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Currency <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <NumericFormat
                                            customInput={Input}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            allowNegative={false}
                                            inputMode="decimal"
                                            disabled={isViewMode}
                                            placeholder="1.00"
                                            prefix="Rp"
                                            value={field.value ?? ""}
                                            onValueChange={(values) => {
                                                const numericValue = Number(values.floatValue ?? 1);
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>

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
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            penjualanService.triggerDownload(
                                                                penjualanId!,
                                                                att.id,
                                                                att.filename
                                                            );
                                                        }}
                                                        className="text-sm font-medium hover:underline truncate text-left"
                                                    >
                                                        {att.filename}
                                                    </button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type={"button"}
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

                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="attachments"
                                render={({field}) => (
                                    <>
                                        <FormItem>
                                            <FormLabel>
                                                {isEditMode ? "Add New Attachments" : ""}
                                            </FormLabel>
                                            <FormControl>
                                                <FileUploadButton
                                                    value={field.value || []}
                                                    onChangeAction={field.onChange}
                                                    maxFiles={3}
                                                    maxSizeMB={4}
                                                    accept={{"application/pdf": [".pdf"]}}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                        {(isEditMode || isViewMode) &&
                                            penjualanId &&
                                            field.value &&
                                            field.value.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-2"
                                                    disabled={isSubmitting}
                                                    onClick={async () => {
                                                        setIsSubmitting(true);
                                                        try {
                                                            await handleAttachmentUpload(
                                                                field.value,
                                                                Number(penjualanId)
                                                            );
                                                            toast.success(
                                                                "Attachments uploaded successfully"
                                                            );
                                                            field.onChange([]);
                                                            const data = await penjualanService.getById(
                                                                Number(penjualanId)
                                                            );
                                                            setExistingAttachments(data.attachments || []);
                                                        } catch (error: any) {
                                                            toast.error(
                                                                error.message || "Failed to upload attachments"
                                                            );
                                                        } finally {
                                                            setIsSubmitting(false);
                                                        }
                                                    }}
                                                >
                                                    Upload Attachments Only
                                                </Button>
                                            )}
                                    </>
                                )}
                            />
                        </div>
                    </FormSection>

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
                            <div className="w-full overflow-x-auto ">
                                <div className="min-w-max">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item Code</TableHead>
                                                <TableHead>Nama Item</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Harga (RMB)</TableHead>
                                                <TableHead>Harga (IDR)</TableHead>
                                                <TableHead>Sub Total</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>DPP</TableHead>
                                                <TableHead>Pajak (%)</TableHead>
                                                <TableHead>
                                                    Harga pajak (
                                                    {Number(form.watch(`items.0.tax_percentage`)) || 0}%)
                                                </TableHead>
                                                <TableHead>Grand Total</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fields.map((field, index) => {
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
                                                                name={`items.${index}.unit_price_rmb`}
                                                                render={({field}) => (
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        allowNegative={false}
                                                                        inputMode="decimal"
                                                                        disabled={isViewMode}
                                                                        value={field.value ?? ""}
                                                                        onValueChange={(values) => {
                                                                            const rmbPrice = Number(
                                                                                values.floatValue ?? 0
                                                                            );
                                                                            field.onChange(rmbPrice);
                                                                            debouncedConvertRMBToIDR(
                                                                                index,
                                                                                rmbPrice,
                                                                                currencyAmount
                                                                            );
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${index}.unit_price`}
                                                                render={({field}) => (
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        allowNegative={false}
                                                                        inputMode="decimal"
                                                                        disabled={isViewMode}
                                                                        value={field.value ?? ""}
                                                                        onValueChange={(values) => {
                                                                            const idrPrice = Number(
                                                                                values.floatValue ?? 0
                                                                            );
                                                                            field.onChange(idrPrice);
                                                                            debouncedConvertIDRToRMB(
                                                                                index,
                                                                                idrPrice,
                                                                                currencyAmount
                                                                            );
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                              <span>
                                {(() => {
                                    const qty =
                                        Number(form.watch(`items.${index}.qty`)) ||
                                        0;
                                    const unitPrice =
                                        Number(
                                            form.watch(`items.${index}.unit_price`)
                                        ) || 0;
                                    return formatMoney(
                                        qty * unitPrice,
                                        "IDR",
                                        "id-ID",
                                        "nosymbol"
                                    );
                                })()}
                              </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${index}.discount`}
                                                                render={({field}) => (
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        allowNegative={false}
                                                                        inputMode="decimal"
                                                                        disabled={isViewMode || false}
                                                                        value={field.value ?? ""}
                                                                        onValueChange={(e) =>
                                                                            field.onChange(Number(e.floatValue ?? 0))
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                              <span>
                                {(() => {
                                    const qty =
                                        Number(form.watch(`items.${index}.qty`)) ||
                                        0;
                                    const discount =
                                        Number(
                                            form.watch(`items.${index}.discount`)
                                        ) || 0;
                                    const unitPrice =
                                        Number(
                                            form.watch(`items.${index}.unit_price`)
                                        ) || 0;
                                    return formatMoney(
                                        qty * unitPrice - discount,
                                        "IDR",
                                        "id-ID",
                                        "nosymbol"
                                    );
                                })()}
                              </span>
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
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const newTaxPercentage =
                                                                                Number(e.target.value) || 0;
                                                                            handleTaxPercentageChange(
                                                                                index,
                                                                                newTaxPercentage
                                                                            );
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                              <span>
                                {(() => {
                                    const unitPrice =
                                        Number(
                                            form.watch(`items.${index}.unit_price`)
                                        ) || 0;
                                    const qty =
                                        Number(form.watch(`items.${index}.qty`)) ||
                                        0;
                                    const discount =
                                        Number(
                                            form.watch(`items.${index}.discount`)
                                        ) || 0;
                                    const taxPercentage =
                                        Number(
                                            form.watch(
                                                `items.${index}.tax_percentage`
                                            )
                                        ) || 0;

                                    const subtotalAfterDiscount =
                                        unitPrice * qty - discount;
                                    const taxAmount =
                                        subtotalAfterDiscount *
                                        (taxPercentage / 100);

                                    return formatMoney(
                                        taxAmount,
                                        "IDR",
                                        "id-ID",
                                        "nosymbol"
                                    );
                                })()}
                              </span>
                                                        </TableCell>

                                                        <TableCell>
                              <span>
                                {(() => {
                                    const unitPrice =
                                        Number(
                                            form.watch(`items.${index}.unit_price`)
                                        ) || 0;
                                    const qty =
                                        Number(form.watch(`items.${index}.qty`)) ||
                                        0;
                                    const taxPercentage =
                                        Number(
                                            form.watch(
                                                `items.${index}.tax_percentage`
                                            )
                                        ) || 0;
                                    const discount =
                                        Number(
                                            form.watch(`items.${index}.discount`)
                                        ) || 0;
                                    const priceBeforeTax =
                                        unitPrice * qty - discount;

                                    const grandTotal =
                                        priceBeforeTax * (1 + taxPercentage / 100);
                                    return formatMoney(
                                        grandTotal,
                                        "IDR",
                                        "id-ID",
                                        "nosymbol"
                                    );
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
                                </div>
                            </div>

                            <div className="flex w-full justify-end mt-4">
                                <div className="flex flex-col space-y-2 gap-2 w-full max-w-sm">
                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Sub Total</span>
                                        <Input
                                            type="text"
                                            disabled={true}
                                            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                            className="w-[40%] text-right"
                                            value={formatMoney(subTotal) || 0}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Discount</span>
                                        <Input
                                            type="text"
                                            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                            disabled={true}
                                            className="w-[40%] text-right"
                                            value={formatMoney(totalItemDiscounts) || 0}
                                        />
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
                                                <NumericFormat
                                                    customInput={Input}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    className="w-[40%] text-right"
                                                    allowNegative={false}
                                                    inputMode="decimal"
                                                    disabled={isViewMode || false}
                                                    value={field.value ?? ""}
                                                    onValueChange={(e) =>
                                                        field.onChange(Number(e.floatValue ?? 0))
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
                                onClick={() => router.back()}
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
                                    form.handleSubmit((data) => handleSubmit(data, true))();
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
                                    penjualanService
                                        .rollbackPenjualan(Number(penjualanId))
                                        .then(() => {
                                            toast.success("Status penjualan berhasil terupdate");
                                            router.back();
                                        });
                                }}
                            >
                                <RefreshCw/>
                                Rollback Penjualan
                            </Button>
                            <Button
                                type="button"
                                onClick={onDraftClick}
                                disabled={isSubmitting}
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