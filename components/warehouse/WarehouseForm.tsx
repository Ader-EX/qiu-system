import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  address: z.string().min(5, {
    message: "Alamat harus minimal 5 karakter.",
  }),
  is_active: z.boolean({
    required_error: "Status harus dipilih.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface WarehouseFormProps {
  editing?: boolean;
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  editing = false,
  initialData,
  onSubmit,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      is_active: initialData?.is_active || false,
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };
  return (
    <Form {...form}>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="flex flex-col space-y-4">
          <FormField
            name={"name"}
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-right min-w-[80px]">Nama</FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Input placeholder="Masukkan nama warehouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right min-w-[80px]">
                  Alamat
                </FormLabel>
                <div className={"flex-1"}>
                  <FormControl>
                    <Input placeholder="Masukkan alamat" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
            name={"address"}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className={""}>
                <FormLabel className="text-right min-w-[80px]">
                  Status
                </FormLabel>
                <div className="flex-1">
                  <Select
                    value={field?.value?.toString()}
                    onValueChange={(value) => field.onChange(value === "true")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Aktif ✅</SelectItem>
                      <SelectItem value="false">Non Aktif ❌</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              </FormItem>
            )}
            name={"is_active"}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Menyimpan..."
            : editing
            ? "Perbarui"
            : "Simpan"}
        </Button>
      </DialogFooter>
    </Form>
  );
};

export default WarehouseForm;
