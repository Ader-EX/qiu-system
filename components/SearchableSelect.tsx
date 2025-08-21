import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchableSelectProps<T extends { id: number | string }> {
  label: string;
  placeholder: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  fetchData: (search: string) => Promise<{ data: T[]; total: number }>;
  renderLabel: (item: T) => string;
  preloadValue?: string | number;
  disabled?: boolean;
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
}: SearchableSelectProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef("");

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

  // Initialize component
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // First load with empty search to get initial data
      await fetchOptions("");

      // If we have a preload value and it's not in the current options, try to load it
      if (preloadValue && preloadValue !== "all") {
        try {
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
        } catch (error) {
          console.error("Failed to preload item:", error);
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
  }, []); // Only run once on mount

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
  };

  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    if (!open && searchTerm) {
      setSearchTerm("");
      // Reset to initial options if we were searching
      if (currentSearchRef.current !== "") {
        fetchOptions("");
      }
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
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder={`Cari ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <SelectItem value={INTERNAL_ALL_VALUE}>{placeholder}</SelectItem>

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
