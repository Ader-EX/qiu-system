import {create} from 'zustand';
import {Item} from '@/types/types';

interface ProductStore {
    // Existing state
    products: Item[];
    searchTerm: string;
    filterStatus: string;
    filterKategori1: string;
    filterKategori2: string;
    filterVendor: string;
    filterCategory: string;
    viewMode: 'grid' | 'list' | 'table';
    currentPage: number;

    sortBy: string;
    sortOrder: 'asc' | 'desc';

    // Dialog state
    isAddEditDialogOpen: boolean;
    isDetailDialogOpen: boolean;
    editingItem: Item | null;
    selectedProduct: Item | null;

    // Existing actions
    setProducts: (products: Item[]) => void;
    addProduct: (product: Item) => void;
    updateProduct: (product: Item) => void;
    deleteProduct: (id: string) => void;
    setSearchTerm: (term: string) => void;
    setFilterStatus: (status: string) => void;
    setVendorStatus: (vendor: string) => void;
    setFilterKategori1: (kategori1: string) => void;
    setFilterKategori2: (kategori2: string) => void;
    setFilterCategory: (category: string) => void;
    setViewMode: (mode: 'grid' | 'list' | 'table') => void;
    setCurrentPage: (page: number) => void;

    setSortBy: (sortBy: string) => void;
    setSortOrder: (sortOrder: 'asc' | 'desc') => void;

    openAddDialog: () => void;
    openEditDialog: (item: Item) => void;
    closeAddEditDialog: () => void;
    openDetailDialog: (product: Item) => void;
    closeDetailDialog: () => void;

    getFilteredProducts: () => Item[];
    getPaginatedProducts: () => Item[];
    getKategori1Options: () => string[];
    getVendorOptions: () => string[];
    getKategori2Options: () => string[];
}

const ITEMS_PER_PAGE = 10;

const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    searchTerm: '',
    filterStatus: 'all',
    filterKategori1: 'all',
    filterKategori2: 'all',
    filterVendor: 'all',
    filterCategory: 'all',
    viewMode: 'grid',
    currentPage: 1,

    sortBy: '',
    sortOrder: 'asc',

    isAddEditDialogOpen: false,
    isDetailDialogOpen: false,
    editingItem: null,
    selectedProduct: null,

    setProducts: (products) => set({products}),

    addProduct: (product) => set((state) => ({
        products: [...state.products, {...product, id: Date.now().toString()}]
    })),

    updateProduct: (updatedProduct) => set((state) => ({
        products: state.products.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        )
    })),

    deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
    })),

    setSearchTerm: (searchTerm) => set({searchTerm, currentPage: 1}),
    setFilterStatus: (filterStatus) => set({filterStatus, currentPage: 1}),
    setVendorStatus: (filterVendor) => set({filterVendor, currentPage: 1}),
    setFilterKategori1: (filterKategori1) => set({filterKategori1, currentPage: 1}),
    setFilterKategori2: (filterKategori2) => set({filterKategori2, currentPage: 1}),
    setFilterCategory: (filterCategory) => set({filterCategory, currentPage: 1}),
    setViewMode: (viewMode) => set({viewMode}),
    setCurrentPage: (currentPage) => set({currentPage}),
    setSortBy: (sortBy) => set({sortBy, currentPage: 1}),
    setSortOrder: (sortOrder) => set({sortOrder, currentPage: 1}),

    openAddDialog: () => set({
        isAddEditDialogOpen: true,
        editingItem: null
    }),

    openEditDialog: (item) => set({
        isAddEditDialogOpen: true,
        editingItem: item
    }),

    closeAddEditDialog: () => set({
        isAddEditDialogOpen: false,
        editingItem: null
    }),

    openDetailDialog: (product) => set({
        isDetailDialogOpen: true,
        selectedProduct: product
    }),

    closeDetailDialog: () => set({
        isDetailDialogOpen: false,
        selectedProduct: null
    }),

    getFilteredProducts: () => {
        const state = get();
        let filtered = state.products.filter((product) => {
            const matchesSearch = product.name
                    .toLowerCase()
                    .includes(state.searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(state.searchTerm.toLowerCase());

            const matchesStatus = state.filterStatus === 'all' ||
                product.is_active === state.filterStatus;

            const matchesVendor = state.filterVendor === 'all' ||
                product.vendor_rel === state.filterVendor;

            const matchesKategori1 = state.filterKategori1 === 'all' ||
                product.category_one_rel === state.filterKategori1;

            const matchesKategori2 = state.filterKategori2 === 'all' ||
                product.category_two_rel === state.filterKategori2;

            // Category filter (if you're using it)
            const matchesCategory = state.filterCategory === 'all' ||
                product.category_one_rel === state.filterCategory;

            return matchesSearch && matchesStatus && matchesVendor &&
                matchesKategori1 && matchesKategori2 && matchesCategory;
        });

        // NEW: Apply sorting
        if (state.sortBy) {
            filtered.sort((a, b) => {
                let aValue = a[state.sortBy as keyof Item];
                let bValue = b[state.sortBy as keyof Item];

                // Handle string comparison for names
                if (state.sortBy === 'nama') {
                    aValue = (aValue as string).toLowerCase();
                    bValue = (bValue as string).toLowerCase();
                }

                // Handle numeric comparison for prices
                if (state.sortBy === 'harga') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    },

    getPaginatedProducts: () => {
        const filtered = get().getFilteredProducts();
        const state = get();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const products = filtered.slice(startIndex, endIndex);

        return products;
    },

    getKategori1Options: () => {
        const state = get();
        const uniqueKategori1 = [...new Set(state.products.map(p => p.category_one_rel))];
        return uniqueKategori1.filter(Boolean);
    },

    getVendorOptions: () => {
        const state = get();
        const uniqueVendors = [...new Set(state.products.map(p => p.vendor_rel))];
        return uniqueVendors.filter(Boolean);
    },

    getKategori2Options: () => {
        const state = get();
        const uniqueKategori2 = [...new Set(state.products.map(p => p.category_two_rel))];
        return uniqueKategori2.filter(Boolean);
    },
}));

export default useProductStore;