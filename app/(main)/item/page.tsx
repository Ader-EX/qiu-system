"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Table,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AlertSuccess } from "@/components/alert-success";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStockStatus } from "@/lib/utils";
import { ProductGridView } from "@/components/Product/ProductGridView";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  status: "active" | "inactive";
  createdAt: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Dell Inspiron 15",
    sku: "DELL-INS-15-001",
    category: "Elektronik",
    price: 8500000,
    stock: 25,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mouse Wireless Logitech",
    sku: "LOG-MOU-WL-002",
    category: "Aksesoris",
    price: 150000,
    stock: 100,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Keyboard Mechanical RGB",
    sku: "KEY-MEC-RGB-003",
    category: "Aksesoris",
    price: 750000,
    stock: 5,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    name: "Monitor 24 inch 4K",
    sku: "MON-24-4K-004",
    category: "Elektronik",
    price: 3200000,
    stock: 0,
    unit: "pcs",
    status: "inactive",
    createdAt: "2024-01-18",
  },
  {
    id: "5",
    name: "Headset Gaming RGB",
    sku: "HEAD-GAM-RGB-005",
    category: "Aksesoris",
    price: 450000,
    stock: 15,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-19",
  },
  {
    id: "6",
    name: "SSD Samsung 1TB",
    sku: "SAM-SSD-1TB-006",
    category: "Storage",
    price: 1200000,
    stock: 8,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "7",
    name: "RAM DDR4 16GB",
    sku: "RAM-DDR4-16GB-007",
    category: "Hardware",
    price: 850000,
    stock: 12,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-21",
  },
  {
    id: "8",
    name: "Webcam HD 1080p",
    sku: "WEB-HD-1080-008",
    category: "Aksesoris",
    price: 250000,
    stock: 3,
    unit: "pcs",
    status: "active",
    createdAt: "2024-01-22",
  },
];

type ViewMode = "grid" | "table" | "list";

export default function ProdukPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || ""
  );
  const [filterCategory, setFilterCategory] = useState(
    searchParams.get("category") || ""
  );

  // View and pagination state from URL params
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "grid"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [itemsPerPage] = useState(6);

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Update URL when params change
  const updateURL = (params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateURL({ view: mode });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURL({ search: value, page: "1" });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
    updateURL({ status: value, page: "1" });
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
    updateURL({ category: value, page: "1" });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "" || product.status === filterStatus;
    const matchesCategory =
      filterCategory === "" || product.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    setAlertMessage("Produk berhasil dihapus!");
    setShowAlert(true);
  };

  // Grid View Component

  // List View Component
  const ListView = () => (
    <div className="space-y-3">
      {paginatedProducts.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        return (
          <Card key={product.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {product.sku}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Kategori
                        </p>
                        <p className="text-sm font-medium">
                          {product.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Harga</p>
                        <p className="text-sm font-bold text-green-600">
                          Rp {product.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stok</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {product.stock} {product.unit}
                          </span>
                          <Badge
                            variant={stockStatus.variant}
                            className="text-xs"
                          >
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "secondary"
                        }
                      >
                        {product.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Table View Component
  const TableView = () => (
    <Card>
      <CardContent className="p-0">
        <TableComponent>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{product.sku}</span>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {product.stock} {product.unit}
                      </span>
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableComponent>
      </CardContent>
    </Card>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari{" "}
          {filteredProducts.length} produk
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
              className={page === "..." ? "cursor-default" : ""}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showAlert && (
        <AlertSuccess
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produk</h1>
        <Link href="/produk/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Kelola produk dalam sistem inventory Anda.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 max-w-sm"
                />
              </div>
              <Select
                value={filterCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="rounded-none border-x"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("table")}
                className="rounded-l-none"
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === "grid" && (
        <ProductGridView
          paginatedProducts={paginatedProducts}
          handleDelete={handleDelete}
        />
      )}
      {viewMode === "list" && <ListView />}
      {viewMode === "table" && <TableView />}

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
