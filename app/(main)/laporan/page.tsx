"use client"

import { useState } from "react"
import { FileText, Download, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const reportTypes = [
  {
    id: "sales",
    title: "Laporan Penjualan",
    description: "Laporan detail penjualan berdasarkan periode",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "purchases",
    title: "Laporan Pembelian",
    description: "Laporan detail pembelian dari vendor",
    icon: BarChart3,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "inventory",
    title: "Laporan Stok",
    description: "Laporan stok dan pergerakan inventory",
    icon: PieChart,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "financial",
    title: "Laporan Keuangan",
    description: "Laporan laba rugi dan cash flow",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

export default function LaporanPage() {
  const [selectedReport, setSelectedReport] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [format, setFormat] = useState("pdf")

  const handleGenerateReport = () => {
    // Simulate report generation
    console.log("Generating report:", {
      type: selectedReport,
      dateFrom,
      dateTo,
      format,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">Generate dan kelola laporan bisnis Anda</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Laporan</TabsTrigger>
          <TabsTrigger value="history">Riwayat Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {reportTypes.map((report) => {
              const IconComponent = report.icon
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${report.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{report.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle>Konfigurasi Laporan</CardTitle>
                <CardDescription>Atur parameter untuk generate laporan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Tanggal Mulai</Label>
                    <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Tanggal Selesai</Label>
                    <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format Output</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setSelectedReport("")}>
                    Batal
                  </Button>
                  <Button onClick={handleGenerateReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Laporan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Laporan</CardTitle>
              <CardDescription>Laporan yang telah di-generate sebelumnya</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Laporan Penjualan - Januari 2024</p>
                      <p className="text-sm text-muted-foreground">Generated pada 15 Jan 2024, 10:30 AM</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Laporan Pembelian - Desember 2023</p>
                      <p className="text-sm text-muted-foreground">Generated pada 31 Des 2023, 4:15 PM</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                      <PieChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Laporan Stok - Q4 2023</p>
                      <p className="text-sm text-muted-foreground">Generated pada 28 Des 2023, 2:45 PM</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
