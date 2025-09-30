/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductLookup from "@/components/product-lookup/ProductLookup" // <= kendi bileşenin

type Product = {
  _id: string
  type: string
  brand: string
  model: string
  price: number
  image?: string
}

export default function AddProductDrawer({
  open,
  setOpen,
  onAdd,
  editProduct,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onAdd: (item: any) => void
  editProduct?: any | null
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [commissionRate, setCommissionRate] = useState(25)

  const formatPrice = (val: number) =>
    val.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

  const unitPrice = selectedProduct?.price || 0
  const unitCommission = unitPrice * (commissionRate / 100)
  const totalCommission = unitCommission * qty
  const totalPrice = unitPrice * qty + totalCommission

  // Drawer açıldığında formu doldur / temizle
  useEffect(() => {
    if (!open) return
    if (editProduct) {
      // editProduct'ı lookup'a bas
      setSelectedProduct({
        _id: editProduct._id,
        type: editProduct.type,
        brand: editProduct.brand,
        model: editProduct.model,
        price: editProduct.unitPrice, // satırda birim fiyat olarak saklı
        image: editProduct.image || "",
      })
      setQty(editProduct.qty)
      setCommissionRate(editProduct.commissionRate)
    } else {
      setSelectedProduct(null)
      setQty(1)
      setCommissionRate(25)
    }
  }, [open, editProduct])

  const handleClose = (o: boolean) => {
    if (!o) {
      // kapanırken reset
      setSelectedProduct(null)
      setQty(1)
      setCommissionRate(25)
    }
    setOpen(o)
  }

  const handleSave = () => {
    if (!selectedProduct) return
    const payload = {
      // Güncellemede mevcut localId korunacak, eklemede yeni atanacak (page.tsx'te).
      localId: editProduct?.localId, // korunması için bırakıyoruz (undefined ise page yeni atıyor)
      _id: selectedProduct._id,
      type: selectedProduct.type,
      brand: selectedProduct.brand,
      model: selectedProduct.model,
      image: selectedProduct.image || "",
      unitPrice,
      qty,
      commissionRate,
      unitCommission,
      totalCommission,
      totalPrice,
    }
    onAdd(payload)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[520px] sm:w-[640px] p-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editProduct ? "Ürün Düzenle" : "Ürün Ekle"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Lookup */}
          <div>
            <label className="block text-sm font-medium mb-1">Ürün Seç</label>
            <ProductLookup
              value={selectedProduct}
              onChange={setSelectedProduct}
            />
          </div>

          {selectedProduct && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Adet</label>
                <Input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Birim Fiyat</label>
                <Input type="text" value={formatPrice(unitPrice)} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Komisyon %</label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                />
              </div>

              <div className="text-sm space-y-1">
                <p> Birim Komisyon: <strong>{formatPrice(unitCommission)} ₺</strong></p>
                <p> Toplam Komisyon: <strong>{formatPrice(totalCommission)} ₺</strong></p>
                <p> Toplam Tutar: <strong>{formatPrice(totalPrice)} ₺</strong></p>
              </div>
            </>
          )}

          <Button className="w-full mt-4" onClick={handleSave} disabled={!selectedProduct}>
            {editProduct ? "Güncelle" : "Ekle"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
