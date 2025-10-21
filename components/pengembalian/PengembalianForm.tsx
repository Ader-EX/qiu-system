"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { cn, formatDateForAPI, formatMoney } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SidebarHeaderBar } from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";

import { Attachment } from "@/services/pembelianService";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { FileUploadButton } from "@/components/ImageUpload";
import { imageService, ParentType } from "@/services/imageService";
import { Spinner } from "@/components/ui/spinner";
import { FormSection } from "../pembayaran/PembayaranForm";
import {
  PengembalianCreate,
  PengembalianItemsCreate,
  pengembalianService,
  PengembalianUpdate,
} from "@/services/pengembalianService";
import { QuickFormSearchableField } from "@/components/form/FormSearchableField";

import { NumericFormat } from "react-number-format";
import ItemSelectorDialog from "../ItemSelectorDialog";
const pengembalianSchema = z
  .object({
    payment_code: z.string().optional(),
    payment_date: z.date({ required_error: "Tanggal Pembayaran harus diisi" }),
    reference_type: z.enum(["PEMBELIAN", "PENJUALAN"], {
      required_error: "Tipe referensi harus dipilih",
    }),
    currency_id: z.coerce.number().min(1, "Mata uang harus dipilih"),
    warehouse_id: z.coerce.number().min(1, "Warehouse harus dipilih"),
    notes: z.string().optional(),
    attachments: z
      .array(
        z
          .any()
          .refine((f) => typeof File !== "undefined" && f instanceof File, {
            message: "Attachment must be a file",
          })
      )
      .optional(),
    customer_id: z.coerce.number().optional(), // Changed: removed transform to string
    vendor_id: z.coerce.string().optional(), // Changed: now number instead of string
    pembelian_id: z.coerce.number().optional(),
    penjualan_id: z.coerce.number().optional(),
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
      message: "Field ini harus diisi",
      path: ["vendor_id"],
    }
  );

type PengembalianFormData = z.infer<typeof pengembalianSchema>;

interface PengembalianItem {
  id?: number;
  item_id: number;
  item_code: string;
  item_name: string;
  qty_returned: number;
  unit_price: number;
  tax_percentage: number;
  sub_total: number;
  total_return: number;
}

interface PengembalianFormProps {
  mode: "add" | "edit" | "view";
  pengembalianId?: string;
}

