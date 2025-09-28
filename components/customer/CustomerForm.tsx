"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { SidebarHeaderBar } from "@/components/ui/SidebarHeaderBar";
import CustomBreadcrumb from "@/components/custom-breadcrumb";

import { TOPUnit } from "@/types/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { customerService } from "@/services/customerService";
import { QuickFormSearchableField } from "@/components/form/FormSearchableField";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { KodeLambungData } from "@/services/kodeLambungService";

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

// Customer schema with kode_lambung
const customerSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean().default(true),
  currency_id: z.coerce.number({
    required_error: "Currency is required",
  }),
  address: z.string().min(1, "Address is required"),
  kode_lambung: z.string().optional(),
  kode_lambung_items: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
      })
    )
    .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  mode: "add" | "edit" | "view";
  customerId?: string;
}

export default function CustomerForm({ mode, customerId }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preloadCurrency, setPreloadCurrency] = useState<TOPUnit | null>(null);
  const [kodeLambungItems, setKodeLambungItems] = useState<KodeLambungData[]>(
    []
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const router = useRouter();

  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: "",
      name: "",
      is_active: true,
      currency_id: undefined,
      address: "",
      kode_lambung_items: [],
    },
  });
  useEffect(() => {
    if ((mode !== "edit" && mode !== "view") || !customerId) {
      setIsDataLoaded(true);
      return;
    }

    const loadCustomerData = async () => {
      try {
        setIsDataLoaded(false);
        const data = await customerService.getById(Number(customerId));

        // Fix: Properly handle kode lambung array
        let kodeLambungArray: KodeLambungData[] = [];
        if (data.kode_lambung_rel && data.kode_lambung_rel.length > 0) {
          kodeLambungArray = data.kode_lambung_rel;
        }

        setKodeLambungItems(kodeLambungArray);

        if (data.curr_rel) {
          const preloadCurrencyData = {
            id: Number(data.curr_rel.id),
            name: data.curr_rel.name,
            symbol: data.curr_rel.symbol,
          } as TOPUnit;

          setPreloadCurrency(preloadCurrencyData);

          form.reset({
            code: data.code || "",
            name: data.name || "",
            is_active: data.is_active,
            currency_id: preloadCurrencyData.id,
            address: data.address || "",
            kode_lambung_items: kodeLambungArray, // Use the actual array
          });
        } else {
          setPreloadCurrency(null);
          form.reset({
            code: data.code || "",
            name: data.name || "",
            is_active: data.is_active,
            currency_id: undefined,
            address: data.address || "",
            kode_lambung_items: kodeLambungArray, // Use the actual array
          });
        }

        setIsDataLoaded(true);
      } catch (error: any) {
        toast.error(error.message || "Failed to load customer data");
        setIsDataLoaded(true);
      }
    };

    loadCustomerData();
  }, [mode, customerId, form]);

  const addKodeLambungItem = () => {
    const newItems = [...kodeLambungItems, { id: undefined, name: "" }]; // Add proper KodeLambungData object
    // @ts-ignore
    setKodeLambungItems(newItems);
    form.setValue("kode_lambung_items", newItems);
  };

  const removeKodeLambungItem = (index: number) => {
    const newItems = kodeLambungItems.filter((_, i) => i !== index);
    setKodeLambungItems(newItems);
    form.setValue("kode_lambung_items", newItems);
  };

  const updateKodeLambungItem = (index: number, value: string) => {
    const newItems = [...kodeLambungItems];
    newItems[index] = { ...newItems[index], name: value }; // Update the name property
    setKodeLambungItems(newItems);
    form.setValue("kode_lambung_items", newItems);
  };
  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      // Process kode lambung items properly for update
      let kodeLambungForSubmit: any = undefined;

      if (kodeLambungItems.length > 0) {
        // Filter out empty items and process them
        const validItems = kodeLambungItems.filter(
          (item) => item.name.trim() !== ""
        );

        if (validItems.length > 0) {
          if (isEditMode) {
            kodeLambungForSubmit = validItems.map((item) => ({
              ...(item.id && { id: item.id }),
              name: item.name.trim(),
            }));
          } else {
            kodeLambungForSubmit = validItems.map((item) => item.name.trim());
          }
        }
      }

      const submitData = {
        name: data.name,
        is_active: data.is_active ?? true,
        currency_id: data.currency_id,
        address: data.address,
        kode_lambungs: kodeLambungForSubmit,
      };

      // Debug log to see what's being sent
      console.log("Submit data:", submitData);
      console.log("Kode lambungs:", kodeLambungForSubmit);

      if (isEditMode && customerId) {
        await customerService.updateCustomer(customerId, submitData);
        toast.success("Customer berhasil diperbarui");
      } else {
        await customerService.createCustomer(submitData);
        toast.success("Customer berhasil ditambahkan");
      }

      router.push("/customer");
    } catch (error: any) {
      toast.error(error.detail || error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageTitle = () => {
    switch (mode) {
      case "add":
        return "Tambah Customer";
      case "edit":
        return "Edit Customer";
      case "view":
        return "Detail Customer";
      default:
        return "Customer";
    }
  };

  const getBreadcrumbData = () => {
    const baseList = ["Customers"];
    const baseLink = ["customer"];

    switch (mode) {
      case "add":
        return {
          listData: [...baseList, "Tambah Customer"],
          linkData: [...baseLink, "add"],
        };
      case "edit":
        return {
          listData: [...baseList, "Edit Customer"],
          linkData: [...baseLink, `edit/${customerId}`],
        };
      case "view":
        return {
          listData: [...baseList, "Detail Customer"],
          linkData: [...baseLink, `view/${customerId}`],
        };
      default:
        return {
          listData: baseList,
          linkData: baseLink,
        };
    }
  };

  const breadcrumbData = getBreadcrumbData();

  if ((isEditMode || isViewMode) && !isDataLoaded) {
    return (
      <div className="space-y-6">
        <SidebarHeaderBar
          leftContent={
            <CustomBreadcrumb
              listData={breadcrumbData.listData}
              linkData={breadcrumbData.linkData}
            />
          }
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SidebarHeaderBar
        leftContent={
          <CustomBreadcrumb
            listData={breadcrumbData.listData}
            linkData={breadcrumbData.linkData}
          />
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <FormSection title="Informasi Dasar">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nama Customer *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama customer"
                      disabled={isViewMode}
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
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={isViewMode}
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value.toString()}
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
          </FormSection>

          {/* Currency & Address */}
          <FormSection title="Detail Tambahan">
            <QuickFormSearchableField
              control={form.control}
              name="currency_id"
              type="currency"
              label="Mata Uang *"
              placeholder="Pilih Mata Uang"
              disabled={isViewMode}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan alamat lengkap customer"
                      rows={3}
                      disabled={isViewMode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Kode Lambung Section */}
          <FormSection title="Kode Lambung">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Kode Lambung</FormLabel>
                {!isViewMode && kodeLambungItems.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKodeLambungItem}
                    className="px-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="ml-1">Tambah Kode</span>
                  </Button>
                )}
              </div>

              {kodeLambungItems.length === 0 ? (
                <div className="text-gray-500 italic">
                  Tidak ada kode lambung
                </div>
              ) : (
                kodeLambungItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder={`Kode ${index + 1}`}
                        value={item.name}
                        disabled={isViewMode}
                        onChange={(e) =>
                          updateKodeLambungItem(index, e.target.value)
                        }
                      />
                    </div>
                    {!isViewMode && (
                      <div className="flex space-x-1">
                        <ConfirmationDialog
                          title={"Konfirmasi hapus kode lambung"}
                          description={
                            "Apakah Anda yakin ingin menghapus kode lambung ini?"
                          }
                          handleOnClick={() => removeKodeLambungItem(index)}
                        />
                        {index === kodeLambungItems.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addKodeLambungItem}
                            className="px-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t space-x-2">
            <Button
              variant="destructive"
              onClick={() => router.back()}
              type="button"
            >
              {isViewMode ? "Kembali" : "Batal"}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update"
                  : "Tambah"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
