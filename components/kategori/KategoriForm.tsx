import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
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
  is_active: z.boolean({ required_error: "Status harus dipilih salah satu" }),
  name: z.string().min(2, {
    message: "Nama harus memiliki minimal 2 karakter",
  }),
});

type formData = z.infer<typeof formSchema>;

interface KategoriFormProps {
  editing?: boolean;
  initialdata?: Partial<formData>;
  onSubmit: (data: formData) => void;
}

const KategoriForm: React.FC<KategoriFormProps> = ({
  editing = false,
  initialdata,
  onSubmit,
}) => {
  const form = useForm<formData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_active: initialdata?.is_active || true,
      name: initialdata?.name || "",
    },
  });
  const handleSubmit = (data: formData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name={"name"}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={"text-right min-w-[80px]"}>
                  Nama
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Input placeholder="Masukkan Nama" {...field} />
                  </FormControl>
                </div>
              </FormItem>
            )}
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
export default KategoriForm;
