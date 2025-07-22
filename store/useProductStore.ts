// stores/useProductStore.ts
import { create } from 'zustand';
import {Product} from "@/app/(main)/item/page";
import { StaticImageData } from 'next/image';

interface ProductStore {
    // Products state
    products: Product[];
    filteredProducts: Product[];

    // UI state
    searchTerm: string;
    filterStatus: string;
    filterKategori1: string;
    filterKategori2: string;
    filterCategory: string;
    viewMode: 'grid' | 'list' | 'table';
    currentPage: number;
    itemsPerPage: number;

    // Dialog state
    isAddEditDialogOpen: boolean;
    isDetailDialogOpen: boolean;
    editingItem: Product | null;
    selectedProduct: Product | null;

    // Actions
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;

    // Filter actions
    setSearchTerm: (term: string) => void;
    setFilterStatus: (status: string) => void;
    setFilterKategori1: (kategori1: string) => void;
    setFilterKategori2: (kategori2: string) => void;
    setFilterCategory: (category: string) => void;
    setViewMode: (mode: 'grid' | 'list' | 'table') => void;
    setCurrentPage: (page: number) => void;

    // Dialog actions
    openAddDialog: () => void;
    openEditDialog: (product: Product) => void;
    closeAddEditDialog: () => void;
    openDetailDialog: (product: Product) => void;
    closeDetailDialog: () => void;

    // Computed values
    getFilteredProducts: () => Product[];
    getPaginatedProducts: () => Product[];
    getTotalPages: () => number;
    getCategories: () => string[];
    getKategori1Options: () => string[];
    getKategori2Options: () => string[];
}

const useProductStore = create<ProductStore>((set, get) => ({
    // Initial state
    products: [],
    filteredProducts: [],

    // UI state
    searchTerm: '',
    filterStatus: '',
    filterKategori1: '',
    filterKategori2: '',
    filterCategory: '',
    viewMode: 'grid',
    currentPage: 1,
    itemsPerPage: 6,

    // Dialog state
    isAddEditDialogOpen: false,
    isDetailDialogOpen: false,
    editingItem: null,
    selectedProduct: null,

    // Product actions
    setProducts: (products) => {
        set({ products });
        get().getFilteredProducts();
    },

    addProduct: (product) => {
        const newProduct = { ...product, id: String(Date.now()) };
        set((state) => ({
            products: [newProduct, ...state.products]
        }));
        get().getFilteredProducts();
    },

    updateProduct: (product) => {
        set((state) => ({
            products: state.products.map((p) =>
                p.id === product.id ? product : p
            )
        }));
        get().getFilteredProducts();
    },

    deleteProduct: (id) => {
        set((state) => ({
            products: state.products.filter((p) => p.id !== id)
        }));
        get().getFilteredProducts();
    },

    // Filter actions
    setSearchTerm: (term) => {
        set({ searchTerm: term, currentPage: 1 });
        get().getFilteredProducts();
    },

    setFilterStatus: (status) => {
        set({ filterStatus: status, currentPage: 1 });
        get().getFilteredProducts();
    },

    setFilterKategori1: (kategori1) => {
        set({ filterKategori1: kategori1, currentPage: 1 });
        get().getFilteredProducts();
    },

    setFilterKategori2: (kategori2) => {
        set({ filterKategori2: kategori2, currentPage: 1 });
        get().getFilteredProducts();
    },

    setFilterCategory: (category) => {
        set({ filterCategory: category, currentPage: 1 });
        get().getFilteredProducts();
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    setCurrentPage: (page) => set({ currentPage: page }),

    // Dialog actions
    openAddDialog: () => set({
        isAddEditDialogOpen: true,
        editingItem: null
    }),

    openEditDialog: (product) => set({
        isAddEditDialogOpen: true,
        editingItem: product
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

    // Computed values
    getFilteredProducts: () => {
        const state = get();
        const filtered = state.products.filter((p) => {
            const matchesSearch =
                p.nama.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                p.SKU.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                p.type.toLowerCase().includes(state.searchTerm.toLowerCase());

            const matchesStatus =
                !state.filterStatus ||
                state.filterStatus === 'all' ||
                p.status === state.filterStatus;

            const matchesCat =
                !state.filterCategory ||
                state.filterCategory === 'all' ||
                p.type === state.filterCategory;

            const matchesKategori1 =
                !state.filterKategori1 ||
                state.filterKategori1 === 'all' ||
                p.kategori1 === state.filterKategori1;

            const matchesKategori2 =
                !state.filterKategori2 ||
                state.filterKategori2 === 'all' ||
                p.kategori2 === state.filterKategori2;

            return matchesSearch && matchesStatus && matchesCat &&
                matchesKategori1 && matchesKategori2;
        });

        set({ filteredProducts: filtered });
        return filtered;
    },

    getPaginatedProducts: () => {
        const state = get();
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        return state.filteredProducts.slice(
            startIndex,
            startIndex + state.itemsPerPage
        );
    },

    getTotalPages: () => {
        const state = get();
        return Math.ceil(state.filteredProducts.length / state.itemsPerPage);
    },

    getCategories: () => {
        const state = get();
        return Array.from(new Set(state.products.map((p) => p.type)));
    },

    getKategori1Options: () => {
        const state = get();
        return Array.from(new Set(state.products.map((p) => p.kategori1)));
    },

    getKategori2Options: () => {
        const state = get();
        return Array.from(new Set(state.products.map((p) => p.kategori2)));
    },
}));

export default useProductStore;