import {use} from "react";
import CustomerForm from "@/components/customer/CustomerForm";

interface CustomerEditPageProps {
    params: Promise<{ id: string }>;
}

export default function CustomerEditPage({params}: CustomerEditPageProps) {
    const {id: customerId} = use(params);

    return <CustomerForm mode="edit" customerId={customerId}/>;
}
