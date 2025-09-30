import StockAdjustmentForm from "@/components/StockAdjustment/StockAdjustmentForm";

import {use} from "react";

interface StockAdjustmentEditPageProps {
    params: Promise<{ id: string }>;
}

export default function StockAdjEditPage({params}: StockAdjustmentEditPageProps) {
    const {id: adjusmentId} = use(params);

    return <StockAdjustmentForm mode="edit" adjustmentId={adjusmentId}/>;
}
