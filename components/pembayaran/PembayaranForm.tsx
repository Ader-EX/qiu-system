"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {CalendarIcon, FileText, Plus, RefreshCw, Search, Trash2, X,} from "lucide-react";
import {cn, formatMoney} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

import {SidebarHeaderBar} from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import SearchableSelect from "@/components/SearchableSelect";

import {
    PembayaranCreate,
    PembayaranDetailCreate,
    pembayaranService,
    PembayaranUpdate,
} from "@/services/pembayaranService";
import {Attachment, pembelianService, StatusPembelianEnum} from "@/services/pembelianService";
import {penjualanService, StatusPenjualanEnum} from "@/services/penjualanService";
import {warehouseService} from "@/services/warehouseService";
import {jenisPembayaranService} from "@/services/mataUangService";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {
    ReferenceSelectionDialog,
    SelectedReference,
    SelectedReferencesTable
} from "@/components/pembayaran/ReferenceSelectionDialog";
import {vendorService} from "@/services/vendorService";
import {customerService} from "@/services/customerService";
import {FileUploadButton} from "@/components/ImageUpload";
import {imageService, ParentType} from "@/services/imageService";

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

const pembayaranSchema = z.object({
    payment_code: z.string().optional(),
    payment_date: z.date({required_error: "Payment date harus diisi"}),
    reference_type: z.enum(["PEMBELIAN", "PENJUALAN"], {
        required_error: "Reference type harus dipilih",
    }),
    currency_id: z.number().min(1, "Currency harus dipilih"),
    warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
    warehouse_name: z.string().optional(),
    customer_name: z.string().optional(),
    currency_name: z.string().optional(),
    attachments: z.array(z.instanceof(File)).optional(),
    customer_id: z.string(),
    vendor_id: z.string(),
    status: z.string().optional(),
});

type PembayaranFormData = z.infer<typeof pembayaranSchema>;

interface PembayaranFormProps {
    mode: "add" | "edit" | "view";
    pembayaranId?: string;
}


