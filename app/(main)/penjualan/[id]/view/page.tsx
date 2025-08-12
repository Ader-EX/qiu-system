// pages/pembelian/edit/[id]/page.tsx

import PembelianForm from "@/components/pembelian/PembelianForm";
import PenjualanForm from "@/components/penjualan/PenjualanForm";
import {use} from "react";

interface PenjualanViewPageProps {
    params: Promise<{ id: string }>;
}

export default function PembelianViewPage({params}: PenjualanViewPageProps) {
    const {id: penjualanId} = use(params);

    return <PenjualanForm mode="view" penjualanId={penjualanId}/>;
}
