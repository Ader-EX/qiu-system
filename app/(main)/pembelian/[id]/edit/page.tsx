// pages/pembelian/edit/[id]/page.tsx

import PembelianForm from "@/components/pembelian/PembelianForm";
import { use } from "react";

interface PembelianEditPageProps {
  params: Promise<{ id: string }>;
}

export default function PembelianEditPage({ params }: PembelianEditPageProps) {
  const { id: pembelianId } = use(params);

  return <PembelianForm mode="edit" pembelianId={pembelianId} />;
}
