import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStockStatus = (stock: number) => {
  if (stock === 0) return { label: "Habis", variant: "destructive" as const };
  if (stock <= 10) return { label: "Menipis", variant: "secondary" as const };
  return { label: "Tersedia", variant: "default" as const };
};
