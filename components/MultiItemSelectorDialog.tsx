import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {SearchIcon, Loader2} from "lucide-react";
import GlobalPaginationFunction from "@/components/pagination-global";
import {ItemFilters, itemService} from "@/services/itemService";
import {Item} from "@/types/types";

function MultiItemSelectorDialog({
                                open,
                                onOpenChange,
                                onSelect,
                                canDisabledBePicked = false
                            }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: Item[]) => void; 
    canDisabledBePicked?: boolean
}) {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]); // Track selected items
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const filters: ItemFilters = {
                page,
                rowsPerPage,
                search_key: search,
                is_active: true,
            };
            const response = await itemService.getAllItems(filters);
            setItems(response.data);
            setTotal(response.total);
            setTotalPages(Math.ceil(response.total / rowsPerPage));
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchItems();
        } else {
            // Reset selections when dialog closes
            setSelectedItems([]);
        }
    }, [open, page, rowsPerPage]);

    const handleToggleItem = (item: Item) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.id === item.id);
            if (isSelected) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const isItemSelected = (itemId: number | string) => {
        return selectedItems.some(item => item.id === itemId);
    };

    const handleConfirmSelection = () => {
        onSelect(selectedItems);
        onOpenChange(false);
        setSearch("");
        setSelectedItems([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Pilih Item..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 relative"
                            disabled={loading}
                        />
                        <Button
                            onClick={() => {
                                setPage(1);
                                fetchItems();
                            }}
                            size="default"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                                <SearchIcon/>
                            )}
                        </Button>
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {selectedItems.length} item(s) selected
                        </div>
                    )}

                    <div className="max-h-60 space-y-1 overflow-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin"/>
                                <span className="ml-2">Loading items...</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                No items found
                            </div>
                        ) : (
                            items.map((item) => {
                                const isLocked = (item.total_item === 0 && !canDisabledBePicked);
                                const isSelected = isItemSelected(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-lg p-3 flex items-start space-x-3 ${
                                            isLocked
                                                ? "opacity-50 cursor-not-allowed"
                                                : "cursor-pointer hover:bg-accent"
                                        }`}
                                        onClick={() => {
                                            if (!isLocked || canDisabledBePicked) {
                                                handleToggleItem(item);
                                            }
                                        }}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isLocked && !canDisabledBePicked}
                                            onCheckedChange={() => handleToggleItem(item)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="font-medium">
                                                Qty : {item.total_item}{" "}
                                                {isLocked && "(Out of stock)"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                SKU: {item.sku} || Harga: {item.price}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <GlobalPaginationFunction
                        page={page}
                        total={total}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        isSmall={true}
                        handleRowsPerPageChange={(value) => {
                            setRowsPerPage(value);
                            setPage(1);
                        }}
                        handlePageChange={(value) => setPage(value)}
                    />

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Batalkan
                        </Button>
                        <Button 
                            onClick={handleConfirmSelection}
                            disabled={selectedItems.length === 0}
                        >
                            Pilih ({selectedItems.length})
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default MultiItemSelectorDialog;