"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";

import {Vendor} from "@/types/types";

interface VendorDetailDialogProps {
    isOpen: boolean;
    onCloseAction: () => void;
    vendor: Vendor;
}

export const VendorDetailDialog: React.FC<VendorDetailDialogProps> = ({
                                                                          isOpen,
                                                                          onCloseAction,
                                                                          vendor,
                                                                      }) => {
    const statusLabel = vendor.is_active ? "Aktif" : "Tidak Aktif";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle>Detail Vendor</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
                    {/* Column 1 */}
                    <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge
                            className="mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full"
                            variant={vendor.is_active ? "okay" : "destructive"}
                        >
                            {statusLabel}
                        </Badge>

                        <p className="text-sm font-medium text-gray-500 mt-4">
                            Vendor Code
                        </p>
                        <p className="mt-1 font-mono">{vendor.id}</p>

                        <p className="text-sm font-medium text-gray-500 mt-4">
                            Nama Vendor
                        </p>
                        <p className="mt-1">{vendor.name}</p>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <p className="text-sm font-medium text-gray-500">Mata Uang</p>
                        <p className="mt-1">{vendor?.curr_rel?.name}</p>

                        <p className="text-sm font-medium text-gray-500 mt-4">
                            Jenis Pembayaran
                        </p>
                        <p className="mt-1">{vendor?.top_rel?.name}</p>

                        <p className="text-sm font-medium text-gray-500 mt-4">Alamat</p>
                        <p className="mt-1">{vendor.address}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
