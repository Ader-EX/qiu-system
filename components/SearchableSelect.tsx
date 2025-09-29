import {useEffect, useState, useRef, useCallback} from "react";
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
const MIN_SEARCH_LENGTH = 3;

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

    // Cache to store fetched items and avoid redundant API calls
    const itemCacheRef = useRef<Map<string, T>>(new Map());
    const searchCacheRef = useRef<Map<string, { data: T[]; timestamp: number }>>(new Map());
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentSearchRef = useRef("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const initializationPromiseRef = useRef<Promise<void> | null>(null);

    // Cache TTL (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;

    // Check if cache entry is still valid
    const isCacheValid = useCallback((timestamp: number) => {
        return Date.now() - timestamp < CACHE_TTL;
    }, []);

    // Get cached search results if valid
    const getCachedSearchResult = useCallback((search: string) => {
        const cached = searchCacheRef.current.get(search);
        return cached && isCacheValid(cached.timestamp) ? cached.data : null;
    }, [isCacheValid]);

    // Cache search results
    const setCachedSearchResult = useCallback((search: string, data: T[]) => {
        searchCacheRef.current.set(search, {data, timestamp: Date.now()});
        // Also cache individual items
        data.forEach(item => {
            itemCacheRef.current.set(item.id.toString(), item);
        });
    }, []);

    // Get cached item by ID
    const getCachedItem = useCallback((id: string | number) => {
        return itemCacheRef.current.get(id.toString());
    }, []);

    // Cache individual item
    const setCachedItem = useCallback((item: T) => {
        itemCacheRef.current.set(item.id.toString(), item);
    }, []);

    // Optimized data fetching with caching
    const fetchOptions = useCallback(async (search: string) => {
        // Check cache first
        const cachedResult = getCachedSearchResult(search);
        if (cachedResult) {
            setOptions(cachedResult);
            currentSearchRef.current = search;
            return cachedResult;
        }

        try {
            setIsLoading(true);
            const response = await fetchData(search);
            const data = response.data || [];

            setOptions(data);
            setCachedSearchResult(search, data);
            currentSearchRef.current = search;

            return data;
        } catch (error) {
            console.error("Failed to fetch options:", error);
            setOptions([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, getCachedSearchResult, setCachedSearchResult]);

    // Smart preload function that uses cache when possible
    const smartPreloadItem = useCallback(async (itemId: string | number): Promise<T | null> => {
        // First check if item is already cached
        const cachedItem = getCachedItem(itemId);
        if (cachedItem) {
            return cachedItem;
        }

        // If we have fetchById, use it
        if (fetchById) {
            try {
                const item = await fetchById(itemId);
                setCachedItem(item);
                return item;
            } catch (error) {
                console.error("Failed to preload specific item:", error);
            }
        }

        // Fall back to searching in initial data (empty search)
        // This might already be cached from previous calls
        try {
            const initialData = await fetchOptions("");
            const foundItem = initialData.find(
                (item) => item.id.toString() === itemId.toString()
            );
            return foundItem || null;
        } catch (error) {
            console.error("Failed to find item in initial data:", error);
            return null;
        }
    }, [getCachedItem, setCachedItem, fetchById, fetchOptions]);

    const initialize = useCallback(async () => {
        setIsLoading(true);

        try {
            let preloadedItem: T | null = null;
            let initialData: T[] = [];

            if (preloadValue && preloadValue !== "all") {
                preloadedItem = await smartPreloadItem(preloadValue);
            }

            initialData = await fetchOptions("");

            if (preloadedItem) {
                const exists = initialData.some(
                    (opt) => opt.id.toString() === preloadValue?.toString()
                );
                if (!exists) {
                    const combinedData = [preloadedItem, ...initialData];
                    setOptions(combinedData);

                    setCachedSearchResult("", combinedData);
                } else {
                    setOptions(initialData);
                }
            } else {
                setOptions(initialData);
            }

            setInitialized(true);
        } catch (error) {
            console.error("Failed to initialize SearchableSelect:", error);
            setOptions([]);
            setInitialized(true);
        } finally {
            setIsLoading(false);
        }
    }, [preloadValue, smartPreloadItem, fetchOptions, setCachedSearchResult]);

    useEffect(() => {
        setInitialized(false);
        initializationPromiseRef.current = null;

        if (!initializationPromiseRef.current) {
            initializationPromiseRef.current = initialize();
        }

        return () => {
            // Don't reset the promise in cleanup unless preloadValue changes
        };
    }, [preloadValue]); // Only re-run when preloadValue changes

    // Separate effect for the initialize function to avoid infinite loops
    useEffect(() => {
        if (!initialized && !initializationPromiseRef.current) {
            initializationPromiseRef.current = initialize();
        }
    }, [initialize, initialized]);
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Don't search if less than MIN_SEARCH_LENGTH characters (but allow empty string for reset)
        if (newSearchTerm.length > 0 && newSearchTerm.length < MIN_SEARCH_LENGTH) {
            // Still show cached empty results if available when user has typed less than 3 chars
            const cachedInitial = getCachedSearchResult("");
            if (cachedInitial) {
                setOptions(cachedInitial);
            }
            return;
        }

        // Check cache immediately for instant response
        const cachedResult = getCachedSearchResult(newSearchTerm);
        if (cachedResult) {
            setOptions(cachedResult);
            currentSearchRef.current = newSearchTerm;
            return;
        }

        // Debounce the actual API call
        debounceTimeoutRef.current = setTimeout(() => {
            fetchOptions(newSearchTerm);
        }, 300);
    }, [fetchOptions, getCachedSearchResult]);

    const internalValue =
        value === "all" || value === undefined || value === 0 || value === ""
            ? INTERNAL_ALL_VALUE
            : value.toString();

    const handleInternalChange = useCallback((val: string) => {
        onChange(val === INTERNAL_ALL_VALUE ? "all" : val);
        setIsOpen(false);
    }, [onChange]);

    // Handle dropdown open/close
    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);

        if (open) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            if (searchTerm) {
                setSearchTerm("");
                // Reset to cached initial options if available
                const cachedInitial = getCachedSearchResult("");
                if (cachedInitial && currentSearchRef.current !== "") {
                    setOptions(cachedInitial);
                    currentSearchRef.current = "";
                } else if (currentSearchRef.current !== "") {
                    fetchOptions("");
                }
            }
        }
    }, [searchTerm, getCachedSearchResult, fetchOptions]);

    const handleInputMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.stopPropagation();
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Clear cache when component unmounts or after a long time
    useEffect(() => {
        const clearCacheInterval = setInterval(() => {
            const now = Date.now();
            // Clear expired search cache entries
            for (const [key, value] of searchCacheRef.current.entries()) {
                if (!isCacheValid(value.timestamp)) {
                    searchCacheRef.current.delete(key);
                }
            }
        }, CACHE_TTL);

        return () => {
            clearInterval(clearCacheInterval);
        };
    }, [isCacheValid, CACHE_TTL]);

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
                        onTouchStart={handleInputMouseDown}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        <Input
                            ref={searchInputRef}
                            placeholder={`Cari ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleInputKeyDown}
                            onMouseDown={handleInputMouseDown}
                            onTouchStart={handleInputMouseDown}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            className="w-full"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            type="text"
                        />
                        {searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Ketik minimal {MIN_SEARCH_LENGTH} karakter untuk mencari
                            </p>
                        )}
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