import {useEffect, useState, useCallback} from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface SearchableSelectProps<T extends { id: number | string }> {
    label: string;
    placeholder: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    fetchData: (search: string) => Promise<{ data: T[]; total: number }>;
    renderLabel: (item: T) => string;
    preloadValue?: string | number;
    disabled?: boolean
}

const INTERNAL_ALL_VALUE = "__all__";

export default function SearchableSelect<T extends { id: number | string }>({
                                                                                label,
                                                                                placeholder,
                                                                                value,
                                                                                onChange,
                                                                                fetchData,
                                                                                renderLabel,
                                                                                preloadValue,
                                                                                disabled = false
                                                                            }: SearchableSelectProps<T>) {
    const [options, setOptions] = useState<T[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [preloadComplete, setPreloadComplete] = useState(false);

    const loadOptions = useCallback(async (search = "") => {
        try {
            setIsLoading(true);
            const res = await fetchData(search);
            setOptions(prevOptions => {
                // Merge with existing options to avoid losing preloaded items
                const newOptions = res.data || [];
                const existingIds = prevOptions.map(opt => opt.id.toString());
                const uniqueNewOptions = newOptions.filter(
                    opt => !existingIds.includes(opt.id.toString())
                );
                return [...prevOptions, ...uniqueNewOptions];
            });
        } catch (err) {
            console.error("Failed to fetch options", err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchData]);

    // Preload specific item if needed
    const preloadSpecificItem = useCallback(async (itemId: string | number) => {
        try {
            // You might need a specific endpoint to fetch by ID
            // For now, we'll search for all items and hope it's included
            const res = await fetchData("");
            const foundItem = res.data?.find(item => item.id.toString() === itemId.toString());

            if (foundItem) {
                setOptions(prevOptions => {
                    const exists = prevOptions.some(opt => opt.id.toString() === itemId.toString());
                    return exists ? prevOptions : [foundItem, ...prevOptions];
                });
            }
        } catch (err) {
            console.error("Failed to preload specific item", err);
        }
    }, [fetchData]);

    // Initial load and preload
    useEffect(() => {
        const initialize = async () => {
            // If we have a preload value, load it first
            if (preloadValue && preloadValue !== "all") {
                await preloadSpecificItem(preloadValue);
            }

            // Then load the general options
            await loadOptions();
            setPreloadComplete(true);
        };

        initialize();
    }, [loadOptions, preloadSpecificItem, preloadValue]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setSearchTerm(input);

        if (input.length > 3) {
            await loadOptions(input);
        } else if (input.length === 0) {
            await loadOptions();
        }
    };

    const internalValue =
        value === "all" || value === undefined
            ? INTERNAL_ALL_VALUE
            : value.toString();

    const handleInternalChange = (val: string) => {
        onChange(val === INTERNAL_ALL_VALUE ? "all" : val);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={internalValue} onValueChange={handleInternalChange} disabled={disabled || false}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2">
                        <Input
                            placeholder={`Cari ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full"
                        />
                    </div>

                    <SelectItem value={INTERNAL_ALL_VALUE}>{placeholder}</SelectItem>

                    {isLoading && !preloadComplete ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                                {renderLabel(item)}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            Tidak ada data
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

// Usage in your FormField:
/*
<SearchableSelect
    label="Jenis Pembayaran"
    placeholder="Pilih Jenis Pembayaran"
    value={field.value ?? undefined}
    preloadValue={field.value} // Add this line
    onChange={(value) => {
        console.log("[Payment] Selected value:", value);
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
*/