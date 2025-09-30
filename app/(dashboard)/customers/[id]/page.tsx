/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from "@/components/ui/context-menu"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// 🔹 System Builder çekmecesini yeniden kullanıyoruz
import AddProductDrawer from "@/app/(dashboard)/system-builder/add-product-drawer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: customer, mutate } = useSWR<any>(id ? `/api/customers/${id}` : null, fetcher);

  console.log(customer);
  
  // Form state
  const [name, setName] = useState("")
  const [probability, setProbability] = useState<number>(50)
  const [jobDateStr, setJobDateStr] = useState<string>("") // YYYY-MM-DD

  const [products, setProducts] = useState<any[]>([])
  const [laborCost, setLaborCost] = useState<number>(0)
  const [laborCostInput, setLaborCostInput] = useState("0,00")
  const [travelCost, setTravelCost] = useState<number>(0)
  const [travelCostInput, setTravelCostInput] = useState("0,00")

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRow, setEditRow] = useState<any | null>(null)

  // Image preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const openPreview = useCallback((src?: string) => {
    if (!src) return
    setPreviewSrc(src)
    setPreviewOpen(true)
  }, [])

  // İlk yükleme
  useEffect(() => {
    if (!customer) return

    setName(customer.customerName ?? "")
    setProbability(Number(customer.probability ?? 50))

    // jobDate (Date) → YYYY-MM-DD
    const d = customer.jobDate ? new Date(customer.jobDate) : null
    const dStr = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10) : ""
    setJobDateStr(dStr)

    const withLocal = (customer.products ?? []).map((p: any, idx: number) => ({
      ...p,
      localId: p.localId || `${p._id ?? "row"}-${idx}-${Math.random().toString(36).slice(2,8)}`,
    }))
    setProducts(withLocal)

    const lc = Number(customer.laborCost ?? 0)
    const tc = Number(customer.travelCost ?? 0)
    setLaborCost(lc)
    setTravelCost(tc)
    setLaborCostInput(fmtMoney(lc))
    setTravelCostInput(fmtMoney(tc))
  }, [customer])

  // Toplamlar
  const productTotal = useMemo(
    () => products.reduce((s, p) => s + (p.unitPrice ?? 0) * (p.qty ?? 0), 0),
    [products]
  )
  const totalCommission = useMemo(
    () => products.reduce((s, p) => s + (p.totalCommission ?? 0), 0),
    [products]
  )
  const customerPrice = useMemo(
    () => productTotal + totalCommission + laborCost + travelCost,
    [productTotal, totalCommission, laborCost, travelCost]
  )
  // Kazanç: yol ücreti hariç
  const profit = useMemo(
    () => totalCommission + laborCost,
    [totalCommission, laborCost]
  )

  // Ürün ekle/güncelle
  const handleAddProduct = (row: any) => {
    if (editRow) {
      setProducts(prev =>
        prev.map((x) => (x.localId === editRow.localId ? { ...row, localId: editRow.localId } : x))
      )
      setEditRow(null)
    } else {
      setProducts(prev => [
        ...prev,
        { ...row, localId: `${Date.now()}-${Math.random().toString(36).slice(2,8)}` },
      ])
    }
    setDrawerOpen(false)
  }

  const onBlurMoney =
    (setterNum: (n: number) => void, setterStr: (s: string) => void, current: string) => () => {
      const n = Number(current.replace(/\./g, "").replace(",", ".") || "0")
      setterNum(n)
      setterStr(fmtMoney(n))
    }

  // KAYDET
  const handleSave = async () => {
    const payload = {
      name,
      probability: Number(probability) || 0,
      jobDate: jobDateStr || undefined, // Zod (string→Date) transform edecek
      products,
      productTotal,
      totalCommission,
      laborCost,
      travelCost,
      customerPrice,
      profit,
    }

    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    mutate()
    alert("Müşteri güncellendi ✅")
  }

  // SİL
  const handleDelete = async () => {
    if (!confirm("Bu müşteriyi silmek istediğine emin misin?")) return
    await fetch(`/api/customers/${id}`, { method: "DELETE" })
    router.push("/customers")
  }

  return (
    <div className="space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Müşteri / Teklif Düzenle</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setEditRow(null); setDrawerOpen(true) }}>
            + Ürün Ekle
          </Button>
          <Button variant="destructive" onClick={handleDelete}>Sil</Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      </div>

      {/* Form alanları: responsive 2 kolon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Müşteri Adı *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör: Ahmet Yılmaz" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kabul Olasılığı (%)</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İşin Yapılma Tarihi</label>
          <Input
            type="date"
            value={jobDateStr}
            onChange={(e) => setJobDateStr(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* Ürünler Tablosu */}
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
          {products.length ? (
            products.map((p) => (
              <ContextMenu key={p.localId}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell>
                      {p.image ? (
                        <button type="button" onClick={() => openPreview(p.image)} title="Büyüt">
                          <Image
                            src={p.image}
                            alt={p.model}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover rounded"
                          />
                        </button>
                      ) : ("-")}
                    </TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>{p.model}</TableCell>
                    <TableCell>{p.qty}</TableCell>
                    <TableCell>{fmtMoney(p.unitPrice)} ₺</TableCell>
                    <TableCell>%{p.commissionRate}</TableCell>
                    <TableCell>{fmtMoney(p.unitCommission)} ₺</TableCell>
                    <TableCell>{fmtMoney(p.totalCommission)} ₺</TableCell>
                    <TableCell>{fmtMoney(p.totalPrice)} ₺</TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => { setEditRow(p); setDrawerOpen(true) }}>
                    Düzenle
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-red-600"
                    onClick={() => setProducts((prev) => prev.filter((x) => x.localId !== p.localId))}
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

      {/* Toplamlar */}
      <div className="space-y-3 border rounded-md p-4 bg-gray-50">
        <p>Komisyonsuz Toplam: <strong>{fmtMoney(productTotal)} ₺</strong></p>
        <p>Toplam Komisyon: <strong>{fmtMoney(totalCommission)} ₺</strong></p>

        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">İşçilik Ücreti</label>
          <Input
            type="text"
            className="w-40"
            value={laborCostInput}
            onChange={(e) => setLaborCostInput(e.target.value)}
            onBlur={onBlurMoney(setLaborCost, setLaborCostInput, laborCostInput)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">Yol Ücreti</label>
          <Input
            type="text"
            className="w-40"
            value={travelCostInput}
            onChange={(e) => setTravelCostInput(e.target.value)}
            onBlur={onBlurMoney(setTravelCost, setTravelCostInput, travelCostInput)}
          />
        </div>

        <p>Müşteri Fiyatı: <strong>{fmtMoney(customerPrice)} ₺</strong></p>
        <p>Kazanç: <strong>{fmtMoney(profit)} ₺</strong></p>
      </div>

      {/* Ürün ekleme/düzenleme çekmecesi */}
      <AddProductDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        onAdd={handleAddProduct}
        editProduct={editRow}
      />

      {/* Fotoğraf Önizleme */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-[900px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Fotoğraf Önizleme</DialogTitle>
          </DialogHeader>
          <div className="w-full flex justify-center">
            {previewSrc && (
              <Image
                src={previewSrc}
                alt="preview"
                width={1200}
                height={800}
                className="max-h-[75vh] w-auto h-auto object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
