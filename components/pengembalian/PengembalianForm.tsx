"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {CalendarIcon, FileText, Plus, RefreshCw, X} from "lucide-react";
import {cn, formatDateForAPI, formatMoney} from "@/lib/utils";

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
import {Calendar} from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {SidebarHeaderBar} from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import SearchableSelect from "@/components/SearchableSelect";

import {Attachment} from "@/services/pembelianService";
import {warehouseService} from "@/services/warehouseService";
import {jenisPembayaranService} from "@/services/mataUangService";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {
    ReferenceSelectionDialog,
    SelectedReference,
    SelectedReferencesTable,
} from "@/components/pembayaran/ReferenceSelectionDialog";
import {vendorService} from "@/services/vendorService";
import {customerService} from "@/services/customerService";
import {FileUploadButton} from "@/components/ImageUpload";
import {imageService, ParentType} from "@/services/imageService";
import {Spinner} from "@/components/ui/spinner";
import {FormSection} from "../pembayaran/PembayaranForm";
import {
    PengembalianCreate,
    PengembalianDetailCreate,
    pengembalianService,
    PengembalianUpdate,
} from "@/services/pengembalianService";

const pengembalianSchema = z
    .object({
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
        customer_id: z.string().optional(),
        vendor_id: z.string().optional(),
        status: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.reference_type === "PEMBELIAN" && !data.vendor_id) {
                return false;
            }
            return !(data.reference_type === "PENJUALAN" && !data.customer_id);
        },
        {
            message:
                "Vendor is required for PEMBELIAN, Customer is required for PENJUALAN",
            path: ["vendor_id"],
        }
    );

type PengembalianFormData = z.infer<typeof pengembalianSchema>;

interface PengembalianFormProps {
    mode: "add" | "edit" | "view";
    pengembalianId?: string;
}

