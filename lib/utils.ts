import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStockStatus = (stock: number) => {
  if (stock === 0) return { label: "Habis", variant: "destructive" as const };
  return { label: "Tersedia", variant: "okay" as const };
};
type FormatMoneyMode = "symbol" | "nosymbol";

export const formatMoney = (
  amount: number | null | undefined,
  currency: string = "IDR",
  locale: string = "id-ID",
  mode: FormatMoneyMode = "symbol"
): string => {
  const numberAmount = Number(amount ?? 0);

  const useZeroDecimals =
    (currency === "IDR" && numberAmount % 1 === 0) || currency === "JPY";

  const options: Intl.NumberFormatOptions = {
    style: mode === "symbol" ? "currency" : "decimal",
    currency,
    minimumFractionDigits: useZeroDecimals ? 0 : 2,
    maximumFractionDigits: useZeroDecimals ? 0 : 2,
  };

  return new Intl.NumberFormat(locale, options).format(numberAmount);
};

export const roundToPrecision = (num: any, precision = 2) => {
  const multiplier = Math.pow(10, precision);
  return Math.round(num * multiplier) / multiplier;
};
