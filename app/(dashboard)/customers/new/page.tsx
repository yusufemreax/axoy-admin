/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import AddProductDrawer from "@/app/(dashboard)/system-builder/add-product-drawer"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

export default function NewCustomerBuilderPage() {
  // ürün & tipler (drawer kullanabilir)
  const { data: products } = useSWR<any[]>("/api/products", fetcher)
  const { data: productTypes } = useSWR<any[]>("/api/product-types", fetcher)

  // hazır sistemler
  const { data: readySystems } = useSWR<any[]>("/api/ready-systems", fetcher)

  // müşteri meta
  const [customerName, setCustomerName] = useState("")
  const [probability, setProbability] = useState<number>(50)
  const [jobDate, setJobDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD (bugün)
  )

  // builder state
  const [systemProducts, setSystemProducts] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)

  // maliyetler
  const [laborCost, setLaborCost] = useState(2000)
  const [travelCost, setTravelCost] = useState(0)

  // toplamlar
  const productTotal = systemProducts.reduce((s, p) => s + p.unitPrice * p.qty, 0)
  const totalCommission = systemProducts.reduce((s, p) => s + p.totalCommission, 0)
  const customerPrice = productTotal + totalCommission + laborCost + travelCost
  const profit = totalCommission + laborCost

  // Hazır sistem uygulama
  const applyReadySystem = (sys: any) => {
    const withLocalIds =
      (sys?.products || []).map((p: any, idx: number) => ({
        ...p,
        localId:
          p.localId ||
          `${p._id ?? "rs"}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      }))

    setSystemProducts(withLocalIds)
    setLaborCost(sys?.laborCost ?? 0)
    setTravelCost(sys?.travelCost ?? 0)
    // jobDate'i hazır sistemden kopyalamıyoruz; kullanıcı seçer.
  }

  const handleAddProduct = (p: any) => {
    if (editProduct) {
      setSystemProducts(prev =>
        prev.map(item =>
          item.localId === editProduct.localId ? { ...p, localId: editProduct.localId } : item
        )
      )
      setEditProduct(null)
    } else {
      setSystemProducts(prev => [
        ...prev,
        { ...p, localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
      ])
    }
  }

  const handleSave = async () => {
    if (!customerName) {
      alert("Müşteri adı zorunludur.")
      return
    }
    if (!jobDate) {
      alert("İşin yapılma tarihini seçin.")
      return
    }

    const payload = {
      customerName,
      probability,               // %
      jobDate,                   // YYYY-MM-DD
      products: systemProducts,  // image alanları dahil
      productTotal,
      totalCommission,
      laborCost,
      travelCost,
      customerPrice,
      profit,
      status: "lead",
    }

    console.log(payload);

    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    alert("Müşteri kaydı oluşturuldu ✅")
    // router.push("/customers")
  }

  return (
    <div className="space-y-6">
      {/* Üst bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl font-bold">Yeni Müşteri / Teklif</h1>
            <Button onClick={() => { setEditProduct(null); setDrawerOpen(true); }}>
                + Ürün Ekle
            </Button>
        </div>

      {/* Hazır Sistem + Müşteri meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hazır Sistem */}
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Hazır Sistem</label>
                <Select
                onValueChange={(val) => {
                    const sys = readySystems?.find((s) => s._id === val)
                    if (sys) applyReadySystem(sys)
                }}
                >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bir hazır sistem seçin" />
                </SelectTrigger>
                <SelectContent>
                    {readySystems?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                        {s.name || "(İsimsiz Sistem)"}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            {/* Müşteri Adı */}
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Müşteri Adı *</label>
                <Input
                className="w-full"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ör: Ahmet Yılmaz"
                />
            </div>

            {/* Olasılık */}
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Kabul Olasılığı (%)</label>
                <Input
                className="w-full"
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                />
            </div>

            {/* Tarih */}
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">İşin Yapılma Tarihi</label>
                <Input
                className="w-full"
                type="date"
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
                />
            </div>
        </div>

      {/* ürünler */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Görsel</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Marka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Adet</TableHead>
            <TableHead>Birim Fiyat</TableHead>
            <TableHead>Komisyon %</TableHead>
            <TableHead>Birim Komisyon</TableHead>
            <TableHead>Toplam Komisyon</TableHead>
            <TableHead>Toplam Tutar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {systemProducts.length ? (
            systemProducts.map((p) => (
              <ContextMenu key={p.localId}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell>
                      {p.image ? (
                        <img
                          src={p.image}
                          className="h-10 w-10 object-cover rounded"
                          alt={p.model}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>{p.model}</TableCell>
                    <TableCell>{p.qty}</TableCell>
                    <TableCell>{fmt(p.unitPrice)} ₺</TableCell>
                    <TableCell>%{p.commissionRate}</TableCell>
                    <TableCell>{fmt(p.unitCommission)} ₺</TableCell>
                    <TableCell>{fmt(p.totalCommission)} ₺</TableCell>
                    <TableCell>{fmt(p.totalPrice)} ₺</TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => { setEditProduct(p); setDrawerOpen(true) }}>
                    Düzenle
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-red-600"
                    onClick={() =>
                      setSystemProducts((prev) => prev.filter((x) => x.localId !== p.localId))
                    }
                  >
                    Kaldır
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-500">
                Ürün yok
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* toplamlar */}
      <div className="space-y-2 border rounded-md p-4 bg-gray-50 text-sm">
        <p>Komisyonsuz Toplam: <strong>{fmt(productTotal)} ₺</strong></p>
        <p>Toplam Komisyon: <strong>{fmt(totalCommission)} ₺</strong></p>

        <div className="flex items-center gap-2">
          <span>İşçilik:</span>
          <Input
            className="w-36"
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>Yol:</span>
          <Input
            className="w-36"
            type="number"
            value={travelCost}
            onChange={(e) => setTravelCost(Number(e.target.value) || 0)}
          />
        </div>

        <p>Müşteri Fiyatı: <strong>{fmt(customerPrice)} ₺</strong></p>
        <p>Kazanç: <strong>{fmt(profit)} ₺</strong></p>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      </div>

      {/* drawer */}
      <AddProductDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        onAdd={handleAddProduct}
        editProduct={editProduct}
      />
    </div>
  )
}
