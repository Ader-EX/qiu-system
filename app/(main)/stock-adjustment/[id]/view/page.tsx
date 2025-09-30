import StockAdjustmentForm from "@/components/StockAdjustment/StockAdjustmentForm";

import {use} from "react";

interface StockAdjustmentViewPageProps {
    params: Promise<{ id: string }>;
}


export default function StockAdjViewPage({params}: StockAdjustmentViewPageProps) {
    const {id: adjusmentId} = use(params);

    return <StockAdjustmentForm mode="view" adjustmentId={adjusmentId}/>;
}