export default function PengembalianForm({
                                             mode,
                                             pengembalianId: pengembalianId,
                                         }: PengembalianFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
    const [initialDataSet, setInitialDataSet] = useState(false);
    const [selectedReferences, setSelectedReferences] = useState<
        SelectedReference[]
    >([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
        []
    );

    const [preloadValues, setPreloadValues] = useState({
        reference_type: undefined as string | undefined,
        customer_id: undefined as string | undefined,
        vendor_id: undefined as string | undefined,
        currency_id: undefined as number | undefined,
        warehouse_id: undefined as number | undefined,
    });

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const router = useRouter();

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    const form = useForm<PengembalianFormData>({
        resolver: zodResolver(pengembalianSchema),
        defaultValues: {
            payment_code: isEditMode ? "" : "-",
            payment_date: new Date(),
            reference_type: "PEMBELIAN",
            currency_id: 0,
            warehouse_id: 0,
            status: "DRAFT",
            attachments: [],
            customer_id: "",
            vendor_id: "",
        },
        mode: "onChange",
    });

    const watchedReferenceType = form.watch("reference_type");
    const watchedVendorId = form.watch("vendor_id");
    const watchedCustomerId = form.watch("customer_id");

    const watchedReferenceId =
        watchedReferenceType === "PEMBELIAN" ? watchedVendorId : watchedCustomerId;

    useEffect(() => {
        if ((mode !== "edit" && mode !== "view") || !pengembalianId) {
            setIsDataLoaded(true);
            return;
        }

        const loadPengembalianData = async () => {
            try {
                setIsDataLoaded(false);
                console.log("Loading pembayaran data for ID:", pengembalianId);

                const data = await pengembalianService.getPengembalianById(
                    Number(pengembalianId)
                );
                console.log("Fetched pembayaran data:", data);

                const references: SelectedReference[] =
                    data.pengembalian_details?.map((detail: any) => {
                        const ref = detail.pembelian_rel || detail.penjualan_rel;
                        const mappedRef = {
                            id: ref.id,
                            no_reference: ref.no_pembelian || ref.no_penjualan,
                            status: ref.status_pembelian || ref.status_penjualan,
                            sales_date: ref.sales_date,
                            sales_due_date: ref.sales_due_date,
                            total_price: parseFloat(ref.total_price || "0"),
                            total_outstanding:
                                parseFloat(ref.total_price || "0") -
                                (parseFloat(detail.total_return || "0") +
                                    parseFloat(detail.total_return || "0")),
                            user_paid_amount: parseFloat(detail.total_return || "0"),
                            warehouse_name: ref.warehouse_name,
                            customer_name: ref.customer_name,
                            vendor_name: ref.vendor_name,
                        };

                        return mappedRef;
                    }) || [];

                let allAttachments: Attachment[] = data.attachments || [];

                data.pengembalian_details?.forEach((detail: any) => {
                    const ref = detail.pembelian_rel || detail.penjualan_rel;
                });

                const newPreloadValues = {
                    customer_id: data.customer_id || undefined,
                    vendor_id: data.vendor_id || undefined,
                    currency_id: data.currency_id ? Number(data.currency_id) : undefined,
                    warehouse_id: data.warehouse_id
                        ? Number(data.warehouse_id)
                        : undefined,
                    reference_type: data.reference_type as "PEMBELIAN" | "PENJUALAN",
                };
                setPreloadValues(newPreloadValues);

                console.log("All attachments found:", allAttachments);

                const formData = {
                    payment_code: data.no_pengembalian || "-",
                    payment_date: new Date(data.payment_date),
                    reference_type: data.reference_type as "PEMBELIAN" | "PENJUALAN",
                    currency_id: Number(data.currency_id) || 0,
                    warehouse_id: Number(data.warehouse_id) || 0,
                    warehouse_name: data.warehouse_rel?.name,
                    customer_name: data.customer_rel?.name,
                    currency_name: data.curr_rel?.name,
                    customer_id: data.customer_id || "",
                    vendor_id: data.vendor_id || "",
                    status: data.status,
                    attachments: [],
                };

                setSelectedReferences(references);
                setExistingAttachments(allAttachments);
                setTimeout(() => {
                    setIsDataLoaded(true);
                    form.reset(formData);

                    setTimeout(() => {
                        setInitialDataSet(true);
                    }, 50);
                }, 100);
            } catch (error: any) {
                console.error("Error loading pembayaran data:", error);
                toast.error(error.message || "Failed to load payment data");
            }
        };

        loadPengembalianData();
    }, [mode, pengembalianId]);

    useEffect(() => {
        if (mode === "view") return;

        if (mode === "add") {
            const fieldToClear =
                watchedReferenceType === "PEMBELIAN" ? "customer_id" : "vendor_id";
            form.setValue(fieldToClear, "");
            setSelectedReferences([]);
            return;
        }

        if (
            mode === "edit" &&
            isDataLoaded &&
            initialDataSet &&
            preloadValues.reference_type
        ) {
            const referenceTypeChanged =
                watchedReferenceType !== preloadValues.reference_type;
            const vendorChanged = watchedVendorId !== preloadValues.vendor_id;
            const customerChanged = watchedCustomerId !== preloadValues.customer_id;

            if (
                referenceTypeChanged ||
                (watchedReferenceType === "PEMBELIAN" && vendorChanged) ||
                (watchedReferenceType === "PENJUALAN" && customerChanged)
            ) {
                setSelectedReferences([]);
            }

            if (referenceTypeChanged) {
                const fieldToClear =
                    watchedReferenceType === "PEMBELIAN" ? "customer_id" : "vendor_id";
                form.setValue(fieldToClear, "");
            }
        }
    }, [
        watchedReferenceType,
        watchedCustomerId,
        watchedVendorId,
        form,
        isDataLoaded,
        initialDataSet,
        mode,
        preloadValues,
    ]);

    const handleReferenceSelect = (reference: SelectedReference) => {
        setSelectedReferences((prev) => {
            if (prev.find((ref) => ref.id === reference.id)) {
                toast.error("Reference already selected");
                return prev;
            }
            return [...prev, reference];
        });
    };

    const handleRemoveReference = (id: number) => {
        setSelectedReferences((prev) => prev.filter((ref) => ref.id !== id));
    };

    const handlePaymentAmountChange = (id: number, amount: number) => {
        setSelectedReferences((prev) =>
            prev.map((ref) =>
                ref.id === id ? {...ref, user_paid_amount: amount} : ref
            )
        );
    };

    const handleRemoveExistingAttachment = async (attachmentId: number) => {
        if (!isEditMode || !pengembalianId) return;

        try {
            await imageService.deleteAttachment(attachmentId);
            setExistingAttachments((prev) =>
                prev.filter((att) => att.id !== attachmentId)
            );
            toast.success("Attachment berhasil dihapus");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove attachment");
        }
    };

    const getTotalPayment = () => {
        return selectedReferences.reduce(
            (total, ref) => total + (ref.user_paid_amount || ref.total_outstanding),
            0
        );
    };

    const validateForm = async () => {
        const isValid = await form.trigger();

        if (!isValid) {
            const errors = form.formState.errors;
            console.log("Form validation errors:", errors);

            Object.keys(errors).forEach((key) => {
                const error = errors[key as keyof typeof errors];
                if (error?.message) {
                    toast.error(`${key}: ${error.message}`);
                }
            });

            return false;
        }

        if (selectedReferences.length === 0) {
            toast.error("Pilih minimal 1 referensi");
            return false;
        }

        if (watchedReferenceType === "PEMBELIAN" && !watchedVendorId) {
            toast.error("Vendor harus dipilih untuk referensi PEMBELIAN");
            return false;
        }

        if (watchedReferenceType === "PENJUALAN" && !watchedCustomerId) {
            toast.error("Customer harus dipilih untuk referensi PENJUALAN");
            return false;
        }

        return true;
    };

    const handleSubmit = async (
        data: PengembalianFormData,
        finalize: boolean = false
    ) => {
        setIsSubmitting(true);
        try {
            console.log("Submitting form data:", data);

            const isValid = await validateForm();
            if (!isValid) {
                return;
            }

            const pengembalian_details: PengembalianDetailCreate[] =
                selectedReferences.map((ref) => ({
                    total_return: ref.user_paid_amount || ref.total_outstanding,
                    reference_id: ref.id,
                    ...(data.reference_type === "PEMBELIAN"
                        ? {pembelian_id: ref.id}
                        : {penjualan_id: ref.id}),
                }));

            const apiPayload: PengembalianCreate = {
                payment_date: formatDateForAPI(data.payment_date),
                reference_type: data.reference_type,
                currency_id: Number(data.currency_id),
                warehouse_id: Number(data.warehouse_id),
                customer_id: data.customer_id || undefined,
                vendor_id: data.vendor_id || undefined,
                pengembalian_details,
            };

            console.log("API Payload:", apiPayload);

            let resultId: any;

            if (isEditMode && pengembalianId) {
                await pengembalianService.updatePengembalian(
                    pengembalianId,
                    apiPayload as PengembalianUpdate
                );
                resultId = pengembalianId;

                if (data.attachments && data.attachments.length > 0) {
                    await handleAttachmentUpload(data.attachments, resultId);
                }

                if (finalize) {
                    await pengembalianService.finalizePengembalian(Number(resultId));
                }

                toast.success("Pengembalian berhasil diubah");
                router.back();
            } else {
                const result = await pengembalianService.createPengembalian(apiPayload);
                resultId = result.id;

                if (data.attachments && data.attachments.length > 0) {
                    await handleAttachmentUpload(data.attachments, resultId);
                }

                if (finalize) {
                    await pengembalianService.finalizePengembalian(Number(resultId));
                }

                toast.success("Pengembalian berhasil dibuat");
                router.back();
            }
        } catch (error: any) {
            console.error("Submit error:", error);
            toast.error(
                error.response?.data?.message || error.message || "Something went wrong"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachmentUpload = async (attachments: any, parentId: number) => {
        if (!attachments || attachments.length === 0) {
            console.log("No attachments to upload");
            return;
        }

        try {
            let filesToUpload: File[] = [];

            if (attachments instanceof File) {
                filesToUpload = [attachments];
            } else if (attachments instanceof FileList) {
                filesToUpload = Array.from(attachments);
            } else if (Array.isArray(attachments)) {
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
                        parent_type: ParentType.PENGEMBALIANS,
                        parent_id: parentId,
                    });

                    console.log(`Upload result for ${file.name}:`, uploadResult);
                    return uploadResult;
                } catch (error: any) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    return {error: error.detail || error.message, fileName: file.name};
                }
            });
        } catch (error: any) {
            console.error("Attachment upload error:", error);
            toast.error(`Attachment upload failed: ${error.detail || error.message}`);
        }
    };

    const onDraftClick = () => {
        form.handleSubmit(
            (data) => {
                console.log("Draft submit - form data:", data);
                handleSubmit(data, false);
            },
            (errors) => {
                console.log("Form validation errors on draft:", errors);
                toast.error("Please complete all required fields");
            }
        )();
    };

    const onFinalizeClick = () => {
        form.handleSubmit(
            (data) => {
                console.log("Finalize submit - form data:", data);
                handleSubmit(data, true);
            },
            (errors) => {
                console.log("Form validation errors on finalize:", errors);
                toast.error("Please complete all required fields");
            }
        )();
    };
    if ((isEditMode || isViewMode) && !isDataLoaded) {
        return (
            <div className="space-y-6">
                <SidebarHeaderBar
                    leftContent={
                        <CustomBreadcrumb
                            listData={[
                                "Pengembalian",
                                isEditMode ? "Edit Pengembalian" : "Tambah Pengembalian",
                            ]}
                            linkData={[
                                "pengembalian",
                                isEditMode
                                    ? `/pengembalian/edit/${pengembalianId}`
                                    : "/pengembalian/add",
                            ]}
                        />
                    }
                />
                <div className="flex justify-center items-center h-64">
                    <Spinner/>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                leftContent={
                    <CustomBreadcrumb
                        listData={[
                            "Pengembalian",
                            isEditMode ? "Edit Pengembalian" : "Tambah Pengembalian",
                        ]}
                        linkData={[
                            "pengembalian",
                            isEditMode
                                ? `/pengembalian/edit/${pengembalianId}`
                                : "/pengembalian/add",
                        ]}
                    />
                }
            />

            <Form {...form}>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Payment Information */}
                    <FormSection title="Informasi Pengembalian">
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
                                    <FormLabel>Payment Date *</FormLabel>
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
                                    <FormLabel>Reference Type *</FormLabel>
                                    <Select
                                        disabled={isViewMode}
                                        onValueChange={field.onChange}
                                        value={field.value}
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
                                            key={`vendor-${
                                                preloadValues.vendor_id || "empty"
                                            }-${isDataLoaded}`}
                                            label="Vendor *"
                                            placeholder="Pilih Vendor"
                                            value={field.value || ""}
                                            preloadValue={preloadValues.vendor_id}
                                            disabled={isViewMode}
                                            onChange={(value) => {
                                                console.log("Vendor selected:", value);
                                                field.onChange(value === "all" || !value ? "" : value);
                                            }}
                                            fetchData={async (search) => {
                                                try {
                                                    const response = await vendorService.getAllVendors({
                                                        skip: 0,
                                                        limit: 10,
                                                        is_active: true,
                                                        search_key: search,
                                                    });
                                                    return response;
                                                } catch (error) {
                                                    console.error("Error fetching vendors:", error);
                                                    throw error;
                                                }
                                            }}
                                            renderLabel={(item: any) => `${item.id} - ${item.name}`}
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({field}) => (
                                    <FormItem>
                                        <SearchableSelect
                                            key={`customer-${
                                                preloadValues.customer_id || "empty"
                                            }-${isDataLoaded}`}
                                            label="Customer *"
                                            placeholder="Pilih Customer"
                                            value={field.value ?? ""}
                                            preloadValue={preloadValues.customer_id}
                                            disabled={isViewMode}
                                            onChange={(value) => {
                                                console.log("Customer onChange:", value);
                                                field.onChange(value === "all" || !value ? "" : value);
                                            }}
                                            fetchData={async (search) => {
                                                const response = await customerService.getAllCustomers({
                                                    page: 0,
                                                    rowsPerPage: 10,
                                                    is_active: true,
                                                    search_key: search,
                                                });
                                                return response;
                                            }}
                                            renderLabel={(item: any) =>
                                                `${item.code} - ${item.name}${
                                                    item?.curr_rel?.symbol
                                                        ? ` (${item.curr_rel.symbol})`
                                                        : ""
                                                }`
                                            }
                                        />
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="currency_id"
                            render={({field}) => (
                                <FormItem>
                                    <SearchableSelect
                                        label="Currency *"
                                        placeholder="Pilih Currency"
                                        value={field.value > 0 ? field.value.toString() : ""}
                                        preloadValue={
                                            field.value > 0 ? field.value.toString() : undefined
                                        }
                                        disabled={isViewMode}
                                        onChange={(value) => {
                                            const numValue = Number(value);
                                            console.log("Currency selected:", numValue);
                                            field.onChange(numValue);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response =
                                                    await jenisPembayaranService.getAllMataUang({
                                                        skip: 0,
                                                        limit: 10,
                                                        is_active: true,
                                                        search: search,
                                                    });
                                                return response;
                                            } catch (error) {
                                                console.error("Error fetching currencies:", error);
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
                                        label="Warehouse *"
                                        placeholder="Pilih Warehouse"
                                        value={field.value > 0 ? field.value.toString() : ""}
                                        preloadValue={
                                            field.value > 0 ? field.value.toString() : undefined
                                        }
                                        disabled={isViewMode}
                                        onChange={(value) => {
                                            const numValue = Number(value);
                                            console.log("Warehouse selected:", numValue);
                                            field.onChange(numValue);
                                        }}
                                        fetchData={async (search) => {
                                            try {
                                                const response =
                                                    await warehouseService.getAllWarehouses({
                                                        skip: 0,
                                                        is_active: true,
                                                        limit: 10,
                                                        search: search,
                                                    });
                                                return response;
                                            } catch (error) {
                                                console.error("Error fetching warehouses:", error);
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
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            imageService.handleDownload(att);
                                                        }}
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
                                    <FormItem>
                                        <FormLabel>
                                            {isEditMode ? "Add New Attachments" : "Attachments"}
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
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* Reference Details */}
                    <div className="flex w-full justify-between items-center">
                        <h4 className="text-lg font-semibold">
                            {watchedReferenceType === "PEMBELIAN" ? "Pembelian" : "Penjualan"}{" "}
                            Details
                        </h4>
                        {!isViewMode && (
                            <Button
                                type="button"
                                disabled={isViewMode || !watchedReferenceId}
                                onClick={() => setIsReferenceDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Reference
                            </Button>
                        )}
                    </div>

                    <SelectedReferencesTable
                        isPembayaran={false}
                        selectedReferences={selectedReferences}
                        onRemove={handleRemoveReference}
                        onAmountChange={handlePaymentAmountChange}
                        referenceType={watchedReferenceType}
                        isViewMode={isViewMode}
                    />

                    {/* Show total payment amount */}
                    {selectedReferences.length > 0 && (
                        <div className="flex justify-end">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Payment</p>
                                <p className="text-lg font-semibold">
                                    {formatMoney(getTotalPayment())}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!isViewMode ? (
                        <div className="flex justify-end space-x-2 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
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
                                onClick={onFinalizeClick}
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
