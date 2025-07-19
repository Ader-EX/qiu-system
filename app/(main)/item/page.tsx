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
import carouselone from "@/public/carouselone.jpg";
import carouseltwo from "@/public/carouseltwo.jpg";
import carouselthree from "@/public/carouselthree.jpg";
import Image, { StaticImageData } from "next/image";

export interface Product {
  id: string;
  nama: string;
  SKU: string;
  type: string;
  status: "active" | "inactive";
  jumlah: number;
  harga: number;
  satuan: string;
  vendor: string;
  gambar: StaticImageData[];
}

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

  // Get unique categories - fixed to use 'type' property
  const categories = Array.from(
    new Set(products.map((product) => product.type))
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

  // Fixed filtering to use correct property names
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "all" ||
      product.status === filterStatus;
    const matchesCategory =
      filterCategory === "" ||
      filterCategory === "all" ||
      product.type === filterCategory;

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

  // List View Component - Updated to match the design
  const ListView = () => (
    <div className="space-y-2">
      {paginatedProducts.map((product) => {
        const stockStatus = getStockStatus(product.jumlah);
        return (
          <Card key={product.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Product Image Placeholder */}
                  <Image
                    src={product.gambar[0]}
                    alt=""
                    width={44}
                    height={44}
                    className="w-12 h-12  rounded flex-shrink-0"
                  />
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">
                      {product.nama}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-500">
                        SKU : {product.SKU}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        Rp {product.harga}
                      </p>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-gray-600 mb-1">
                      {product.jumlah} {product.satuan} tersisa
                    </div>
                    <Badge variant={stockStatus.variant} className={`text-xs `}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
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

  // Table View Component - Updated to match the design
  const TableView = () => (
    <Card>
      <CardContent className="p-0">
        <TableComponent>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Item ID</TableHead>
              <TableHead className="font-semibold">Item</TableHead>
              <TableHead className="font-semibold">Jumlah</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Satuan</TableHead>
              <TableHead className="font-semibold">Harga Jual (Rp)</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.jumlah);
              return (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.nama}</TableCell>
                  <TableCell>{product.jumlah}</TableCell>
                  <TableCell>{product.satuan}</TableCell>
                  <TableCell>{product.satuan}</TableCell>
                  <TableCell className="font-semibold">
                    {product.harga}
                  </TableCell>
                  <TableCell>
                    {product.vendor || "PT. Aksa Prima Jaya"}
                  </TableCell>
                  <TableCell>
                    {product.jumlah <= 50 ? (
                      <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs">
                        Tidak Aktif
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs">
                        Aktif
                      </Badge>
                    )}
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
        <div>
          <h1 className="text-3xl font-bold"> Daftar Produk</h1>
          <span>Kelola produk dalam sistem inventory Anda.</span>
        </div>
        <Link href="/produk/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Filters and View Controls */}

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
          <Select value={filterCategory} onValueChange={handleCategoryChange}>
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
