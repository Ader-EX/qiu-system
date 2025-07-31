// components/SearchableSelect.tsx
import {useEffect, useState} from "react";
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
}

export default function SearchableSelect<T extends { id: number | string }>({
                                                                                label,
                                                                                placeholder,
                                                                                value,
                                                                                onChange,
                                                                                fetchData,
                                                                                renderLabel,
                                                                            }: SearchableSelectProps<T>) {
    const [options, setOptions] = useState<T[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const loadOptions = async (search = "") => {
        try {
            const res = await fetchData(search);
            setOptions(res.data || []);
        } catch (err) {
            console.error("Failed to fetch options", err);
        }
    };

    useEffect(() => {
        loadOptions();
    }, []);

    const handleSearchChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const input = e.target.value;
        setSearchTerm(input);

        if (input.length > 3) {
            await loadOptions(input);
        } else if (input.length === 0) {
            await loadOptions();
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value?.toString()} onValueChange={onChange}>
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
                    {options.length > 0 ? (
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
