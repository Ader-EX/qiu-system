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
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import React from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const formSchema = z.object({
    username: z.string().min(5, {
        message: "username harus minimal 5 karakter.",
    }),
    role: z.number().min(0).max(2),
    password: z.string().min(6, {
        message: "Password harus minimal 6 karakter.",
    }),
    is_active: z.boolean({
        required_error: "Status harus dipilih.",
    }),

});

type FormData = z.infer<typeof formSchema>;

interface UserFormProps {
    editing?: boolean;
    initialData?: Partial<FormData>;
    onSubmit: (data: FormData) => void;
}

const UserMgmtForm: React.FC<UserFormProps> = ({
                                                   editing = false,
                                                   initialData,
                                                   onSubmit,
                                               }) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: initialData?.username || "",
            role: initialData?.role || 0,
            password: initialData?.password || "",
            is_active: initialData?.is_active || true,
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
                        name={"username"}
                        render={({field}) => (
                            <FormItem className="">
                                <FormLabel className="text-right min-w-[80px]">Username</FormLabel>
                                <div className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Masukkan nama username" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name={"password"}
                        render={({field}) => (
                            <FormItem className="">
                                <FormLabel className="text-right min-w-[80px]">Password</FormLabel>
                                <div className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Masukkan password user" type={"password"} {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        render={({field}) => (
                            <FormItem className={""}>
                                <FormLabel className="text-right min-w-[80px]">
                                    Role
                                </FormLabel>
                                <div className="flex-1">
                                    <Select
                                        value={field?.value?.toString()}
                                        onValueChange={(value) => field.onChange(value ? parseInt(value) : 0)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Role"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="0">Owner</SelectItem>
                                            <SelectItem value="1">Manager</SelectItem>
                                            <SelectItem value="2">Staff</SelectItem>

                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                        name={"role"}
                    />

                    <FormField
                        control={form.control}
                        render={({field}) => (
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
                                                <SelectValue placeholder="Pilih status"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Aktif ✅</SelectItem>
                                            <SelectItem value="false">Non Aktif ❌</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
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

export default UserMgmtForm;