export default function PembayaranForm({
                                           mode,
                                           pembayaranId,
                                       }: PembayaranFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
    const [selectedReferences, setSelectedReferences] = useState<SelectedReference[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
        []
    );

    const router = useRouter();

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const form = useForm<PembayaranFormData>({
        resolver: zodResolver(pembayaranSchema),
        defaultValues: {
            payment_code: isEditMode ? "" : "-",
            payment_date: new Date(),
            reference_type: "PEMBELIAN",
            currency_id: undefined,
            warehouse_id: undefined,
            status: "DRAFT",
            attachments: [],
        },
        mode: "onChange",
    });

    const watchedReferenceType = form.watch("reference_type");
    const watchedReferenceId = watchedReferenceType === "PEMBELIAN"
        ? form.watch("vendor_id")
        : form.watch("customer_id");

    useEffect(() => {
        if ((mode !== "edit" && mode !== "view") || !pembayaranId) return;

        const loadPembayaranData = async () => {
            try {
                const data = await pembayaranService.getPembayaranById(Number(pembayaranId));

                const formData = {
                    payment_code: data.no_pembayaran || "-",
                    payment_date: new Date(data.payment_date),
                    reference_type: data.reference_type as "PEMBELIAN" | "PENJUALAN",
                    currency_id: Number(data.currency_id),
                    warehouse_id: Number(data.warehouse_id),
                    warehouse_name: data.warehouse_name,
                    customer_name: data.customer_name,
                    currency_name: data.currency_name,
                    customer_id: data.customer_id,
                    vendor_id: data.vendor_id,
                    status: data.status,
                    attachments: [],
                };

                setSelectedReferences([]);
                setExistingAttachments(data.attachments || []);

                setTimeout(() => {
                    form.reset(formData);
                }, 100);
            } catch (error: any) {
                toast.error(error.message || "Failed to load payment data");
            }
        };

        loadPembayaranData();
    }, [isEditMode, isViewMode, pembayaranId, form]);


    useEffect(() => {
        setSelectedReferences([]);
    }, [watchedReferenceType]);

    const handleReferenceSelect = (reference: SelectedReference) => {
        setSelectedReferences(prev => [...prev, reference]);
    };

    const handleRemoveReference = (id: number) => {
        setSelectedReferences(prev => prev.filter(ref => ref.id !== id));
    };


    const handlePaymentAmountChange = (id: number, amount: number) => {
        setSelectedReferences(prev =>
            prev.map(ref =>
                ref.id === id ? {...ref, user_paid_amount: amount} : ref
            )
        );
    };

    const handleRemoveExistingAttachment = async (attachmentId: number) => {
        if (!isEditMode || !pembayaranId) return;

        try {
            await imageService.deleteAttachment(attachmentId);
            setExistingAttachments((prev) =>
                prev.filter((att) => att.id !== attachmentId)
            );
            toast.success("Attachment removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove attachment");
        }
    };


    const getTotalPayment = () => {
        return selectedReferences.reduce((total, ref) => total + ref.total_outstanding, 0);
    };

    const handleSubmit = async (data: PembayaranFormData, finalize: boolean = false) => {
        setIsSubmitting(true);
        try {
            const isValid = await form.trigger();

            if (!isValid) {
                toast.error("Penuhi field yang wajib diisi");
                return;
            }

            if (selectedReferences.length === 0) {
                toast.error("Pilih minimal 1 referensi");
                return;
            }


            const pembayaran_details: PembayaranDetailCreate[] = selectedReferences.map(ref => ({
                total_paid: ref.user_paid_amount,
                reference_id: ref.id,
                ...(data.reference_type === "PEMBELIAN"
                        ? {pembelian_id: ref.id}
                        : {penjualan_id: ref.id}
                )
            }));

            const apiPayload: PembayaranCreate = {
                payment_date: data.payment_date.toISOString(),
                reference_type: data.reference_type,
                currency_id: Number(data.currency_id),
                warehouse_id: Number(data.warehouse_id),
                customer_id: data.customer_id,
                vendor_id: data.vendor_id,
                pembayaran_details
            };

            let resultId: any;

            if (isEditMode && pembayaranId) {
                await pembayaranService.updatePembayaran(pembayaranId, apiPayload as PembayaranUpdate);
                resultId = pembayaranId;

                if (finalize) {
                    await pembayaranService.finalizePembayaran(Number(resultId));
                }

                toast.success("Payment successfully updated");
                router.back();
            } else {
                const result = await pembayaranService.createPembayaran(apiPayload);
                resultId = result.id;

                if (finalize) {
                    await pembayaranService.finalizePembayaran(Number(resultId));
                }

                toast.success("Payment successfully created");
                router.back();
            }
        } catch (error: any) {
            console.error("Submit error:", error);
            toast.error(error.message || "Something went wrong");
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


            const uploadPromises = filesToUpload.map(async (file, index) => {
                try {
                    console.log(`Uploading file ${index + 1}:`, file.name);

                    const validationError = imageService.validateFile(file);
                    if (validationError) {
                        throw new Error(`File "${file.name}": ${validationError}`);
                    }

                    const uploadResult = await imageService.uploadImage({
                        file: file,
                        parent_type: ParentType.PEMBAYARANS,
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


    const onDraftClick = form.handleSubmit(
        (data) => {
            handleSubmit(data, false);
        },
        (errors) => {
            toast.error("Please complete all required fields");
        }
    );

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={[
                            "Pembayaran",
                            isEditMode ? "Edit Pembayaran" : "Tambah Pembayaran",
                        ]}
                        linkData={[
                            "/pembayaran",
                            isEditMode ? `/pembayaran/edit/${pembayaranId}` : "/pembayaran/add",
                        ]}
                    />
                }
            />

            <Form {...form}>
                <form className="space-y-6">
                    {/* Payment Information */}
                    <FormSection title="Informasi Pembayaran">
                        <FormField
                            control={form.control}
                            name="payment_code"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Payment Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={true}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="payment_date"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Payment Date</FormLabel>
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
                                                        <span>Payment date</span>
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
                            name="reference_type"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Reference Type</FormLabel>
                                    <Select
                                        disabled={isViewMode || isEditMode}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Reference Type"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PEMBELIAN">Pembelian</SelectItem>
                                            <SelectItem value="PENJUALAN">Penjualan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {watchedReferenceType === "PEMBELIAN" ? (
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
                                            disabled={isViewMode}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
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
                                            renderLabel={(item: any) => `${item.id} - ${item.name}`}
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ) : (<FormField
                            control={form.control}
                            name="customer_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Customer"
                                        placeholder="Pilih Customer"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        disabled={isViewMode}
                                        onChange={(value) => {

                                            field.onChange(value);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response = await customerService.getAllCustomers({
                                                    page: 0,
                                                    rowsPerPage: 10,
                                                    search_key: search,
                                                });
                                                return response;
                                            } catch (error) {
                                                throw error;
                                            }
                                        }}
                                        renderLabel={(item: any) => `${item.id} - ${item.name}`}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />)}

                        <FormField
                            control={form.control}
                            name="currency_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Currency"

                                        placeholder="Pilih Currency"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        disabled={isViewMode}
                                        onChange={(value) => {
                                            const numValue = Number(value);
                                            field.onChange(numValue);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response = await jenisPembayaranService.getAllMataUang({
                                                    skip: 0,
                                                    limit: 10,
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
                            name="warehouse_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Warehouse"
                                        placeholder="Pilih Warehouse"
                                        value={field.value ?? undefined}
                                        preloadValue={field.value}
                                        disabled={isViewMode}
                                        onChange={(value) => {
                                            const numValue = Number(value);
                                            field.onChange(numValue);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response = await warehouseService.getAllWarehouses({
                                                    skip: 0,
                                                    limit: 10,
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
                                                        href={pembayaranService.getDownloadUrl(
                                                            pembayaranId!,
                                                            att.id
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium hover:underline truncate"
                                                    >
                                                        {att.filename}
                                                    </a>
                                                </div>
                                                {isEditMode && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleRemoveExistingAttachment(att.id)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                )}
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
                                                value={field.value || []}
                                                onChangeAction={field.onChange}
                                                maxFiles={3}
                                                maxSizeMB={4}
                                                disabled={isViewMode}
                                                accept={{"application/pdf": [".pdf"]}}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                    </FormSection>

                    {/* Reference Details */}
                    <div className="flex w-full justify-between items-center">
                        <h4 className="text-lg font-semibold">
                            {watchedReferenceType === "PEMBELIAN" ? "Pembelian" : "Penjualan"} Details
                        </h4>
                        {!isViewMode && (
                            <Button
                                type="button"
                                disabled={isViewMode}
                                onClick={() => setIsReferenceDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Reference
                            </Button>
                        )}
                    </div>


                    <SelectedReferencesTable

                        selectedReferences={selectedReferences}
                        onRemove={handleRemoveReference}
                        onAmountChange={handlePaymentAmountChange}
                        referenceType={watchedReferenceType}

                    />


                    {/* Action Buttons */}
                    {!isViewMode && (
                        <div className="flex justify-end space-x-2 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onDraftClick}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                        Saving...
                                    </>
                                ) : (
                                    "Save as Draft"
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => form.handleSubmit((data) => handleSubmit(data, true))()}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                        Finalizing...
                                    </>
                                ) : (
                                    "Finalize"
                                )}
                            </Button>
                        </div>
                    )}
                </form>
            </Form>

            <ReferenceSelectionDialog
                open={isReferenceDialogOpen}
                onOpenChange={setIsReferenceDialogOpen}
                referenceType={watchedReferenceType}
                onSelect={handleReferenceSelect}
                referenceId={watchedReferenceId}
            />
        </div>
    );
}