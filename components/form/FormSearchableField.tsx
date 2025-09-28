// components/form/FormSearchableField.tsx
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import SearchableSelect from "@/components/SearchableSelect";
import { Control, FieldPath, FieldValues, useWatch } from "react-hook-form";
import { vendorService } from "@/services/vendorService";
import { warehouseService } from "@/services/warehouseService";
import { sumberdanaService } from "@/services/sumberdanaservice";
import {
  jenisPembayaranService,
  mataUangService,
  satuanService,
} from "@/services/mataUangService";
import { customerService } from "@/services/customerService";
import { kategoriService } from "@/services/kategoriService";
import { kodeLambungService } from "@/services/kodeLambungService";

interface FormSearchableFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  disabled?: boolean;
  fetchData: (
    search: string,
    dynamicParam?: any
  ) => Promise<{ data: any[]; total: number }>;
  renderLabel: (item: any) => string;
  fetchById?: (id: string | number) => Promise<any>;
  transform?: (value: any) => any;
  dynamicParam?: any;
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
  transform = (val: any) => val,
  dynamicParam,
}: FormSearchableFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <SearchableSelect
            key={`${name}-${dynamicParam}-${String(field.value ?? "")}`}
            label={label}
            placeholder={placeholder}
            value={field.value ?? undefined}
            preloadValue={field.value}
            onChange={(value) => field.onChange(transform(value))}
            disabled={disabled}
            fetchById={fetchById}
            fetchData={(search) => fetchData(search, dynamicParam)}
            renderLabel={renderLabel}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SearchableFieldConfig {
  fetchData: (includeDeleted: boolean) => (
    search: string,
    dynamicParam?: any
  ) => Promise<{
    data: any[];
    total: number;
  }>;
  fetchById?: (id: string | number) => Promise<any>;
  renderLabel: (item: any) => string;
  transform?: (value: any) => any;
  requiresParam?: boolean; // New flag to indicate if this field requires a parameter
}

const FIELD_CONFIGS: Record<string, SearchableFieldConfig> = {
  vendor: {
    fetchData: (includeDeleted) => async (search) => {
      return await vendorService.getAllVendors({
        skip: 0,
        limit: 3,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search_key: search,
      });
    },
    fetchById: async (id) => {
      const response = await vendorService.getForSearchable(id);
      return { id: response.id, name: response.name };
    },
    renderLabel: (item: any) =>
      `${item.id} - ${item.name} ${
        item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""
      }`,
  },
  category_one: {
    fetchData: (includeDeleted) => async (search) => {
      return await kategoriService.getAllCategories({
        skip: 0,
        limit: 3,
        type: 1,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search: search,
      });
    },
    fetchById: async (id) => {
      const response = await kategoriService.getById(Number(id));
      return { id: response.id, name: response.name };
    },
    renderLabel: (item: any) => `${item.name}`,
  },
  currency: {
    fetchData: (includeDeleted) => async (search) => {
      return await mataUangService.getAllMataUang({
        skip: 0,
        limit: 3,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search: search,
      });
    },
    fetchById: async (id) => {
      const response = await mataUangService.getMataUang(Number(id));
      return { id: response.id, symbol: response.symbol, name: response.name };
    },
    renderLabel: (item: any) => `${item.symbol} - ${item.name}`,
  },
  satuan: {
    fetchData: (includeDeleted) => async (search) => {
      return await satuanService.getAllMataUang({
        skip: 0,
        limit: 3,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search: search,
      });
    },
    fetchById: async (id) => {
      const response = await satuanService.getMataUang(Number(id));
      return { id: response.id, symbol: response.symbol, name: response.name };
    },
    renderLabel: (item: any) => `${item.symbol} - ${item.name}`,
  },
  category_two: {
    fetchData: (includeDeleted) => async (search) => {
      return await kategoriService.getAllCategories({
        skip: 0,
        limit: 3,
        type: 2,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search: search,
      });
    },
    fetchById: async (id) => {
      const response = await kategoriService.getById(Number(id));
      return { id: response.id, name: response.name };
    },
    renderLabel: (item: any) => `${item.name}`,
  },
  customer: {
    fetchData: (includeDeleted) => async (search) => {
      return await customerService.getAllCustomers({
        page: 0,
        rowsPerPage: 3,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search_key: search,
      });
    },
    fetchById: async (id) => {
      const response = await customerService.getById(Number(id));
      return { id: response.id, code: response.code, name: response.name };
    },
    renderLabel: (item: any) =>
      `${item.code} - ${item.name} ${
        item?.curr_rel?.symbol ? `(${item.curr_rel.symbol})` : ""
      }`,
  },
  warehouse: {
    fetchData: (includeDeleted) => async (search) => {
      return await warehouseService.getAllWarehouses({
        skip: 0,
        limit: 3,
        contains_deleted: includeDeleted,
        is_active: !includeDeleted,
        search: search,
      });
    },
    fetchById: async (id) => {
      const response = await warehouseService.getForSearchable(id);
      return { id: response.id, name: response.name };
    },
    renderLabel: (item: any) => item.name,
    transform: (val: any) => Number(val),
  },
  kodelambung: {
    fetchData: (includeDeleted) => async (search, customer_id) => {
      return await kodeLambungService.getAll({
        page: 1,
        size: 3,
        contains_deleted: includeDeleted,
        search: search,
        customer_id: customer_id, // Use the dynamic parameter
      });
    },
    fetchById: async (id) => kodeLambungService.getById(Number(id)),
    renderLabel: (item: any) => `${item.name}`,
    transform: (val: any) => Number(val),
    requiresParam: true, // This field requires a customer_id parameter
  },
  sumberdana: {
    fetchData: (includeDeleted) => async (search) => {
      return await sumberdanaService.getAllSumberdanas({
        skip: 0,
        limit: 3,
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
        limit: 3,
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
  dynamicParam?: any; // New prop for dynamic parameters
  watchField?: FieldPath<T>; // Field to watch for conditional rendering
  showCondition?: (watchedValue: any) => boolean; // Condition function
}

export function QuickFormSearchableField<T extends FieldValues>({
  control,
  name,
  type,
  label,
  placeholder,
  disabled = false,
  dynamicParam,
  watchField,
  showCondition,
}: QuickFormSearchableFieldProps<T>) {
  const config = FIELD_CONFIGS[type];

  // Watch the specified field for conditional rendering
  const watchedValue = watchField
    ? useWatch({
        control,
        name: watchField,
      })
    : null;

  // Check if field should be shown
  const shouldShow = !showCondition || showCondition(watchedValue);

  // Don't render if condition is not met
  if (!shouldShow) {
    return null;
  }

  return (
    <FormSearchableField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      fetchData={config.fetchData(disabled)}
      fetchById={config.fetchById}
      renderLabel={config.renderLabel}
      transform={config.transform}
      dynamicParam={dynamicParam}
    />
  );
}
