"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RefreshCw } from "lucide-react";

interface DeleteAlertProps {
  /** The current status of the adjustment */
  status: string;
  /** The ID of the adjustment (or any target identifier) */
  id: number;
  /** Callback fired when rollback is confirmed */
  onConfirm: (id: number) => void;
  /** Optional label override */
  label?: string;
}

export function DeleteAlert({
  status,
  id,
  onConfirm,
  label = "Hapus",
}: DeleteAlertProps) {
  if (status !== "DRAFT") return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-600"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {label}
        </DropdownMenuItem>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus data dan tidak bisa dikembalikan, apakah Anda yakin?.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(id)}
            className="bg-red-600 hover:bg-red-700"
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
