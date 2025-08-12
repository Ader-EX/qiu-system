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

            setOptions(res.data || []);
        } catch (err) {
            console.error("Failed to fetch options", err);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [fetchData]);

    const preloadSpecificItem = useCallback(async (itemId: string | number) => {
        try {
            const res = await fetchData("");
            const foundItem = res.data?.find(item => item.id.toString() === itemId.toString());

            if (foundItem) {
                setOptions(prevOptions => {
                    const exists = prevOptions.some(opt => opt.id.toString() === itemId.toString());
                    if (exists) {
                        return prevOptions;
                    }
                    // Add the preloaded item to the beginning
                    return [foundItem, ...prevOptions];
                });
            }
        } catch (err) {
            console.error("Failed to preload specific item", err);
        }
    }, [fetchData]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (searchValue: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    loadOptions(searchValue);
                }, 300); // 300ms delay
            };
        })(),
        [loadOptions]
    );

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setSearchTerm(input);

        // Trigger search immediately for any input change
        if (input.length === 0) {
            // Reset to initial options when search is cleared
            loadOptions();
        } else {
            // Use debounced search for any non-empty input
            debouncedSearch(input);
        }
    };

    const internalValue =
        value === "all" || value === undefined
            ? INTERNAL_ALL_VALUE
            : value.toString();

    const handleInternalChange = (val: string) => {
        onChange(val === INTERNAL_ALL_VALUE ? "all" : val);
    };

    // Clear search when dropdown closes
    const handleOpenChange = (open: boolean) => {
        if (!open && searchTerm) {
            setSearchTerm("");
            loadOptions(); // Reload initial options
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select
                value={internalValue}
                onValueChange={handleInternalChange}
                disabled={disabled || false}
                onOpenChange={handleOpenChange}
            >
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
                            onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
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
                    ) : searchTerm && !isLoading ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            Tidak ditemukan hasil untuk "{searchTerm}"
                        </div>
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
