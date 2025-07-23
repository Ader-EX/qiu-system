"use client";

import {useEffect} from "react";
import {Plus, Search, Grid3X3, List, Upload, TableIcon} from "lucide-react";
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
import useProductStore from "@/store/useProductStore";
import toast from "react-hot-toast";
import ProductListView from "@/components/Product/ProductListView";
import {StaticImageData} from "next/image";
import carouselone from "@/public/carouselone.jpg";

import carouseltwo from "@/public/carouseltwo.jpg";

import carouselthree from "@/public/carouselthree.jpg";
import ProductTableView from "@/components/Product/ProductTableView";
import {Pagination} from "@/components/ui/pagination";
import {Product} from "@/types/types";

const initialProducts: Product[] = [
    {
        id: "1",
        nama: "Laptop Dell Inspiron 15",
        SKU: "DELL-INS-15-001",
        type: "Elektronik",
        status: "active",
        jumlah: 25,
        harga: 8500000,
        satuan: "pcs",
        vendor: "Dell",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Komputer",
        kategori2: "Premium",
    },
    {
        id: "2",
        nama: "Mouse Wireless Logitech",
        SKU: "LOG-MOU-WL-002",
        type: "Aksesoris",
        status: "active",
        jumlah: 100,
        harga: 150000,
        satuan: "pcs",
        vendor: "Logitech",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Input Device",
        kategori2: "Budget",
    },
    {
        id: "3",
        nama: "Keyboard Mechanical RGB",
        SKU: "KEY-MEC-RGB-003",
        type: "Aksesoris",
        status: "active",
        jumlah: 5,
        harga: 750000,
        satuan: "pcs",
        vendor: "Generic",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Input Device",
        kategori2: "Gaming",
    },
    {
        id: "4",
        nama: "Monitor 24 inch 4K",
        SKU: "MON-24-4K-004",
        type: "Elektronik",
        status: "inactive",
        jumlah: 0,
        harga: 3200000,
        satuan: "pcs",
        vendor: "Generic",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Display",
        kategori2: "Premium",
    },
    {
        id: "5",
        nama: "Headset Gaming RGB",
        SKU: "HEAD-GAM-RGB-005",
        type: "Aksesoris",
        status: "active",
        jumlah: 15,
        harga: 450000,
        satuan: "pcs",
        vendor: "Generic",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Audio",
        kategori2: "Gaming",
    },
    {
        id: "6",
        nama: "SSD Samsung 1TB",
        SKU: "SAM-SSD-1TB-006",
        type: "Storage",
        status: "active",
        jumlah: 8,
        harga: 1200000,
        satuan: "pcs",
        vendor: "Samsung",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Storage Device",
        kategori2: "Professional",
    },
    {
        id: "7",
        nama: "RAM DDR4 16GB",
        SKU: "RAM-DDR4-16GB-007",
        type: "Hardware",
        status: "active",
        jumlah: 12,
        harga: 850000,
        satuan: "pcs",
        vendor: "Generic",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Memory",
        kategori2: "Professional",
    },
    {
        id: "8",
        nama: "Webcam HD 1080p",
        SKU: "WEB-HD-1080-008",
        type: "Aksesoris",
        status: "active",
        jumlah: 3,
        harga: 250000,
        satuan: "pcs",
        vendor: "Generic",
        gambar: [carouselone, carouseltwo, carouselthree],
        kategori1: "Camera",
        kategori2: "Budget",
    },
];

const ProdukPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Zustand store
    const {
        // State
        searchTerm,
        filterStatus,
        filterKategori1,
        filterKategori2,
        filterCategory,
        viewMode,
        currentPage,
        isAddEditDialogOpen,
        isDetailDialogOpen,
        editingItem,
        selectedProduct,

        // Actions
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        setSearchTerm,
        setFilterStatus,
        setFilterKategori1,
        setFilterKategori2,
        setFilterCategory,
        setViewMode,
        setCurrentPage,
        openAddDialog,
        openEditDialog,
        closeAddEditDialog,
        openDetailDialog,
        closeDetailDialog,

        // Computed values
        getFilteredProducts,
        getPaginatedProducts,
        getCategories,
        getKategori1Options,
        getKategori2Options,
    } = useProductStore();

    // Initialize products and sync with URL params
    useEffect(() => {
        setProducts(initialProducts);

        // Sync URL params with store
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const kategori1 = searchParams.get("kategori1") || "";
        const kategori2 = searchParams.get("kategori2") || "";
        const category = searchParams.get("category") || "";
        const view =
            (searchParams.get("view") as "grid" | "list" | "table") || "grid";
        const page = parseInt(searchParams.get("page") || "1");

        if (search) setSearchTerm(search);
        if (status) setFilterStatus(status);
        if (kategori1) setFilterKategori1(kategori1);
        if (kategori2) setFilterKategori2(kategori2);
        if (category) setFilterCategory(category);
        setViewMode(view);
        setCurrentPage(page);
    }, []);

    // URL sync helper
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
        setSearchTerm(value);
        updateURL({search: value, page: "1"});
    };

    const handleStatusChange = (value: string) => {
        setFilterStatus(value);
        updateURL({status: value === "all" ? "" : value, page: "1"});
    };

    const handleCategoryChange = (value: string) => {
        setFilterCategory(value);
        updateURL({category: value === "all" ? "" : value, page: "1"});
    };

    const handleKategori1Change = (value: string) => {
        setFilterKategori1(value);
        updateURL({kategori1: value === "all" ? "" : value, page: "1"});
    };

    const handleKategori2Change = (value: string) => {
        setFilterKategori2(value);
        updateURL({kategori2: value === "all" ? "" : value, page: "1"});
    };

    const handleViewChange = (mode: "grid" | "list" | "table") => {
        setViewMode(mode);
        updateURL({view: mode});
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateURL({page: String(page)});
    };

    // Dialog handlers
    const handleDialogSave = (itemData: Product) => {
        if (editingItem) {
            updateProduct(itemData);
            toast.success("Produk berhasil diperbarui!");
        } else {
            addProduct(itemData);
            toast.success("Produk berhasil ditambahkan!");
        }
        closeAddEditDialog();
    };

    const handleDelete = (id: string) => {
        deleteProduct(id);
        toast.success("Produk berhasil dihapus!");
    };

    // Get computed values
    const categories = getCategories();
    const kategori1Options = getKategori1Options();
    const kategori2Options = getKategori2Options();
    const paginatedProducts = getPaginatedProducts();

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
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 max-w-sm"
                        />
                    </div>

                    {/* <Select value={filterCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

                    <Select value={filterKategori1} onValueChange={handleKategori1Change}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih kategori 1"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori 1</SelectItem>
                            {kategori1Options.map((kategori1: string) => (
                                <SelectItem key={kategori1} value={kategori1 || "elektronik"}>
                                    {kategori1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterKategori2} onValueChange={handleKategori2Change}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih kategori 2"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori 2</SelectItem>
                            {kategori2Options.map((kategori2: string) => (
                                <SelectItem key={kategori2} value={kategori2 || "elektronik"}>
                                    {kategori2}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center border rounded-lg">
                    <Button
                        size="sm"
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        onClick={() => handleViewChange("grid")}
                        className="rounded-r-none"
                    >
                        <Grid3X3 className="h-4 w-4"/>
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === "list" ? "default" : "ghost"}
                        onClick={() => handleViewChange("list")}
                        className="border-x"
                    >
                        <List className="h-4 w-4"/>
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === "table" ? "default" : "ghost"}
                        onClick={() => handleViewChange("table")}
                        className="rounded-l-none"
                    >
                        <TableIcon className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {viewMode === "grid" && <ProductGridView/>}
                {viewMode === "list" && <ProductListView/>}
                {viewMode === "table" && <ProductTableView/>}
            </div>

            {/* Pagination */}
            <Pagination/>

            {/* Dialogs */}
            <AddEditItemDialog
                item={editingItem}
                isOpen={isAddEditDialogOpen}
                onClose={closeAddEditDialog}
                onSave={handleDialogSave}
            />
            {selectedProduct && (
                <ProductDetailDialog
                    isOpen={isDetailDialogOpen}
                    onClose={closeDetailDialog}
                    product={selectedProduct}
                />
            )}
        </div>
    );
};
export default ProdukPage;
