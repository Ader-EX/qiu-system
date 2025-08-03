"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Upload,
  TableIcon,
  ArrowUpDown,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGridView } from "@/components/Product/ProductGridView";
import AddEditItemDialog from "@/components/Product/AddEditItemDialog";
import {
  HeaderActions,
  SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import { ProductDetailDialog } from "@/components/Product/ProductDetailDialog";
import toast from "react-hot-toast";
import ProductListView from "@/components/Product/ProductListView";
import ProductTableView from "@/components/Product/ProductTableView";

import { Item } from "@/types/types";
import {
  itemService,
  ItemFilters,
  ItemTypeEnum,
  ItemCreate,
  ItemUpdate,
} from "@/services/itemService";
import GlobalPaginationFunction from "@/components/pagination-global";
import { satuanService } from "@/services/mataUangService";
import { vendorService } from "@/services/vendorService";
import { kategoriService } from "@/services/kategoriService";

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
    filterStatus: "all",
    filterItemType: "all",
    filterVendor: "all",
    viewMode: "grid",
    currentPage: 1,
    rowsPerPage: 12,
    sortBy: "",
    sortOrder: "asc",
    isAddEditDialogOpen: false,
    isDetailDialogOpen: false,
    editingItem: null,
    selectedProduct: null,
  });

  // Fetch items from API
  const fetchItems = useCallback(
    async (params?: {
      currentPage?: number;
      rowsPerPage?: number;
      searchTerm?: string;
      filterStatus?: string;
      filterItemType?: string;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Use parameters if provided, otherwise use current state
        const currentParams = {
          currentPage: params?.currentPage ?? state.currentPage,
          rowsPerPage: params?.rowsPerPage ?? state.rowsPerPage,
          searchTerm: params?.searchTerm ?? state.searchTerm,
          filterStatus: params?.filterStatus ?? state.filterStatus,
          filterItemType: params?.filterItemType ?? state.filterItemType,
        };

        const filters: ItemFilters = {
          page: currentParams.currentPage,
          rowsPerPage: currentParams.rowsPerPage,
          search_key: currentParams.searchTerm || undefined,
          is_active:
            currentParams.filterStatus === "all"
              ? undefined
              : currentParams.filterStatus === "active",
          item_type:
            currentParams.filterItemType === "all"
              ? undefined
              : (currentParams.filterItemType as ItemTypeEnum),
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
    },
    []
  ); // Empty dependency array

  useEffect(() => {
    fetchItems({
      currentPage: state.currentPage,
      rowsPerPage: state.rowsPerPage,
      searchTerm: state.searchTerm,
      filterStatus: state.filterStatus,
      filterItemType: state.filterItemType,
    });
  }, [
    state.currentPage,
    state.rowsPerPage,
    state.searchTerm,
    state.filterStatus,
    state.filterItemType,
    fetchItems,
  ]);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const itemType = searchParams.get("itemType") || "all";
    const vendor = searchParams.get("vendor") || "all";
    const view =
      (searchParams.get("view") as "grid" | "list" | "table") || "grid";
    const page = parseInt(searchParams.get("page") || "1");
    const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "12");
    const sort = searchParams.get("sortBy") || "";
    const order = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    setState((prev) => ({
      ...prev,
      searchTerm: search,
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

  // Fetch items when dependencies change
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

  // Handlers with URL sync
  const handleSearchChange = (value: string) => {
    setState((prev) => ({ ...prev, searchTerm: value, currentPage: 1 }));
    updateURL({ search: value, page: "1" });
  };

  const handleStatusChange = (value: string) => {
    setState((prev) => ({ ...prev, filterStatus: value, currentPage: 1 }));
    updateURL({ status: value === "all" ? "" : value, page: "1" });
  };

  const handleRowsPerPageChange = (value: number) => {
    setState((prev) => ({
      ...prev,
      rowsPerPage: value,
      currentPage: 1,
    }));
    updateURL({ rowsPerPage: String(value), page: "1" });
  };
  const handleVendorChange = (value: string) => {
    setState((prev) => ({ ...prev, filterVendor: value, currentPage: 1 }));
    updateURL({ vendor: value === "all" ? "" : value, page: "1" });
  };

  const handleItemTypeChange = (value: string) => {
    setState((prev) => ({ ...prev, filterItemType: value, currentPage: 1 }));
    updateURL({ itemType: value === "all" ? "" : value, page: "1" });
  };

  const handleViewChange = (mode: "grid" | "list" | "table") => {
    setState((prev) => ({ ...prev, viewMode: mode }));
    updateURL({ view: mode });
  };

  const handlePageChange = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    updateURL({ page: String(page) });
  };

  const handleSortChange = (value: string) => {
    if (value === "all") {
      setState((prev) => ({ ...prev, sortBy: "", sortOrder: "asc" }));
      updateURL({ sortBy: "", sortOrder: "", page: "1" });
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

  // Updated parent component handler to work with FormData
  const handleDialogSave = async (itemFormData: FormData) => {
    try {
      if (state.editingItem) {
        // Update existing item using FormData
        await itemService.updateItemWithFormData(
          state.editingItem.id,
          itemFormData
        );
        toast.success("Item berhasil diperbarui!");
      } else {
        // Create new item using FormData
        await itemService.createItemWithFormData(itemFormData);
        toast.success("Item berhasil ditambahkan!");
      }
      closeAddEditDialog();
      fetchItems(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save item";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await itemService.deleteItem(id);
      toast.success("Item berhasil dihapus!");
      fetchItems(); // Refresh the list
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
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </HeaderActions.ActionGroup>
        }
      />
      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari item..."
              value={state.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-auto"
            />
          </div>

          <Select
            value={state.filterItemType}
            onValueChange={handleItemTypeChange}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Pilih Tipe Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="FINISH_GOOD">Finish Good</SelectItem>
              <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
              <SelectItem value="SERVICE">Service</SelectItem>
            </SelectContent>
          </Select>

          <Select value={state.filterVendor} onValueChange={handleVendorChange}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Pilih Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Vendor</SelectItem>
              {/* You can populate this with actual vendor options from your items */}
            </SelectContent>
          </Select>

          <Select value={state.filterStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Pilih status" />
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
            <SelectTrigger className="w-auto">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Urutkan" />
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

          <div className="flex items-center border rounded-lg">
            <Button
              size="sm"
              variant={state.viewMode === "grid" ? "default" : "ghost"}
              onClick={() => handleViewChange("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={state.viewMode === "list" ? "default" : "ghost"}
              onClick={() => handleViewChange("list")}
              className="border-x"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={state.viewMode === "table" ? "default" : "ghost"}
              onClick={() => handleViewChange("table")}
              className="rounded-l-none"
            >
              <TableIcon className="h-4 w-4" />
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
      <GlobalPaginationFunction
        page={state.currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        total={state.total}
        rowsPerPage={state.rowsPerPage || 10}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      {!state.loading && !state.error && state?.items?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items found. Try adjusting your search or filters.
        </div>
      )}

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
          onClose={closeDetailDialog}
          product={state.selectedProduct}
        />
      )}
    </div>
  );
};

export default ProdukPage;
