import {use} from "react";
import CustomerForm from "@/components/customer/CustomerForm";

interface CustomerViewPageProps {
    params: Promise<{ id: string }>;
}

export default function CustomerViewPage({params}: CustomerViewPageProps) {
    const {id: customerId} = use(params);

    return <CustomerForm mode="view" customerId={customerId}/>;
}
