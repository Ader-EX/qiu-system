"use client";

import {
    Settings,
    Package,
    DollarSign,
    CreditCard,
    Warehouse,
    Ruler,
    Banknote
} from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    HeaderActions,
    SidebarHeaderBar,
} from "@/components/ui/SidebarHeaderBar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import UsersPage from "@/components/user/UsersPage";

const settingsItems = [
    {
        title: "Brand",
        description: "Kelola brand untuk klasifikasi produk.",
        icon: Package,
        href: "/pengaturan/kategori-1",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    {
        title: "Jenis Barang",
        description: "Atur jenis barang untuk detail pengelompokan produk.",
        icon: Package,
        href: "/pengaturan/kategori-2",
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
    {
        title: "Satuan",
        description: "Kelola satuan produk (kg, pcs, liter, dll)",
        icon: Ruler,
        href: "/pengaturan/satuan",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    },
    {
        title: "Mata Uang",
        description: "Kelola mata uang dan kurs",
        icon: DollarSign,
        href: "/pengaturan/mata-uang",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
    },
    {
        title: "Term Of Payment",
        description: "Kelola metode pembayaran",
        icon: CreditCard,
        href: "/pengaturan/jenis-pembayaran",
        color: "text-red-600",
        bgColor: "bg-red-50",
    },
    {
        title: "Warehouse",
        description: "Kelola data gudang dan lokasi penyimpanan produk.",
        icon: Warehouse,
        href: "/pengaturan/warehouse",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
    },
    {
        title: "Sumber Dana",
        description: "Kelola data sumber dana.",
        icon: Banknote,
        href: "/pengaturan/sumberdana",
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
];
export default function PengaturanPage() {
    return (
        <div className="flex w-full flex-1 flex-col space-y-6">
            <SidebarHeaderBar
                title="Pengaturan"
                rightContent={<HeaderActions.ActionGroup></HeaderActions.ActionGroup>}
            />

            <div className="flex w-full items-center gap-4"> {/* add w-full */}
                <Tabs defaultValue="master" className="w-full"> {/* add className */}
                    <TabsList>
                        <TabsTrigger value="master">Master Data</TabsTrigger>
                        <TabsTrigger value="akses">Akses Pengguna</TabsTrigger>
                    </TabsList>

                    <TabsContent value="master">
                        <MasterDataPengaturanTabs/>
                    </TabsContent>

                    <TabsContent value="akses" className="flex w-full flex-1"> {/* add flex-1 */}
                        <UsersPage/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const MasterDataPengaturanTabs = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsItems.map((item) => {
                const IconComponent = item.icon;
                return (
                    <Link key={item.href} href={item.href}>
                        <Card className="transition-all hover:shadow-md hover:scale-[1.02] min-h-[150px]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}
                                    >
                                        <IconComponent className={`h-5 w-5 ${item.color}`}/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{item.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    )

}
