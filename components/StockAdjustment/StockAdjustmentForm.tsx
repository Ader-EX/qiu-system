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
    X,
} from "lucide-react";
import {
    cn,
    formatDateForAPI,
    formatMoney,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {SidebarHeaderBar} from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import ItemSelectorDialog from "@/components/ItemSelectorDialog";

import {Item} from "@/types/types";
import {useState, useEffect} from "react";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {NumericFormat} from "react-number-format";
import {QuickFormSearchableField} from "@/components/form/FormSearchableField";
import {AdjustmentType, stockAdjustmentService, StockAdjustmentUpdate} from "@/services/adjustmentService";

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

const stockAdjustmentSchema = z.object({
    no_adjustment: z.string().optional(),
    adjustment_type: z.enum(["IN", "OUT"], {
        required_error: "Tipe adjustment harus dipilih",
    }),
    adjustment_date: z.date({required_error: "Tanggal adjustment harus diisi"}),
    warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
    status_adjustment: z.string().optional(),
    stock_adjustment_items: z
        .array(
            z.object({
                item_id: z.number().min(1),
                qty: z.number().min(1, "Qty harus lebih dari 0"),
                sku: z.string().optional(),
                satuan_code: z.string().optional(),
                adj_price: z.number().min(0, "Harga tidak boleh negatif"),
            })
        )
        .min(1, "Minimal harus ada 1 item"),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentFormProps {
    mode: "add" | "edit" | "view";
    adjustmentId?: string;
}

export default function StockAdjustmentForm({
                                                mode,
                                                adjustmentId,
                                            }: StockAdjustmentFormProps) {
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isActive, setIsActive] = useState<boolean>(false);

    const router = useRouter();

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const form = useForm<StockAdjustmentFormData>({
        resolver: zodResolver(stockAdjustmentSchema),
        defaultValues: {
            no_adjustment: isEditMode ? "" : `-`,
            adjustment_type: "IN",
            warehouse_id: 0,
            adjustment_date: new Date(),
            stock_adjustment_items: [],
            status_adjustment: "DRAFT",
        },
        mode: "onChange",
    });

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "stock_adjustment_items",
    });

    useEffect(() => {
        if ((mode !== "edit" && mode !== "view") || !adjustmentId) return;

        const loadAdjustmentData = async () => {
            try {
                const data = await stockAdjustmentService.getStockAdjustmentById(
                    Number(adjustmentId)
                );

                const formData = {
                    no_adjustment: data.no_adjustment,
                    adjustment_type: data.adjustment_type as "IN" | "OUT",
                    adjustment_date: new Date(data.adjustment_date),
                    warehouse_id: data.warehouse_id ? Number(data.warehouse_id) : 0,
                    status_adjustment: data.status_adjustment || "DRAFT",
                    stock_adjustment_items: data.stock_adjustment_items.map((item) => ({
                        item_id: Number(item.item_id),
                        qty: Number(item.qty),
                        adj_price: Number(item.adj_price),
                    })),
                };

                setSelectedItems(
                    data.stock_adjustment_items.map((item: any) => ({
                        id: Number(item.item_id),
                        code: item.item_rel?.code ?? "",
                        name: item.item_rel?.name ?? "",
                        price: Number(item.adj_price),
                        sku: item.item_rel?.sku,
                        satuan_code: item.item_rel?.satuan_rel?.symbol,

                    }))
                );

                setIsActive(data.status_adjustment === "ACTIVE");

                form.reset(formData);

                setTimeout(() => {
                    const currentValues = form.getValues();

                    if (
                        currentValues.warehouse_id !== formData.warehouse_id &&
                        typeof formData.warehouse_id === "number"
                    ) {
                        form.setValue("warehouse_id", formData.warehouse_id, {
                            shouldValidate: true,
                            shouldDirty: false,
                        });
                    }
                }, 500);
            } catch (error: any) {
                console.error("Error loading stock adjustment data:", error);
                toast.error(error.message || "Failed to load adjustment data");
            }
        };

        loadAdjustmentData();
    }, [isEditMode, isViewMode, adjustmentId, form]);

    const watchedItems = form.watch("stock_adjustment_items") || [];

    const totalQty = watchedItems.reduce((sum, item) => {
        return sum + (Number(item?.qty) || 0);
    }, 0);

    const totalValue = watchedItems.reduce((sum, item) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.adj_price) || 0;
        return sum + qty * price;
    }, 0);

    const handleAddItem = (pickedItem: Item) => {
        const existingItemIndex = fields.findIndex(
            (field) => field.item_id === pickedItem.id
        );

        if (existingItemIndex >= 0) {
            const currentQty = form.getValues(
                `stock_adjustment_items.${existingItemIndex}.qty`
            );
            form.setValue(`stock_adjustment_items.${existingItemIndex}.qty`, currentQty + 1);
        } else {
            // Add satuan_code to the selectedItems
            setSelectedItems([...selectedItems, {
                id: pickedItem.id,
                code: pickedItem.code,
                name: pickedItem.name,
                sku: pickedItem.sku,
                price: pickedItem.price,
                satuan_code: pickedItem.satuan_rel?.symbol, // Add this line
            }]);

            append({
                item_id: pickedItem.id,
                qty: 1,
                sku: pickedItem.sku,
                satuan_code: pickedItem.satuan_rel?.symbol,
                adj_price: pickedItem.price,
            });
        }
    };
    const handleRemoveItem = (index: number) => {
        remove(index);
        const newSelectedItems = [...selectedItems];
        newSelectedItems.splice(index, 1);
        setSelectedItems(newSelectedItems);
    };

    const handleSubmit = async (
        data: StockAdjustmentFormData,
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
                adjustment_type: data.adjustment_type,
                adjustment_date: formatDateForAPI(data.adjustment_date),
                warehouse_id: Number(data.warehouse_id),
                stock_adjustment_items: data.stock_adjustment_items.map((item) => ({
                    item_id: Number(item.item_id),
                    qty: Number(item.qty),
                    sku: item.sku,
                    satuan_id: item.satuan_id,
                    adj_price: Number(item.adj_price),
                })),
            };

            let resultId: any;

            if ((isViewMode || isEditMode) && adjustmentId) {
                await stockAdjustmentService.updateStockAdjustment(
                    Number(adjustmentId),
                    apiPayload as StockAdjustmentUpdate
                );

                resultId = adjustmentId;

                toast.success("Stock Adjustment berhasil diperbarui.");

                if (finalize) {
                    await stockAdjustmentService.activateStockAdjustment(Number(resultId));
                    toast.success("Stock Adjustment berhasil diaktifkan.");
                }

                router.back();
            } else {
                const result = await stockAdjustmentService.createStockAdjustment(apiPayload);

                console.log("Create result:", result);
                resultId = result.id;
                if (!resultId) throw new Error("Failed to get ID from response.");

                if (finalize) {
                    await stockAdjustmentService.activateStockAdjustment(Number(resultId));
                    toast.success("Stock Adjustment berhasil dibuat dan diaktifkan.");
                } else {
                    toast.success("Stock Adjustment berhasil dibuat sebagai draft.");
                }

                router.back();
            }
        } catch (e: any) {
            console.error("Submit error:", e);
            toast.error(e.detail || e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
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
    const isTypeOut: boolean =
        (form.watch("adjustment_type") || "") === AdjustmentType.OUT;

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={[
                            "Stock Adjustment",
                            isEditMode ? "Edit Adjustment" : "Tambah Adjustment",
                        ]}
                        linkData={[
                            "stock-adjustment",
                            isEditMode
                                ? `stock-adjustment/edit/${adjustmentId}`
                                : "/stock-adjustment/add",
                        ]}
                    />
                }
            />
            <Form {...form}>
                <form className="space-y-6">
                    {/* Adjustment Information */}
                    <FormSection title="Informasi Adjustment">
                        <FormField
                            control={form.control}
                            name="no_adjustment"
                            disabled
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>No. Adjustment</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={true}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="adjustment_date"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Tanggal Adjustment</FormLabel>
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
                                                        <span>Pilih Tanggal</span>
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
                            name="adjustment_type"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Tipe Adjustment</FormLabel>
                                    <Select
                                        disabled={isViewMode}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Tipe"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="IN">IN</SelectItem>
                                            <SelectItem value="OUT">OUT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status_adjustment"
                            render={({field}) => (
                                <div>
                                    <Label>Status</Label>
                                    <div className="mt-2 p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">
                      {field.value || "DRAFT"}
                    </span>
                                    </div>
                                </div>
                            )}
                        />
                    </FormSection>

                    {/* Warehouse */}
                    <FormSection title="Warehouse">
                        <div className="md:col-span-2">
                            <QuickFormSearchableField
                                control={form.control}
                                name="warehouse_id"
                                type="warehouse"
                                label="Warehouse"
                                placeholder="Pilih Warehouse"
                                disabled={isViewMode}
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
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-max">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>SKU</TableHead>

                                                <TableHead>Kode Item</TableHead>
                                                <TableHead>Nama Item</TableHead>
                                                <TableHead>Satuan</TableHead>

                                                <TableHead>Qty</TableHead>
                                                <TableHead>Harga Adjustment</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fields.map((field, index) => {
                                                const qty =
                                                    Number(
                                                        form.watch(`stock_adjustment_items.${index}.qty`)
                                                    ) || 0;
                                                const price =
                                                    Number(
                                                        form.watch(`stock_adjustment_items.${index}.adj_price`)
                                                    ) || 0;
                                                const total = qty * price;

                                                return (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            {selectedItems[index]?.sku || ""}
                                                        </TableCell>

                                                        <TableCell>
                                                            {selectedItems[index]?.code || ""}
                                                        </TableCell>
                                                        <TableCell>
                                                            {selectedItems[index]?.name || ""}
                                                        </TableCell>
                                                        <TableCell>
                                                            {selectedItems[index]?.satuan_code || ""}
                                                        </TableCell>

                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`stock_adjustment_items.${index}.qty`}
                                                                render={({field}) => (
                                                                    <Input
                                                                        disabled={isViewMode || false}
                                                                        type="number"
                                                                        className="w-24"
                                                                        min={1}
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
                                                                name={`stock_adjustment_items.${index}.adj_price`}
                                                                render={({field}) => (
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        allowNegative={false}
                                                                        inputMode="decimal"
                                                                        disabled={isViewMode}
                                                                        className="w-32"
                                                                        value={field.value ?? ""}
                                                                        onValueChange={(v) => {
                                                                            field.onChange(Number(v.floatValue ?? 0));
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                              <span>
                                {formatMoney(
                                    total,
                                    "IDR",
                                    "id-ID",
                                    "nosymbol"
                                )}
                              </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                disabled={isViewMode}
                                                                variant="ghost"
                                                                size="icon"
                                                                type="button"
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

                            {/* Totals */}
                            <div className="flex w-full justify-end mt-4">
                                <div className="flex flex-col space-y-2 gap-2 w-full max-w-sm">
                                    <div className="flex justify-between">
                                        <span className={"mr-4"}>Total Qty</span>
                                        <Input
                                            type="text"
                                            disabled={true}
                                            className="w-[40%] text-right"
                                            value={totalQty}
                                        />
                                    </div>

                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Total Value</span>
                                        <span>{formatMoney(totalValue)}</span>
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
                                {isSubmitting ? "Menyimpan..." : "Simpan Sebagai Draft"}
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
                                    ? "Memfinalisasi..."
                                    : isEditMode
                                        ? "Update & Finalize"
                                        : "Buat & Aktifkan"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-4 pt-6 border-t">
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
                canDisabledBePicked={!isTypeOut}
                onOpenChange={setIsItemDialogOpen}
                onSelect={handleAddItem}
            />
        </div>
    );
}