/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AddProductDrawer from "./add-product-drawer"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"



// TL format helper
const formatCurrency = (val: number) =>
  (Number(val) || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export default function SystemBuilderPage() {
  const [previewOpen, setPreviewOpen] = useState(false)
const [previewSrc, setPreviewSrc] = useState<string | null>(null)

const openPreview = (src?: string) => {
  if (!src) return
  setPreviewSrc(src)
  setPreviewOpen(true)
}

  // Sistem bilgileri
  const [systemName, setSystemName] = useState("")
  const [systemProducts, setSystemProducts] = useState<any[]>([])

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)

  // Maliyetler
  const [laborCost, setLaborCost] = useState(2000)
  const [laborCostInput, setLaborCostInput] = useState(formatCurrency(2000))
  const [travelCost, setTravelCost] = useState(0)
  const [travelCostInput, setTravelCostInput] = useState(formatCurrency(0))

  // Toplamlar
  const productTotal = useMemo(
    () => systemProducts.reduce((sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0), 0),
    [systemProducts]
  )
  const totalCommission = useMemo(
    () => systemProducts.reduce((sum, p) => sum + (p.totalCommission || 0), 0),
    [systemProducts]
  )
  const customerPrice = productTotal + totalCommission + laborCost + travelCost
  const profit = totalCommission + laborCost // (yol ücreti kazanca dahil değil)

  // Kaydet (yeni sistem oluştur)
  const handleSave = async () => {
    if (!systemName.trim()) {
      alert("Lütfen sistem adı girin")
      return
    }

    const payload = {
      name: systemName,
      products: systemProducts,
      productTotal,
      totalCommission,
      laborCost,
      travelCost,
      customerPrice,
      profit,
    }

    await fetch("/api/ready-systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    alert("Sistem kaydedildi ✅")
    // reset
    setSystemName("")
    setSystemProducts([])
    setLaborCost(2000)
    setLaborCostInput(formatCurrency(2000))
    setTravelCost(0)
    setTravelCostInput(formatCurrency(0))
  }

  // Drawer’dan gelen item’i ekle/güncelle
  const handleAddOrUpdateProduct = (p: any) => {
    if (p.localId) {
      // düzenleme: aynı localId'li satırı güncelle
      setSystemProducts(prev => prev.map(row => (row.localId === p.localId ? p : row)))
    } else {
      // yeni ekleme: benzersiz localId üret
      const withKey = { ...p, localId: `${Date.now()}-${Math.random()}` }
      setSystemProducts(prev => [...prev, withKey])
    }
  }

  return (
    <div className="space-y-6">
      {/* Üst bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Yeni Sistem Oluştur</h1>
        <Button
          onClick={() => {
            setEditProduct(null)
            setDrawerOpen(true)
          }}
        >
          + Ürün Ekle
        </Button>
      </div>

      {/* Sistem Adı */}
      <div>
        <label className="block text-sm font-medium mb-1">Sistem Adı</label>
        <Input
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
          placeholder="ör: Premium Bas Paketi"
          className="w-80"
        />
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
          {systemProducts.length > 0 ? (
            systemProducts.map((p, i) => {
              const rowKey = p.localId ?? p.id ?? String(i)
              return (
                <ContextMenu key={rowKey}>
                  <ContextMenuTrigger asChild>
                    <TableRow>
                      <TableCell>
                        {p.image ? (
                          <button
                            type="button"
                            onClick={() => openPreview(p.image)}
                            className="group relative"
                            title="Büyüt"
                          >
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
                      <TableCell>{formatCurrency(p.unitPrice)} ₺</TableCell>
                      <TableCell>%{p.commissionRate}</TableCell>
                      <TableCell>{formatCurrency(p.unitCommission)} ₺</TableCell>
                      <TableCell>{formatCurrency(p.totalCommission)} ₺</TableCell>
                      <TableCell>{formatCurrency(p.totalPrice)} ₺</TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setEditProduct(p)
                        setDrawerOpen(true)
                      }}
                    >
                      Düzenle
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="text-red-600"
                      onClick={() =>
                        setSystemProducts(prev =>
                          prev.filter(x => (x.localId ?? x.id ?? "") !== (p.localId ?? p.id ?? ""))
                        )
                      }
                    >
                      Kaldır
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-500">
                Henüz ürün eklenmedi
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Genel Toplamlar */}
      {systemProducts.length > 0 && (
        <div className="border rounded-md p-4 space-y-3 text-sm">
          <p>
            Komisyonsuz Toplam Ürün Tutarı:{" "}
            <strong>{productTotal.toLocaleString("tr-TR")} ₺</strong>
          </p>
          <p>
            Toplam Komisyon Tutarı:{" "}
            <strong>{totalCommission.toLocaleString("tr-TR")} ₺</strong>
          </p>

          {/* İşçilik */}
          <div>
            <label className="block text-sm font-medium mb-1">İşçilik Ücreti</label>
            <Input
              type="text"
              value={laborCostInput}
              onChange={(e) => setLaborCostInput(e.target.value)}
              onBlur={() => {
                const raw = laborCostInput.replace(/\./g, "").replace(",", ".")
                const num = Number(raw) || 0
                setLaborCost(num)
                setLaborCostInput(formatCurrency(num))
              }}
              className="w-36"
            />
          </div>

          {/* Yol */}
          <div>
            <label className="block text-sm font-medium mb-1">Yol Ücreti</label>
            <Input
              type="text"
              value={travelCostInput}
              onChange={(e) => setTravelCostInput(e.target.value)}
              onBlur={() => {
                const raw = travelCostInput.replace(/\./g, "").replace(",", ".")
                const num = Number(raw) || 0
                setTravelCost(num)
                setTravelCostInput(formatCurrency(num))
              }}
              className="w-36"
            />
          </div>

          <p>
            Müşteri Fiyatı:{" "}
            <strong>{customerPrice.toLocaleString("tr-TR")} ₺</strong>
          </p>
          <p>
            Kazanç:{" "}
            <strong>{profit.toLocaleString("tr-TR")} ₺</strong>
          </p>

          <div className="flex justify-end">
            <Button variant="default" onClick={handleSave}>
              Kaydet
            </Button>
          </div>
        </div>
      )}

      {/* Drawer – ekle/düzenle */}
      <AddProductDrawer
        key={editProduct?.localId || (drawerOpen ? "new-open" : "new")}
        open={drawerOpen}
        setOpen={(v) => {
          if (!v) setEditProduct(null)
          setDrawerOpen(v)
        }}
        onAdd={handleAddOrUpdateProduct}
        editProduct={editProduct || undefined}
      />
    
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-[92vw] sm:max-w-[900px]"
          aria-describedby={undefined}  // console uyarısını susturur
        >
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
