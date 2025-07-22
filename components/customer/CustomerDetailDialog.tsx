"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/app/(main)/customer/page";
interface CustomerDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export const CustomerDetailDialog: React.FC<CustomerDetailDialogProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const statusLabel = customer.status === "active" ? "Aktif" : "Tidak Aktif";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Detail Customer</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
          {/* Column 1 */}
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge
              className="mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full"
              variant={customer.status === "active" ? "okay" : "secondary"}
            >
              {statusLabel}
            </Badge>

            <p className="text-sm font-medium text-gray-500 mt-4">
              Kode Customer
            </p>
            <p className="mt-1 font-mono">{customer.code}</p>

            <p className="text-sm font-medium text-gray-500 mt-4">Nama</p>
            <p className="mt-1">{customer.name}</p>
          </div>

          {/* Column 2 */}
          <div>
            <p className="text-sm font-medium text-gray-500">Mata Uang</p>
            <p className="mt-1">{customer.currency}</p>

            <p className="text-sm font-medium text-gray-500 mt-4">
              Jenis Pembayaran
            </p>
            <p className="mt-1">{customer.top}</p>

            <p className="text-sm font-medium text-gray-500 mt-4">Alamat</p>
            <p className="mt-1">{customer.address}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * --- Integration Snippet for CustomerPage.tsx ---
 *
 * // at top of CustomerPage:
 * const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
 *
 * // open detail on click:
 * <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
 *   <Eye className="mr-2 h-4 w-4" /> Lihat Detail
 * </DropdownMenuItem>
 *
 * // render once in JSX:
 * {selectedCustomer && (
 *   <CustomerDetailDialog
 *     isOpen={!!selectedCustomer}
 *     onClose={() => setSelectedCustomer(null)}
 *     customer={selectedCustomer}
 *   />
 * )}
 */
