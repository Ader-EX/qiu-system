"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertSuccess } from "@/components/alert-success"

export default function AddPembayaranPage() {
  const [formData, setFormData] = useState({
    type: "",
    relatedId: "",
    amount: "",
    paymentMethod: "",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
  })

  const [showAlert, setShowAlert] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAlert(true)
  }

  return (
    <div className="space-y-6">
      {showAlert && <AlertSuccess message="Pembayaran berhasil ditambahkan!" onClose={() => setShowAlert(false)} />}

      <div className="flex items-center gap-4">
        <Link href="/pembayaran">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Tambah Pembayaran</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
            <CardDescription>Masukkan informasi pembayaran baru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Pembayaran</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Pembayaran Pembelian</SelectItem>
                    <SelectItem value="sale">Pembayaran Penjualan</SelectItem>
                    <SelectItem value="expense">Pembayaran Biaya</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relatedId">Referensi Transaksi</Label>
                <Select
                  value={formData.relatedId}
                  onValueChange={(value) => setFormData({ ...formData, relatedId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih transaksi terkait" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PO-001">PO-001 - PT. Supplier Utama</SelectItem>
                    <SelectItem value="SO-001">SO-001 - PT. ABC Company</SelectItem>
                    <SelectItem value="EXP-001">EXP-001 - Biaya Operasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Pembayaran</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="check">Cek</SelectItem>
                    <SelectItem value="card">Kartu Kredit/Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Tanggal Pembayaran</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Nomor Referensi</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Nomor referensi pembayaran"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/pembayaran">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit">Simpan Pembayaran</Button>
        </div>
      </form>
    </div>
  )
}