export default function PengembalianForm({
  mode,
  pengembalianId,
}: PengembalianFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [initialDataSet, setInitialDataSet] = useState(false);

  const [pengembalianItems, setPengembalianItems] = useState<
    PengembalianItem[]
  >([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  );

  const [preloadValues, setPreloadValues] = useState({
    reference_type: undefined as string | undefined,
    customer_id: undefined as number | undefined, // Changed: number instead of string
    vendor_id: undefined as string | undefined, // Changed: number instead of string
    currency_id: undefined as number | undefined,
    warehouse_id: undefined as number | undefined,
    pembelian_id: undefined as number | undefined,
    penjualan_id: undefined as number | undefined,
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
      customer_id: 0,
      vendor_id: "",
      notes: "",
    },
    mode: "onChange",
  });

  const watchedReferenceType = form.watch("reference_type");
  const watchedVendorId = form.watch("vendor_id");
  const watchedCustomerId = form.watch("customer_id");
  useEffect(() => {
    if ((mode !== "edit" && mode !== "view") || !pengembalianId) {
      setIsDataLoaded(true);
      return;
    }

    const loadPengembalianData = async () => {
      try {
        setIsDataLoaded(false);
        console.log("Loading pengembalian data for ID:", pengembalianId);

        const data = await pengembalianService.getPengembalianById(
          Number(pengembalianId)
        );
        console.log("Fetched pengembalian data:", data);

        // Set pengembalian items
        const items: PengembalianItem[] =
          data.pengembalian_items?.map((item: any) => ({
            id: item.id,
            item_id: item.item_id,
            item_code: item.item_code || item.item_display_code,
            item_name: item.item_name || item.item_display_name,
            qty_returned: item.qty_returned,
            unit_price: parseFloat(item.unit_price),
            tax_percentage: item.tax_percentage,
            sub_total: parseFloat(item.sub_total || "0"),
            total_return: parseFloat(item.total_return || "0"),
          })) || [];
        setPengembalianItems(items);

        const allAttachments: Attachment[] = data.attachments || [];

        const newPreloadValues = {
          customer_id: data.customer_id || undefined,
          vendor_id: data.vendor_id || undefined,
          currency_id: data.currency_id ? Number(data.currency_id) : undefined,
          warehouse_id: data.warehouse_id
            ? Number(data.warehouse_id)
            : undefined,
          reference_type: data.reference_type as "PEMBELIAN" | "PENJUALAN",
          pembelian_id: data.pembelian_id || undefined,
          penjualan_id: data.penjualan_id || undefined,
        };
        setPreloadValues(newPreloadValues);

        const formData = {
          payment_code: data.no_pengembalian || "-",
          payment_date: new Date(data.payment_date),
          reference_type: data.reference_type as "PEMBELIAN" | "PENJUALAN",
          currency_id: Number(data.currency_id) || 0,
          warehouse_id: Number(data.warehouse_id) || 0,
          customer_id: data.customer_id ? Number(data.customer_id) : undefined, // Changed
          vendor_id: data.vendor_id ? data.vendor_id : undefined,
          pembelian_id: data.pembelian_id,
          penjualan_id: data.penjualan_id,
          status: data.status,
          notes: data.notes || "",
          attachments: [],
        };

        setExistingAttachments(allAttachments);
        setTimeout(() => {
          setIsDataLoaded(true);
          form.reset(formData);

          setTimeout(() => {
            setInitialDataSet(true);
          }, 50);
        }, 100);
      } catch (error: any) {
        console.error("Error loading pengembalian data:", error);
        toast.error(error.message || "Failed to load data");
      }
    };

    loadPengembalianData();
  }, [mode, pengembalianId]);

  const prevRefType = React.useRef<string | undefined>(watchedReferenceType);

  useEffect(() => {
    if (prevRefType.current && prevRefType.current !== watchedReferenceType) {
      form.setValue("customer_id", undefined);
      form.setValue("vendor_id", undefined);
      form.setValue("pembelian_id", undefined);
      form.setValue("penjualan_id", undefined);
      setPengembalianItems([]);
    }

    prevRefType.current = watchedReferenceType;
  }, [watchedReferenceType, form]);

  const handleAddItem = (item: any) => {
    setPengembalianItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.item_id === item.id);

      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        updated[existingIndex] = {
          ...existingItem,
          qty_returned: existingItem.qty_returned + 1,
        };

        return updated;
      }

      const newItem: PengembalianItem = {
        item_id: item.id,
        item_code: item.code,
        item_name: item.name,
        qty_returned: 1,
        unit_price: 0,
        tax_percentage: 0,
        sub_total: 0,
        total_return: 0,
      };

      return [...prev, newItem];
    });
  };

  const handleRemoveItem = (index: number) => {
    setPengembalianItems(pengembalianItems.filter((_, i) => i !== index));
  };
  const handleItemChange = (
    index: number,
    field: keyof PengembalianItem,
    value: any
  ) => {
    let updatedItems = [...pengembalianItems];

    if (field === "tax_percentage") {
      updatedItems = updatedItems.map((item) => {
        const subTotal = item.qty_returned * item.unit_price;
        const tax = subTotal * (value / 100);
        return {
          ...item,
          tax_percentage: value,
          sub_total: subTotal,
          total_return: subTotal + tax,
        };
      });
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      const item = updatedItems[index];
      const subTotal = item.qty_returned * item.unit_price;
      const tax = subTotal * (item.tax_percentage / 100);
      updatedItems[index].sub_total = subTotal;
      updatedItems[index].total_return = subTotal + tax;
    }

    setPengembalianItems(updatedItems);
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

  const getTotalSubtotal = () => {
    return pengembalianItems.reduce((total, item) => total + item.sub_total, 0);
  };

  const getTotalTax = () => {
    return pengembalianItems.reduce((total, item) => {
      const tax = item.sub_total * (item.tax_percentage / 100);
      return total + tax;
    }, 0);
  };

  const getTotalReturn = () => {
    return pengembalianItems.reduce(
      (total, item) => total + item.total_return,
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

    if (pengembalianItems.length === 0) {
      toast.error("Tambahkan minimal 1 item");
      return false;
    }

    // Validate all items have required fields
    for (let i = 0; i < pengembalianItems.length; i++) {
      const item = pengembalianItems[i];
      if (!item.item_id || item.item_id === 0) {
        toast.error(`Item ${i + 1}: Pilih item terlebih dahulu`);
        return false;
      }
      if (item.qty_returned <= 0) {
        toast.error(`Item ${i + 1}: Quantity harus lebih dari 0`);
        return false;
      }
      if (item.unit_price < 0) {
        toast.error(`Item ${i + 1}: Harga tidak boleh negatif`);
        return false;
      }
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

      const pengembalian_items: PengembalianItemsCreate[] =
        pengembalianItems.map((item) => ({
          item_id: item.item_id,
          qty_returned: item.qty_returned,
          unit_price: item.unit_price,
          tax_percentage: item.tax_percentage,
        }));

      const apiPayload: PengembalianCreate = {
        payment_date: formatDateForAPI(data.payment_date),
        reference_type: data.reference_type,
        currency_id: Number(data.currency_id),
        warehouse_id: Number(data.warehouse_id),
        customer_id: data.customer_id ? Number(data.customer_id) : undefined,
        vendor_id: data.vendor_id ? String(data.vendor_id) : undefined, // Changed: convert to string for API
        pembelian_id: data.pembelian_id,
        penjualan_id: data.penjualan_id,
        notes: data.notes || "",
        pengembalian_items,
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
    if (!attachments || attachments.length === 0) return;

    try {
      let filesToUpload: File[] = [];

      if (attachments instanceof File) {
        filesToUpload = [attachments];
      } else if (attachments instanceof FileList) {
        filesToUpload = Array.from(attachments);
      } else if (Array.isArray(attachments)) {
        filesToUpload = attachments
          .map((a) => {
            if (a instanceof File) return a;
            if (a?.file instanceof File) return a.file;
            return undefined;
          })
          .filter(Boolean) as File[];
      }

      if (filesToUpload.length === 0) {
        console.warn("No valid files to upload:", attachments);
        return;
      }

      const uploadPromises = filesToUpload.map(async (file) => {
        const validationError = imageService.validateFile(file);
        if (validationError) {
          throw new Error(`File "${file.name}": ${validationError}`);
        }

        return await imageService.uploadImage({
          file,
          parent_type: ParentType.PENGEMBALIANS,
          parent_id: parentId,
        });
      });

      await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error("Attachment upload error:", error);
      toast.error(`Attachment upload failed: ${error.message}`);
    }
  };

  const onDraftClick = () => {
    form.handleSubmit(
      (data) => handleSubmit(data, false),
      () => toast.error("Silahkan penuhi field yang belum terisi")
    )();
  };

  const onFinalizeClick = () => {
    form.handleSubmit(
      (data) => handleSubmit(data, true),
      () => toast.error("Silahkan penuhi field yang belum terisi")
    )();
  };
  const watchedItems = pengembalianItems; // Since you're using useState, not form fields

  // Calculate totals whenever items change
  const totalSubtotal = React.useMemo(() => {
    return pengembalianItems.reduce((sum, item) => {
      return sum + item.sub_total;
    }, 0);
  }, [pengembalianItems]);

  const totalTax = React.useMemo(() => {
    return pengembalianItems.reduce((sum, item) => {
      const tax = item.sub_total * (item.tax_percentage / 100);
      return sum + tax;
    }, 0);
  }, [pengembalianItems]);

  const grandTotal = React.useMemo(() => {
    return pengembalianItems.reduce((sum, item) => {
      return sum + item.total_return;
    }, 0);
  }, [pengembalianItems]);

  if ((isEditMode || isViewMode) && !isDataLoaded) {
    return (
      <div className="space-y-6">
        <SidebarHeaderBar
          leftContent={
            <CustomBreadcrumb
              listData={["Pengembalian", isEditMode ? "Edit" : "View"]}
              linkData={[
                "pengembalian",
                isEditMode
                  ? `/pengembalian/edit/${pengembalianId}`
                  : `/pengembalian/view/${pengembalianId}`,
              ]}
            />
          }
        />
        <div className="flex justify-center items-center h-64">
          <Spinner />
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
              mode === "add" ? "Tambah" : mode === "edit" ? "Edit" : "View",
            ]}
            linkData={[
              "pengembalian",
              mode === "add"
                ? "/pengembalian/add"
                : mode === "edit"
                ? `/pengembalian/edit/${pengembalianId}`
                : `/pengembalian/view/${pengembalianId}`,
            ]}
          />
        }
      />

      <Form {...form}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <FormSection title="Informasi Pengembalian">
            <FormField
              control={form.control}
              name="payment_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Pengembalian</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tanggal <span className="text-red-500">*</span>
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
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reference Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    disabled={isViewMode}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Reference Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PEMBELIAN">Pembelian</SelectItem>
                      <SelectItem value="PENJUALAN">Penjualan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedReferenceType === "PEMBELIAN" ? (
              <>
                <QuickFormSearchableField
                  control={form.control}
                  name="vendor_id"
                  type="vendor"
                  label="Vendor"
                  isRequired={true}
                  placeholder="Pilih Vendor"
                  disabled={isViewMode}
                />
                <QuickFormSearchableField
                  control={form.control}
                  name="pembelian_id"
                  type="pembelian"
                  label="Pembelian"
                  isRequired={true}
                  placeholder="Pilih Pembelian"
                  disabled={isViewMode}
                />
              </>
            ) : (
              <>
                <QuickFormSearchableField
                  control={form.control}
                  name="customer_id"
                  type="customer"
                  label="Customer"
                  isRequired={true}
                  placeholder="Pilih Customer"
                  disabled={isViewMode}
                />
                <QuickFormSearchableField
                  control={form.control}
                  name="penjualan_id"
                  type="penjualan"
                  label="Penjualan"
                  isRequired={true}
                  placeholder="Pilih Penjualan"
                  disabled={isViewMode}
                />
              </>
            )}

            <QuickFormSearchableField
              control={form.control}
              name="currency_id"
              isRequired={true}
              type="currency"
              label="Mata Uang"
              placeholder="Pilih Mata Uang"
              disabled={isViewMode}
            />

            <QuickFormSearchableField
              control={form.control}
              name="warehouse_id"
              type="warehouse"
              isRequired={true}
              label="Warehouse"
              placeholder="Pilih Warehouse"
              disabled={isViewMode}
            />
          </FormSection>

          {/* Reference Selection */}

          {/* Items Table */}
          <FormSection title="Detail Item">
            <div className="md:col-span-2">
              <div className="flex justify-end items-center mb-4">
                {!isViewMode && (
                  <Button
                    type="button"
                    onClick={() => setIsItemDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                )}
              </div>
            </div>
          </FormSection>
          {pengembalianItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              Belum ada item ditambahkan
            </div>
          ) : (
            <div className="space-y-4 ">
              <div className="w-full overflow-x-auto">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Item</TableHead>
                        <TableHead>Nama Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Harga Satuan</TableHead>

                        <TableHead>Pajak (%)</TableHead>
                        <TableHead>Harga Termasuk Pajak</TableHead>
                        <TableHead>Sub Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pengembalianItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.item_code}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              disabled={isViewMode}
                              className="w-24"
                              min={1}
                              value={item.qty_returned}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "qty_returned",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <NumericFormat
                              customInput={Input}
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              disabled={isViewMode}
                              className="w-32"
                              value={item.unit_price}
                              onValueChange={(values) =>
                                handleItemChange(
                                  index,
                                  "unit_price",
                                  Number(values.floatValue ?? 0)
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Input
                              type="number"
                              disabled={isViewMode}
                              className="w-20"
                              min={0}
                              max={100}
                              value={item.tax_percentage}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "tax_percentage",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {formatMoney(
                              item.sub_total * (item.tax_percentage / 100),
                              "IDR",
                              "id-ID",
                              "nosymbol"
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatMoney(
                              item.total_return,
                              "IDR",
                              "id-ID",
                              "nosymbol"
                            )}
                          </TableCell>
                          <TableCell>
                            {!isViewMode && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              {/* Replace the existing totals section with this */}
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
                      value={formatMoney(
                        totalSubtotal,
                        "IDR",
                        "id-ID",
                        "nosymbol"
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <span className={"mr-4"}>Tax</span>
                    <Input
                      type="text"
                      disabled={true}
                      className="w-[40%] text-right"
                      value={formatMoney(totalTax, "IDR", "id-ID", "nosymbol")}
                    />
                  </div>

                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Grand Total </span>
                    <span>
                      {formatMoney(grandTotal, "IDR", "id-ID", "nosymbol")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          <FormSection title="Lampiran">
            {(isEditMode || isViewMode) && (
              <div className="md:col-span-2 space-y-3">
                {existingAttachments.length > 0 ? (
                  <div className="space-y-2">
                    {existingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              imageService.handleDownload(att);
                            }}
                            className="text-sm font-medium hover:underline truncate"
                          >
                            {att.filename}
                          </a>
                        </div>
                        {!isViewMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() =>
                              handleRemoveExistingAttachment(att.id)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada lampiran.
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEditMode ? "Tambah Lampiran Baru" : "Lampiran"}
                    </FormLabel>
                    <FormControl>
                      <FileUploadButton
                        value={field.value || []}
                        onChangeAction={field.onChange}
                        maxFiles={3}
                        maxSizeMB={4}
                        accept={{ "application/pdf": [".pdf"] }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Action Buttons */}
          {!isViewMode ? (
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDraftClick}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan sebagai Draft"
                )}
              </Button>
              <Button
                type="button"
                onClick={onFinalizeClick}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Memfinalisasi...
                  </>
                ) : isEditMode ? (
                  "Update & Finalize"
                ) : (
                  "Buat & Finalize"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  try {
                    await pengembalianService.rollbackPengembalian(
                      Number(pengembalianId)
                    );
                    toast.success("Status pengembalian berhasil diupdate");
                    router.back();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Gagal rollback pengembalian"
                    );
                  }
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Rollback Pengembalian
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
        canDisabledBePicked={false}
      />
    </div>
  );
}
