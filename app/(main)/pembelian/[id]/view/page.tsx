// pages/pembelian/edit/[id]/page.tsx

import PembelianForm from "@/components/pembelian/PembelianForm";
import {use} from "react";

interface PembelianViewPageProps {
    params: Promise<{ id: string }>;
}

export default function PembelianViewPage({params}: PembelianViewPageProps) {
    const {id: pembelianId} = use(params);

    return <PembelianForm mode="view" pembelianId={pembelianId}/>;
}
