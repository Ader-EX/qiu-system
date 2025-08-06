"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { SidebarHeaderBar } from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";
import SearchableSelect from "@/components/SearchableSelect";
import ItemSelectorDialog from "@/components/ItemSelectorDialog";

import {
  pembelianService,
  PembelianUpdate,
  Attachment,
} from "@/services/pembelianService";
import { Item } from "@/types/types";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { warehouseService } from "@/services/warehouseService";
import { jenisPembayaranService } from "@/services/mataUangService";
import { customerService } from "@/services/customerService";
import ImageUpload from "@/components/ImageUpload";

// Section layout component
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

// Zod schema for form validation
const pembelianUpdateSchema = z.object({
  no_pembelian: z.string().min(1, "No. Pembelian harus diisi"),
  warehouse_id: z.number().min(1, "Warehouse harus dipilih"),
  customer_id: z.string().min(1, "Customer harus dipilih"),
  top_id: z.number().min(1, "Jenis Pembayaran harus dipilih"),
  sales_date: z.date({ required_error: "Sales Date harus diisi" }),
  sales_due_date: z.date({ required_error: "Sales Due Date harus diisi" }),
  discount: z.number().min(0).default(0),
  additional_discount: z.number().min(0).default(0),
  expense: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        item_id: z.number().min(1),
        qty: z.number().min(1, "Quantity harus lebih dari 0"),
        unit_price: z.number().min(0),
        tax_percentage: z.number().min(0).default(10),
        price_before_tax: z.number().min(0),
      })
    )
    .min(1, "Minimal harus ada 1 item"),
  newAttachments: z.array(z.instanceof(File)).optional(),
});

type PembelianUpdateFormData = z.infer<typeof pembelianUpdateSchema>;

// Helper to convert File[] to FileList
const toFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};

export default function PembelianUpdateForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pembelianId } = React.use(params);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const form = useForm<PembelianUpdateFormData>({
    resolver: zodResolver(pembelianUpdateSchema),
    defaultValues: {
      no_pembelian: "",
      discount: 0,
      additional_discount: 0,
      expense: 0,
      items: [],
      newAttachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load existing purchase data on component mount
  useEffect(() => {
    const loadPembelianData = async () => {
      setIsLoading(true);
      try {
        const data = await pembelianService.getPembelianById(pembelianId);

        form.reset({
          no_pembelian: data.no_pembelian,
          warehouse_id: data.warehouse_id,
          customer_id: data.customer_id,
          top_id: data.top_id,
          sales_date: new Date(data.sales_date),
          sales_due_date: new Date(data.sales_due_date),
          discount: data.discount,
          additional_discount: data.additional_discount,
          expense: data.expense,
          items: data.pembelian_items.map((item: any) => ({
            item_id: parseInt(item.item_id),
            qty: item.qty,
            unit_price: item.unit_price,
            tax_percentage: 10, // Assuming 10% tax, adjust if available from API
            price_before_tax: item.unit_price / 1.1,
          })),
          newAttachments: [],
        });

        setSelectedItems(
          data.pembelian_items.map(
            (item: any) =>
              ({
                id: item.item_id,
                name: item.item_name,
                price: item.unit_price / 1.1,
              } as Item)
          )
        );

        setExistingAttachments(data.attachments || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load purchase data");
      } finally {
        setIsLoading(false);
      }
    };
    loadPembelianData();
  }, [pembelianId, form]);

  const handleRemoveExistingAttachment = async (attachmentId: number) => {
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
    data: PembelianUpdateFormData,
    finalize: boolean = false
  ) => {
    setIsSubmitting(true);

    try {
      // Step 1: Update the main purchase record
      const apiPayload: PembelianUpdate = {
        no_pembelian: data.no_pembelian,
        warehouse_id: data.warehouse_id,
        customer_id: data.customer_id,
        top_id: data.top_id,
        sales_date: data.sales_date.toISOString(),
        sales_due_date: data.sales_due_date.toISOString(),
        discount: data.discount,
        additional_discount: data.additional_discount,
        expense: data.expense,
        items: data.items.map((item) => ({
          item_id: item.item_id,
          qty: item.qty,
          unit_price: item.unit_price,
        })),
      };
      await pembelianService.updatePembelian(pembelianId, apiPayload);
      toast.success(`Purchase successfully updated.`);

      // Step 2: Upload any NEW files that have been added
      const filesToUpload = data.newAttachments || [];
      if (filesToUpload.length > 0) {
        toast.loading(`Uploading ${filesToUpload.length} new attachments...`, {
          id: "upload-toast",
        });
        const fileList = toFileList(filesToUpload);
        await pembelianService.uploadAttachments(pembelianId, fileList);
        toast.success("New attachments uploaded!", { id: "upload-toast" });
      }

      // Step 3: Finalize if requested
      if (finalize) {
        await pembelianService.finalizePembelian(parseInt(pembelianId, 10));
        toast.success(`Purchase has been successfully finalized`);
      }

      router.back();
    } catch (e: any) {
      toast.error(e?.message || "An error occurred during the update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        leftContent={
          <CustomBreadcrumb
            listData={["Pembelian", "Edit Pembelian"]}
            linkData={["/pembelian", `/pembelian/edit/${pembelianId}`]}
          />
        }
      />
      <Form {...form}>
        <form className="space-y-8">
          {/* --- Other form sections go here (Purchase Info, Customer, etc.) --- */}

          {/* --- Attachments Section --- */}
          <FormSection title={"Lampiran"}>
            {/* Display existing attachments */}
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
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <a
                          href={pembelianService.getDownloadUrl(
                            pembelianId,
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
                        <X className="h-4 w-4" />
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

            {/* Upload new attachments */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="newAttachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add New Attachments</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={field.onChange}
                        maxFiles={5}
                        maxSizeMB={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* --- Item Details and Totals --- */}
          {/* ... your item table and totals section ... */}

          {/* --- Form Actions --- */}
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
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => handleSubmit(data, false))}
            >
              {isSubmitting ? "Updating..." : "Update Draft"}
            </Button>
            <Button
              type="button"
              variant={"blue"}
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => handleSubmit(data, true))}
            >
              {isSubmitting ? "Finalizing..." : "Update & Finalize"}
            </Button>
          </div>
        </form>
      </Form>

      <ItemSelectorDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSelect={() => {}} // Replace with your handleAddItem logic
      />
    </div>
  );
}
