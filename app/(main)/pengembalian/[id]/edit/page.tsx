import PembayaranForm from "@/components/pembayaran/PembayaranForm";
import PengembalianForm from "@/components/pengembalian/PengembalianForm";
import { use } from "react";

type PengembalianEditPageProps = {
  params: Promise<{ id: string }>;
};

const PengembalianEditPage = ({ params }: PengembalianEditPageProps) => {
  const { id: pengembalianId } = use(params);
  return <PengembalianForm mode={"edit"} pengembalianId={pengembalianId} />;
};
export default PengembalianEditPage;
