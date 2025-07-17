import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/app-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QIU System - Inventory Management",
  description: "Sistem manajemen inventory yang powerful dan mudah digunakan",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* <AppLayout>{children}</AppLayout> */}
        {children}
      </body>
    </html>
  );
}
