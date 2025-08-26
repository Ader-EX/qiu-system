import PembayaranForm from "@/components/pembayaran/PembayaranForm";
import PengembalianForm from "@/components/pengembalian/PengembalianForm";
import { use } from "react";

type PengembalianViewPageProps = {
  params: Promise<{ id: string }>;
};

const PengembalianViewPage = ({ params }: PengembalianViewPageProps) => {
  const { id: pengembalianId } = use(params);
  return <PengembalianForm mode={"view"} pengembalianId={pengembalianId} />;
};
export default PengembalianViewPage;
