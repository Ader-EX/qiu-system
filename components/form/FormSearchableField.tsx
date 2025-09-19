// components/form/FormSearchableField.tsx
import {FormField, FormItem, FormMessage} from "@/components/ui/form";
import SearchableSelect from "@/components/SearchableSelect";
import {Control, FieldPath, FieldValues} from "react-hook-form";
import {vendorService} from "@/services/vendorService";
import {warehouseService} from "@/services/warehouseService";
import {sumberdanaService} from "@/services/sumberdanaservice";
import {jenisPembayaranService} from "@/services/mataUangService";
import {customerService} from "@/services/customerService";

interface FormSearchableFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    placeholder: string;
    disabled?: boolean;
    fetchData: (search: string) => Promise<{ data: any[]; total: number }>;
    renderLabel: (item: any) => string;
    fetchById?: (id: string | number) => Promise<any>;
    transform?: (value: any) => any; // for Number() conversion etc
}

export function FormSearchableField<T extends FieldValues>({
                                                               control,
                                                               name,
                                                               label,
                                                               placeholder,
                                                               disabled = false,
                                                               fetchData,
                                                               renderLabel,
                                                               fetchById,
                                                               transform = (val: any) => val
                                                           }: FormSearchableFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <SearchableSelect
                        label={label}
                        placeholder={placeholder}
                        value={field.value ?? undefined}
                        preloadValue={field.value}
                        onChange={(value) => field.onChange(transform(value))}
                        disabled={disabled}
                        fetchById={fetchById}
                        fetchData={fetchData}
                        renderLabel={renderLabel}
                    />
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

// Usage in your form would become:
// <FormSearchableField
//   control={form.control}
//   name="vendor_id"
//   label="Vendor"
//   placeholder="Pilih Vendor"
//   disabled={isViewMode}
//   fetchById={async (id) => {
//     const response = await vendorService.getForSearchable(id);
//     return { id: response.id, name: response.name };
//   }}
//   fetchData={async (search) => {
//     return await vendorService.getAllVendors({
//       skip: 0,
//       limit: 10,
//       is_active: !isViewMode,
//       contains_deleted: isViewMode,
//       search_key: search,
//     });
//   }}
//   renderLabel={(item: any) => `${item.id} - ${item.name} ${item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""}`}
// />

// Or even simpler with predefined configs:

interface SearchableFieldConfig {
    fetchData: (includeDeleted: boolean) => (search: string) => Promise<{ data: any[]; total: number }>;
    fetchById?: (id: string | number) => Promise<any>;
    renderLabel: (item: any) => string;
    transform?: (value: any) => any;
}

const FIELD_CONFIGS: Record<string, SearchableFieldConfig> = {
    vendor: {
        fetchData: (includeDeleted) => async (search) => {
            return await vendorService.getAllVendors({
                skip: 0,
                limit: 10,
                contains_deleted: includeDeleted,
                is_active: !includeDeleted,
                search_key: search,
            });
        },
        fetchById: async (id) => {
            const response = await vendorService.getForSearchable(id);
            return {id: response.id, name: response.name};
        },
        renderLabel: (item: any) => `${item.id} - ${item.name} ${item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""}`,
    },

    customer: {
        fetchData: (includeDeleted) => async (search) => {
            return await customerService.getAllCustomers({
                page: 0,
                rowsPerPage: 10,
                contains_deleted: includeDeleted,
                is_active: !includeDeleted,
                search_key: search,
            });
        },
        fetchById: async (id) => {
            const response = await customerService.getById(Number(id));
            return {id: response.id, name: response.name};
        },
        renderLabel: (item: any) => `${item.id} - ${item.name} ${item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""}`,
    },
    warehouse: {
        fetchData: (includeDeleted) => async (search) => {
            return await warehouseService.getAllWarehouses({
                skip: 0,
                limit: 10,
                contains_deleted: includeDeleted,
                is_active: !includeDeleted,
                search: search,
            });
        },
        fetchById: async (id) => {
            const response = await warehouseService.getForSearchable(id);
            return {id: response.id, name: response.name};
        },
        renderLabel: (item: any) => item.name,
        transform: (val: any) => Number(val),
    },
    sumberdana: {
        fetchData: (includeDeleted) => async (search) => {
            return await sumberdanaService.getAllSumberdanas({
                skip: 0,
                limit: 10,
                contains_deleted: includeDeleted,
                is_active: !includeDeleted,
                search: search,
            });
        },
        fetchById: async (id) => sumberdanaService.getById(Number(id)),
        renderLabel: (item: any) => `${item.id} - ${item.name}`,
        transform: (val: any) => Number(val),
    },
    payment_type: {
        fetchData: (includeDeleted) => async (search) => {
            return await jenisPembayaranService.getAllMataUang({
                skip: 0,
                limit: 10,
                contains_deleted: includeDeleted,
                is_active: !includeDeleted,
                search: search,
            });
        },
        renderLabel: (item: any) => `${item.symbol} - ${item.name}`,
        transform: (val: any) => Number(val),
    },
};

interface QuickFormSearchableFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    type: keyof typeof FIELD_CONFIGS;
    label: string;
    placeholder: string;
    disabled?: boolean;
}

export function QuickFormSearchableField<T extends FieldValues>({
                                                                    control,
                                                                    name,
                                                                    type,
                                                                    label,
                                                                    placeholder,
                                                                    disabled = false
                                                                }: QuickFormSearchableFieldProps<T>) {
    const config = FIELD_CONFIGS[type];

    return (
        <FormSearchableField
            control={control}
            name={name}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            fetchData={config.fetchData(disabled)} // use disabled as includeDeleted flag
            fetchById={config.fetchById}
            renderLabel={config.renderLabel}
            transform={config.transform}
        />
    );
}

// Now usage becomes just:
// <QuickFormSearchableField
//   control={form.control}
//   name="vendor_id"
//   type="vendor"
//   label="Vendor"
//   placeholder="Pilih Vendor"
//   disabled={isViewMode}
// />