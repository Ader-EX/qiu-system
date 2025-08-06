import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Search, SearchIcon} from "lucide-react";
import GlobalPaginationFunction from "@/components/pagination-global";
import {ItemFilters, itemService} from "@/services/itemService";
import {Item} from "@/types/types";

function ItemSelectorDialog({
                                open,
                                onOpenChange,
                                onSelect,
                            }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: Item) => void;
}) {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(30);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchItems = async () => {
        try {
            const filters: ItemFilters = {
                page,
                rowsPerPage,
                search_key: search,
            };
            const response = await itemService.getAllItems(filters);
            setItems(response.data);
            setTotal(response.total);
            setTotalPages(Math.ceil(response.total / rowsPerPage));
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    useEffect(() => {
        if (open) {

            fetchItems();
        }
    }, [open, page, rowsPerPage]);

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
                        />
                        <Button
                            onClick={() => {
                                setPage(1);
                                fetchItems()
                            }}
                            className=""
                            size="default"
                        >
                            <SearchIcon/>
                        </Button>

                    </div>
                    <div className="max-h-60 space-y-1 overflow-auto">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`cursor-pointer rounded-lg p-3 hover:bg-accent ${item.total_item == 0 ? "opacity-50" : ""}`}
                                style={{pointerEvents: item.total_item == 0 ? "none" : "auto"}}

                                onClick={() => {
                                    onSelect(item);
                                    onOpenChange(false);
                                    setSearch("");
                                }}
                            >
                                <div className="font-medium">{item.name}</div>
                                <div className="font-medium">Qty : {item.total_item}</div>
                                <div className="text-sm text-muted-foreground">
                                    SKU: {item.sku} || Harga: {item.price}
                                </div>
                            </div>
                        ))}
                    </div>
                    <GlobalPaginationFunction
                        page={page}
                        total={total}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        isSmall={true}
                        handleRowsPerPageChange={(value) => setRowsPerPage(value)}
                        handlePageChange={(value) => setPage(value)}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Batalkan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ItemSelectorDialog;