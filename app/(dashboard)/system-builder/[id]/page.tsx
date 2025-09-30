/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"

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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import AddProductDrawer from "../add-product-drawer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const formatCurrency = (val: number) =>
  val.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export default function EditSystemBuilderPage() {
  const { id } = useParams()

  // Ready system & all products (hydrate eksik image’lar için)
  const { data: system, mutate } = useSWR<any>(
    id ? `/api/ready-systems/${id}` : null,
    fetcher
  )
  const { data: allProducts } = useSWR<any[]>("/api/products", fetcher)

  // Form state
  const [systemName, setSystemName] = useState("")
  const [systemProducts, setSystemProducts] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)

  // Costs
  const [laborCost, setLaborCost] = useState(2000)
  const [laborCostInput, setLaborCostInput] = useState(formatCurrency(2000))
  const [travelCost, setTravelCost] = useState(0)
  const [travelCostInput, setTravelCostInput] = useState(formatCurrency(0))

  // Image preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const openPreview = useCallback((src?: string) => {
    if (!src) return
    setPreviewSrc(src)
    setPreviewOpen(true)
  }, [])

  // İlk yükleme: system’den state’e
  useEffect(() => {
    if (!system) return

    setSystemName(system.name || "")

    // Her satıra benzersiz localId ata
    const withLocalIds =
      (system.products || []).map((p: any, idx: number) => ({
        ...p,
        localId:
          p.localId ||
          `${p._id ?? "local"}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      })) ?? []

    setSystemProducts(withLocalIds)

    const lc = system.laborCost ?? 2000
    const tc = system.travelCost ?? 0
    setLaborCost(lc)
    setLaborCostInput(formatCurrency(lc))
    setTravelCost(tc)
    setTravelCostInput(formatCurrency(tc))
  }, [system])

  // Eski kayıtlarda image yoksa, product tablosundan doldur (hydrate)
  useEffect(() => {
    
    if (!allProducts?.length || !systemProducts.length) return

    const idToImage = new Map<string, string>(
      allProducts
        .filter((p: any) => p._id && p.image)
        .map((p: any) => [String(p._id), String(p.image)])
    )

    let changed = false
    const patched = systemProducts.map((item) => {
      if (!item.image && item._id && idToImage.has(String(item._id))) {
        changed = true
        return { ...item, image: idToImage.get(String(item._id)) }
      }
      return item
    })

    if (changed) setSystemProducts(patched)
  }, [allProducts, systemProducts])

  // Toplamlar
  const productTotal = systemProducts.reduce(
    (sum, p) => sum + p.unitPrice * p.qty,
    0
  )
  const totalCommission = systemProducts.reduce(
    (sum, p) => sum + p.totalCommission,
    0
  )
  const customerPrice = productTotal + totalCommission + laborCost + travelCost
  const profit = totalCommission + laborCost

  // Kaydet
  const handleSave = async () => {
    if (!systemName) {
      alert("Lütfen sistem adı girin")
      return
    }

    await fetch(`/api/ready-systems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...system,
        name: systemName,
        products: systemProducts, // image alanı dahil
        productTotal,
        totalCommission,
        laborCost,
        travelCost,
        customerPrice,
        profit,
      }),
    })

    mutate()
    alert("Sistem güncellendi ✅")
  }

  // Drawer’dan gelen ürün ekleme/güncelleme
  const handleAddProduct = (p: any) => {
    if (editProduct) {
      // Güncelleme
      setEditProduct(null)
      setSystemProducts((prev) =>
        prev.map((row) =>
          row.localId === editProduct.localId
            ? { ...p, localId: editProduct.localId }
            : row
        )
      )
    } else {
      // Ekleme
      setSystemProducts((prev) => [
        ...prev,
        { ...p, localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
      ])
    }
  }

  // Para inputlarını blur’da sayıya çevir & formatla
  const onLaborBlur = () => {
    const raw = laborCostInput.replace(/\./g, "").replace(",", ".")
    const num = Number(raw) || 0
    setLaborCost(num)
    setLaborCostInput(formatCurrency(num))
  }
  const onTravelBlur = () => {
    const raw = travelCostInput.replace(/\./g, "").replace(",", ".")
    const num = Number(raw) || 0
    setTravelCost(num)
    setTravelCostInput(formatCurrency(num))
  }

  return (
    <div className="space-y-6">
      {/* Başlık & Ekle */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Sistem Düzenle {system ? `: ${system.name}` : ""}
        </h1>
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
          {systemProducts.length ? (
            systemProducts.map((p) => (
              <ContextMenu key={p.localId}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell className="align-middle">
                      {p.image ? (
                        <button
                          type="button"
                          onClick={() => openPreview(p.image)}
                          className="group"
                          title="Büyüt"
                        >
                          <Image
                            src={p.image}
                            alt={p.model ?? "product"}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover rounded"
                          />
                        </button>
                      ) : (
                        "-"
                      )}
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
                      setSystemProducts((prev) =>
                        prev.filter((x) => x.localId !== p.localId)
                      )
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

      {/* Toplamlar */}
      <div className="space-y-3 border rounded-md p-4 bg-gray-50">
        <p>
          Komisyonsuz Toplam: <strong>{formatCurrency(productTotal)} ₺</strong>
        </p>
        <p>
          Toplam Komisyon: <strong>{formatCurrency(totalCommission)} ₺</strong>
        </p>

        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">İşçilik Ücreti</label>
          <Input
            type="text"
            value={laborCostInput}
            onChange={(e) => setLaborCostInput(e.target.value)}
            onBlur={onLaborBlur}
            className="w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">Yol Ücreti</label>
          <Input
            type="text"
            value={travelCostInput}
            onChange={(e) => setTravelCostInput(e.target.value)}
            onBlur={onTravelBlur}
            className="w-40"
          />
        </div>

        <p>
          Müşteri Fiyatı: <strong>{formatCurrency(customerPrice)} ₺</strong>
        </p>
        <p>
          Kazanç: <strong>{formatCurrency(profit)} ₺</strong>
        </p>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Güncelle</Button>
        </div>
      </div>

      {/* Drawer */}
      <AddProductDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        onAdd={handleAddProduct}
        editProduct={editProduct}
      />

      {/* Image Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-[92vw] sm:max-w-[900px]"
          aria-describedby={undefined} // accessibility uyarısını susturur
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
