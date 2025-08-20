import PembayaranForm from "@/components/pembayaran/PembayaranForm";
import {use} from "react"

type PembayaranViewPageProps = {
    params: Promise<{ id: string }>

}

const PembayaranViewPage = ({params}: PembayaranViewPageProps) => {
    const {id: pembayaranId} = use(params);
    return (
        <PembayaranForm mode={"view"} pembayaranId={pembayaranId}/>
    )
}
export default PembayaranViewPage