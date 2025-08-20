import PembayaranForm from "@/components/pembayaran/PembayaranForm";
import {use} from "react"

type PembayaranEditPageProps = {
    params: Promise<{ id: string }>

}

const PembayaranEditPage = ({params}: PembayaranEditPageProps) => {
    const {id: pembayaranId} = use(params);
    return (
        <PembayaranForm mode={"edit"} pembayaranId={pembayaranId}/>

    )
}
export default PembayaranEditPage