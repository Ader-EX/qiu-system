// pages/pembelian/edit/[id]/page.tsx

import PembelianForm from "@/components/pembelian/PembelianForm";
import PenjualanForm from "@/components/penjualan/PenjualanForm";
import { use } from "react";

interface PenjualanEditPageProps {
  params: Promise<{ id: string }>;
}

export default function PembelianEditPage({ params }: PenjualanEditPageProps) {
  const { id: penjualanId } = use(params);

  return <PenjualanForm mode="edit" penjualanId={penjualanId} />;
}
