"use client";

import {useEffect, useState, useCallback} from "react";
import {
    Plus,
    Search,
    Grid3X3,
    List,
    Upload,
    TableIcon,
    ArrowUpDown,
    SearchIcon,
} from "lucide-react";
import {useRouter, useSearchParams, usePathname} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ProductGridView} from "@/components/Product/ProductGridView";
import AddEditItemDialog from "@/components/Product/AddEditItemDialog";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {ProductDetailDialog} from "@/components/Product/ProductDetailDialog";
import toast from "react-hot-toast";
import ProductListView from "@/components/Product/ProductListView";
import ProductTableView from "@/components/Product/ProductTableView";

import {Item} from "@/types/types";
import {
    itemService,
    ItemFilters,
    ItemTypeEnum,
    ItemCreate,
    ItemUpdate,
} from "@/services/itemService";
import GlobalPaginationFunction from "@/components/pagination-global";
import {satuanService} from "@/services/mataUangService";
import {vendorService} from "@/services/vendorService";
import {kategoriService} from "@/services/kategoriService";
import SearchableSelect from "@/components/SearchableSelect";

export interface TOPUnit {
    id: string;
    name: string;
}

interface ProdukPageState {
    items: Item[];
    loading: boolean;
    error: string | null;
    total: number;
    searchTerm: string;
    searchInput: string;
    filterStatus: string;
    filterItemType: string;
    filterVendor: string;
    viewMode: "grid" | "list" | "table";
    currentPage: number;
    rowsPerPage: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isAddEditDialogOpen: boolean;
    isDetailDialogOpen: boolean;
    editingItem: Item | null;
    selectedProduct: Item | null;
}

const ProdukPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [state, setState] = useState<ProdukPageState>({
        items: [],
        loading: false,
        error: null,
        total: 0,
        searchTerm: "",
        searchInput: "",
        filterStatus: "all",
        filterItemType: "all",
        filterVendor: "all",
        viewMode: "grid",
        currentPage: 1,
        rowsPerPage: 5,
        sortBy: "",
        sortOrder: "asc",
        isAddEditDialogOpen: false,
        isDetailDialogOpen: false,
        editingItem: null,
        selectedProduct: null,
    });

    // Fetch items from API - Fixed to use current state values
    const fetchItems = useCallback(async () => {
        setState((prev) => ({...prev, loading: true, error: null}));

        try {
            const filters: ItemFilters = {
                page: state.currentPage,
                rowsPerPage: state.rowsPerPage || 10,
                search_key: state.searchTerm || undefined,
                is_active:
                    state.filterStatus === "all"
                        ? undefined
                        : state.filterStatus === "active",
                item_type:
                    state.filterItemType === "all"
                        ? undefined
                        : (state.filterItemType as ItemTypeEnum),
                sortBy: state.sortBy || undefined, // Fixed: use current state
                sortOrder: state.sortOrder || undefined, // Fixed: use current state
                vendor: state.filterVendor || undefined,
            };

            const response = await itemService.getAllItems(filters);

            setState((prev) => ({
                ...prev,
                items: response.data,
                total: response.total,
                loading: false,
            }));
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to fetch items";
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                loading: false,
            }));
            toast.error(errorMessage);
        }
    }, [
        state.currentPage,
        state.rowsPerPage,
        state.searchTerm,
        state.filterStatus,
        state.filterVendor,
        state.filterItemType,
        state.sortBy, // Include sortBy in dependencies
        state.sortOrder, // Include sortOrder in dependencies
    ]);

    // Initialize state from URL params
    useEffect(() => {
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const itemType = searchParams.get("itemType") || "all";
        const vendor = searchParams.get("vendor") || "all";
        const view =
            (searchParams.get("view") as "grid" | "list" | "table") || "grid";
        const page = parseInt(searchParams.get("page") || "1");
        const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10");
        const sort = searchParams.get("sortBy") || "";
        const order = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

        setState((prev) => ({
            ...prev,
            searchTerm: search,
            searchInput: search,
            filterStatus: status,
            filterItemType: itemType,
            filterVendor: vendor,
            viewMode: view,
            currentPage: page,
            sortBy: sort,
            sortOrder: order,
            rowsPerPage: rowsPerPage,
        }));
    }, [searchParams]);

    // Fetch items when state changes
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const updateURL = (params: Record<string, string>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        Object.entries(params).forEach(([k, v]) => {
            v ? current.set(k, v) : current.delete(k);
        });
        const q = current.toString();
        router.push(`${pathname}${q ? `?${q}` : ""}`);
    };

    // Search handlers
    const handleSearchInputChange = (value: string) => {
        setState((prev) => ({...prev, searchInput: value}));
    };

    const handleSearchSubmit = () => {
        setState((prev) => ({
            ...prev,
            searchTerm: state.searchInput,
            currentPage: 1,
        }));
        updateURL({search: state.searchInput, page: "1"});
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearchSubmit();
        }
    };

    const handleStatusChange = (value: string) => {
        setState((prev) => ({...prev, filterStatus: value, currentPage: 1}));
        updateURL({status: value === "all" ? "" : value, page: "1"});
    };

    const handleRowsPerPageChange = (value: number) => {
        setState((prev) => ({
            ...prev,
            rowsPerPage: value,
            currentPage: 1,
        }));
        updateURL({rowsPerPage: String(value), page: "1"});
    };

    const handleVendorChange = (value: string) => {
        setState((prev) => ({...prev, filterVendor: value, currentPage: 1}));
        updateURL({vendor: value === "all" ? "" : value, page: "1"});
    };

    const handleItemTypeChange = (value: string) => {
        setState((prev) => ({...prev, filterItemType: value, currentPage: 1}));
        updateURL({itemType: value === "all" ? "" : value, page: "1"});
    };

    const handleViewChange = (mode: "grid" | "list" | "table") => {
        setState((prev) => ({...prev, viewMode: mode}));
        updateURL({view: mode});
    };

    const handlePageChange = (page: number) => {
        setState((prev) => ({...prev, currentPage: page}));
        updateURL({page: String(page)});
    };

    // Fixed sort handler
    const handleSortChange = (value: string) => {

        if (value === "all") {
            setState((prev) => ({
                ...prev,
                sortBy: "",
                sortOrder: "asc",
                currentPage: 1,
            }));
            updateURL({sortBy: "", sortOrder: "", page: "1"});
        } else {
            const [field, order] = value.split("-");
            setState((prev) => ({
                ...prev,
                sortBy: field,
                sortOrder: order as "asc" | "desc",
                currentPage: 1,
            }));
            updateURL({
                sortBy: field || "",
                sortOrder: order || "",
                page: "1",
            });
        }
    };

    // Dialog handlers
    const openAddDialog = () => {
        setState((prev) => ({
            ...prev,
            isAddEditDialogOpen: true,
            editingItem: null,
        }));
    };

    const openEditDialog = (item: Item) => {
        setState((prev) => ({
            ...prev,
            isAddEditDialogOpen: true,
            editingItem: item,
        }));
    };

    const closeAddEditDialog = () => {
        setState((prev) => ({
            ...prev,
            isAddEditDialogOpen: false,
            editingItem: null,
        }));
    };

    const openDetailDialog = (product: Item) => {
        setState((prev) => ({
            ...prev,
            isDetailDialogOpen: true,
            selectedProduct: product,
        }));
    };

    const closeDetailDialog = () => {
        setState((prev) => ({
            ...prev,
            isDetailDialogOpen: false,
            selectedProduct: null,
        }));
    };

    const handleDialogSave = async (itemFormData: FormData) => {
        try {
            if (state.editingItem) {
                await itemService.updateItemWithFormData(
                    state.editingItem.id,
                    itemFormData
                );
                toast.success("Item berhasil diperbarui!");
            } else {
                await itemService.createItemWithFormData(itemFormData);
                toast.success("Item berhasil ditambahkan!");
            }
            closeAddEditDialog();
            fetchItems();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to save item";
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await itemService.deleteItem(id);
            toast.success("Item berhasil dihapus!");
            fetchItems();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to delete item";
            toast.error(errorMessage);
        }
    };

    // Get current sort value for select
    const currentSortValue =
        state.sortBy && state.sortOrder
            ? `${state.sortBy}-${state.sortOrder}`
            : "all";

    // Calculate total pages
    const totalPages = Math.ceil(state.total / state.rowsPerPage);

    return (
        <div className="space-y-6">
            <SidebarHeaderBar
                title="Items"
                rightContent={
                    <HeaderActions.ActionGroup mobileLayout="wrap">
                        <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2"/>
                            Import
                        </Button>
                        <Button size="sm" onClick={openAddDialog}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Tambah Item
                        </Button>
                    </HeaderActions.ActionGroup>
                }
            />

            {/* Filters and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex mt-2">
                        <div className="">
                            {/* <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
                            <Input
                                placeholder="Cari item..."
                                value={state.searchInput}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className=" rounded-r-none border-r-0"
                            />
                        </div>
                        <Button
                            onClick={handleSearchSubmit}
                            className="rounded-l-none"
                            size="default"
                        >
                            <SearchIcon/>
                        </Button>
                    </div>

                    <SearchableSelect<TOPUnit>
                        label=""
                        placeholder="Semua vendor"
                        value={state.filterVendor}
                        onChange={handleVendorChange}
                        fetchData={(search: string) =>
                            vendorService.getAllVendors({
                                page: 0,
                                rowsPerPage: 5,
                                is_active: true,
                                search_key: search,
                            })
                        }
                        renderLabel={(item: any) => `${item.name}`}
                    />

                    <Select
                        value={state.filterItemType}
                        onValueChange={handleItemTypeChange}
                    >
                        <SelectTrigger className="w-auto mt-2">
                            <SelectValue placeholder="Pilih Tipe Item"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="FINISH_GOOD">Finish Good</SelectItem>
                            <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                            <SelectItem value="SERVICE">Service</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={state.filterStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-auto mt-2">
                            <SelectValue placeholder="Pilih status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex space-x-2">
                    <Select value={currentSortValue} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-auto mt-2">
                            <ArrowUpDown className="h-4 w-4 mr-2"/>
                            <SelectValue placeholder="Urutkan"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tanpa Urutan</SelectItem>
                            <SelectItem value="name-asc">Nama A-Z</SelectItem>
                            <SelectItem value="name-desc">Nama Z-A</SelectItem>
                            <SelectItem value="price-asc">Harga Terendah</SelectItem>
                            <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
                            <SelectItem value="sku-asc">SKU A-Z</SelectItem>
                            <SelectItem value="sku-desc">SKU Z-A</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-lg mt-2">
                        <Button
                            size="sm"
                            variant={state.viewMode === "grid" ? "default" : "ghost"}
                            onClick={() => handleViewChange("grid")}
                            className="rounded-r-none"
                        >
                            <Grid3X3 className="h-4 w-4"/>
                        </Button>
                        <Button
                            size="sm"
                            variant={state.viewMode === "list" ? "default" : "ghost"}
                            onClick={() => handleViewChange("list")}
                            className="border-x"
                        >
                            <List className="h-4 w-4"/>
                        </Button>
                        <Button
                            size="sm"
                            variant={state.viewMode === "table" ? "default" : "ghost"}
                            onClick={() => handleViewChange("table")}
                            className="rounded-l-none"
                        >
                            <TableIcon className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            {state.loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-muted-foreground">Loading items...</div>
                </div>
            )}

            {/* Content Views */}
            {!state.loading && !state.error && (
                <div className="overflow-x-auto">
                    {state.viewMode === "grid" && (
                        <ProductGridView
                            products={state.items}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                            onView={openDetailDialog}
                        />
                    )}
                    {state.viewMode === "list" && (
                        <ProductListView
                            products={state.items}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                            onView={openDetailDialog}
                        />
                    )}
                    {state.viewMode === "table" && (
                        <ProductTableView
                            products={state.items}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                            onView={openDetailDialog}
                        />
                    )}
                </div>
            )}

            {!state.loading && !state.error && state?.items?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    Produk tidak ditemukan
                </div>
            )}

            <GlobalPaginationFunction
                page={state.currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                total={state.total}
                rowsPerPage={state.rowsPerPage}
                handleRowsPerPageChange={handleRowsPerPageChange}
            />

            <AddEditItemDialog
                isOpen={state.isAddEditDialogOpen}
                onClose={closeAddEditDialog}
                onSave={handleDialogSave}
                item={state.editingItem}
                satuanService={satuanService}
                vendorService={vendorService}
                kategoriService={kategoriService}
            />

            {state.selectedProduct && (
                <ProductDetailDialog
                    isOpen={state.isDetailDialogOpen}
                    onCloseAction={closeDetailDialog}
                    product={state.selectedProduct}
                />
            )}
        </div>
    );
};

export default ProdukPage;
