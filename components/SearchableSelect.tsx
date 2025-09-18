import {useEffect, useState, useRef} from "react";
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
    disabled?: boolean;
    fetchById?: (id: string | number) => Promise<T>;
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
                                                                                disabled = false,
                                                                                fetchById,
                                                                            }: SearchableSelectProps<T>) {
    const [options, setOptions] = useState<T[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentSearchRef = useRef("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Simple data fetching function
    const fetchOptions = async (search: string) => {
        try {
            setIsLoading(true);
            const response = await fetchData(search);
            setOptions(response.data || []);
            currentSearchRef.current = search;
        } catch (error) {
            console.error("Failed to fetch options:", error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Preload specific item by ID
    const preloadSpecificItem = async (itemId: string | number) => {
        if (!fetchById) return null;

        try {
            const item = await fetchById(itemId);
            return item;
        } catch (error) {
            console.error("Failed to preload specific item:", error);
            return null;
        }
    };

    // Initialize component
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            // First, try to preload the specific item if we have preloadValue and fetchById
            let preloadedItem: T | null = null;
            if (preloadValue && preloadValue !== "all" && fetchById) {
                preloadedItem = await preloadSpecificItem(preloadValue);
            }

            // Then load initial data with empty search
            await fetchOptions("");

            if (preloadedItem && isMounted) {
                setOptions((prev) => {
                    const exists = prev.some(
                        (opt) => opt.id.toString() === preloadValue?.toString()
                    );
                    return exists ? prev : [preloadedItem, ...prev];
                });
            } else if (preloadValue && preloadValue !== "all") {
                const response = await fetchData("");
                const foundItem = response.data?.find(
                    (item) => item.id.toString() === preloadValue.toString()
                );

                if (foundItem && isMounted) {
                    setOptions((prev) => {
                        const exists = prev.some(
                            (opt) => opt.id.toString() === preloadValue.toString()
                        );
                        return exists ? prev : [foundItem, ...prev];
                    });
                }
            }

            if (isMounted) {
                setInitialized(true);
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, [preloadValue, fetchById]);

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce the search
        debounceTimeoutRef.current = setTimeout(() => {
            fetchOptions(newSearchTerm);
        }, 300);
    };

    // Handle value changes
    const internalValue =
        value === "all" || value === undefined
            ? INTERNAL_ALL_VALUE
            : value.toString();

    const handleInternalChange = (val: string) => {
        onChange(val === INTERNAL_ALL_VALUE ? "all" : val);
        setIsOpen(false); // Close dropdown after selection
    };

    // Handle dropdown open/close
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            // When opening, focus the search input after a short delay
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            // When closing, reset search
            if (searchTerm) {
                setSearchTerm("");
                // Reset to initial options if we were searching
                if (currentSearchRef.current !== "") {
                    fetchOptions("");
                }
            }
        }
    };

    // Prevent input events from bubbling up and closing the dropdown
    const handleInputMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        // Prevent certain keys from bubbling up to the Select component
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.stopPropagation();
        }
        // Allow Escape to close the dropdown
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select
                value={internalValue}
                onValueChange={handleInternalChange}
                disabled={disabled}
                open={isOpen}
                onOpenChange={handleOpenChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent
                    className="max-h-[300px] overflow-y-auto"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div
                        className="p-2 sticky top-0 bg-background border-b z-10"
                        onMouseDown={handleInputMouseDown}
                    >
                        <Input
                            ref={searchInputRef}
                            placeholder={`Cari ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleInputKeyDown}
                            onMouseDown={handleInputMouseDown}
                            onFocus={(e) => e.stopPropagation()}
                            className="w-full"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>

                    <SelectItem
                        disabled
                        className="opacity-50"
                        value={INTERNAL_ALL_VALUE}
                    >
                        {placeholder}
                    </SelectItem>

                    {!initialized || isLoading ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                                {renderLabel(item)}
                            </SelectItem>
                        ))
                    ) : searchTerm ? (
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