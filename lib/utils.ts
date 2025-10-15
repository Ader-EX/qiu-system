import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatISO } from "date-fns";
import z from "zod";
import Cookies from "js-cookie";

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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat(locale, options).format(numberAmount);
};

export enum UserRoleType {
  OWNER = "OWNER", // Explicitly define as strings is best practice
  STAFF = "STAFF",
  ALL = "ALL",
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR",
}

const roleNumberMap: Record<string, UserRoleType> = {
  "0": UserRoleType.OWNER,
  "1": UserRoleType.STAFF,
  "2": UserRoleType.ALL,
  "3": UserRoleType.ADMIN,
  "4": UserRoleType.SUPERVISOR,
};

export const getRole = (): UserRoleType | undefined => {
  if (typeof window === "undefined") return undefined;

  const roleString = Cookies.get("role");
  console.log("Raw cookie value for 'role':", roleString);

  if (!roleString) return undefined;

  // Check if it's a number (like "1", "2", etc.)
  if (roleNumberMap[roleString]) {
    return roleNumberMap[roleString];
  }

  // Check if it's already the enum string value
  if (Object.values(UserRoleType).includes(roleString as UserRoleType)) {
    return roleString as UserRoleType;
  }

  console.log("Role validation failed");
  return undefined;
};

export const getUsername = (): string | undefined => {
  if (typeof window === "undefined") {
    console.log("Window is undefined");
    return undefined;
  }
  const name = Cookies.get("name");
  console.log("Raw cookie value for 'name':", name);
  return name || undefined;
};

export const roundToPrecision = (num: any, precision = 4) => {
  const multiplier = Math.pow(10, precision);
  return Math.round(num * multiplier) / multiplier;
};
/**
 * Converts a Date object to date-only string format (YYYY-MM-DD)
 * without timezone conversion issues
 */
export const formatDateForAPI = (date: Date): string => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1); // add +1 day
  return nextDay.toISOString().split("T")[0];
};
/**
 * Alternative date formatting using date-fns
 * Formats date in local timezone without time component
 */
export const formatDateForAPIWithDateFns = (date: Date): string => {
  return formatISO(date, { representation: "date" });
};

export const safeFormatDateForAPI = (
  date?: Date | null
): string | undefined => {
  if (!date) return undefined;
  return formatDateForAPI(date);
};

export const formatDatesForAPI = (dates: { [key: string]: Date }) => {
  const formatted: { [key: string]: string } = {};

  Object.entries(dates).forEach(([key, date]) => {
    if (date) {
      formatted[key] = formatDateForAPI(date);
    }
  });

  return formatted;
};

export const isBrowser = typeof File !== "undefined";

export const FileSchema = z
  .any()
  .refine((f) => isBrowser && f instanceof File, {
    message: "Attachment must be a file",
  });
