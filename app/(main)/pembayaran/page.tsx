"use client"

import {useState} from "react"
import {Plus, Search, MoreHorizontal, Edit, Trash2, Eye, CreditCard, Banknote, Smartphone} from "lucide-react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Badge} from "@/components/ui/badge"
import {AlertSuccess} from "@/components/alert-success"

interface Payment {
    id: string
    paymentNumber: string
    type: "purchase" | "sale" | "expense" | "other"
    relatedTransaction: string
    amount: number
    paymentMethod: "cash" | "transfer" | "card" | "digital"
    date: string
    status: "pending" | "completed" | "failed"
    reference: string
    createdAt: string
}

const initialPayments: Payment[] = [
    {
        id: "1",
        paymentNumber: "PAY-001",
        type: "purchase",
        relatedTransaction: "PO-001",
        amount: 75000000,
        paymentMethod: "transfer",
        date: "2024-01-15",
        is_active: "completed",
        reference: "TRF-001-2024",
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        paymentNumber: "PAY-002",
        type: "sale",
        relatedTransaction: "SO-001",
        amount: 16750000,
        paymentMethod: "cash",
        date: "2024-01-16",
        is_active: "completed",
        reference: "CASH-002-2024",
        createdAt: "2024-01-16",
    },
    {
        id: "3",
        paymentNumber: "PAY-003",
        type: "expense",
        relatedTransaction: "EXP-001",
        amount: 5000000,
        paymentMethod: "card",
        date: "2024-01-17",
        is_active: "pending",
        reference: "CARD-003-2024",
        createdAt: "2024-01-17",
    },
]

const paymentMethodIcons = {
    cash: Banknote,
    transfer: CreditCard,
    card: CreditCard,
    digital: Smartphone,
}

export default function PembayaranPage() {
    const [payments, setPayments] = useState<Payment[]>(initialPayments)
    const [searchTerm, setSearchTerm] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const filteredPayments = payments.filter(
        (payment) =>
            payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.relatedTransaction.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.reference.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = (id: string) => {
        setPayments(payments.filter((payment) => payment.id !== id))
        setAlertMessage("Pembayaran berhasil dihapus!")
        setShowAlert(true)
    }

    const getTypeBadge = (type: Payment["type"]) => {
        switch (type) {
            case "purchase":
                return (
                    <Badge variant="default" className="bg-blue-500">
                        Pembelian
                    </Badge>
                )
            case "sale":
                return (
                    <Badge variant="default" className="bg-green-500">
                        Penjualan
                    </Badge>
                )
            case "expense":
                return (
                    <Badge variant="default" className="bg-orange-500">
                        Biaya
                    </Badge>
                )
            case "other":
                return <Badge variant="outline">Lainnya</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getStatusBadge = (status: Payment["status"]) => {
        switch (status) {
            case "completed":
                return (
                    <Badge variant="default" className="bg-green-500">
                        Selesai
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-500">
                        Pending
                    </Badge>
                )
            case "failed":
                return <Badge variant="destructive">Gagal</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {showAlert && <AlertSuccess message={alertMessage} onClose={() => setShowAlert(false)}/>}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Pembayaran</h1>
                <Link href="/pembayaran/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4"/>
                        Tambah Pembayaran
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pembayaran</CardTitle>
                    <CardDescription>Kelola semua transaksi pembayaran dalam sistem.</CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Cari pembayaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pembayaran</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Transaksi Terkait</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment) => {
                                const IconComponent = paymentMethodIcons[payment.paymentMethod]
                                return (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            <span className="font-mono">{payment.paymentNumber}</span>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(payment.type)}</TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">{payment.relatedTransaction}</span>
                                        </TableCell>
                                        <TableCell>Rp {payment.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="h-4 w-4"/>
                                                <span className="capitalize">{payment.paymentMethod}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        Lihat Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/pembayaran/${payment.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(payment.id)}
                                                                      className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
