"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"
import useSWR from "swr"
import type { Product } from "@/app/(dashboard)/products/columns"
import ProductLookupTable from "./ProductLookupTable"
import type { ProductType } from "@/app/(dashboard)/product-types/columns"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type ProductLookupProps = {
  value: Product | null
  onChange: (p: Product | null) => void
}

export default function ProductLookup({ value, onChange }: ProductLookupProps) {
  const [open, setOpen] = useState(false)
  const { data: products } = useSWR<Product[]>("/api/products", fetcher)
  const { data: productTypes } = useSWR<ProductType[]>("/api/product-types", fetcher)
  const [selectedType, setSelectedType] = useState<string>("")

  const activeType = productTypes?.find((t) => t.name === selectedType)

  return (
    <div className="flex gap-2">
      <Input
        value={value ? `${value.brand} ${value.model}` : ""}
        placeholder="Ürün seçiniz..."
        readOnly
      />
      <Button type="button" onClick={() => setOpen(true)}>Ara</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[98vw] !max-w-[98vw] sm:!max-w-[96vw] md:!max-w-[1100px] lg:!max-w-[1300px] xl:!max-w-[1500px] 2xl:!max-w-[1700px] p-0 overflow-hidden"
        >
          <DialogHeader className="px-6 py-4 border-b bg-background">
            <DialogTitle>Ürün Seç</DialogTitle>
            <DialogDescription id="lookup-desc" className="sr-only">
              Ürün arama ve seçim penceresi.
            </DialogDescription>
          </DialogHeader>

          <div className="h-[85vh] flex flex-col overflow-hidden" aria-describedby="lookup-desc">
            {/* Ürün Tipi Filtre */}
            <div className="px-6 py-4 border-b">
              <label className="block text-sm font-medium mb-1">Ürün Tipi</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Tip seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes?.map((t) => (
                    <SelectItem key={t._id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tablo */}
            <div className="flex-1 overflow-y-auto overflow-x-auto px-4 pb-4 mt-2">
              <div className="min-w-[1200px] xl:min-w-[1400px]">
                <ProductLookupTable
                  data={
                    selectedType
                      ? (products || []).filter((p) => p.type === selectedType)
                      : (products || [])
                  }
                  dynamicFields={activeType?.fields || []}
                  key={selectedType || "all"}
                  onSelect={(p) => {
                    onChange(p)       // <- p kesin Product
                    setOpen(false)
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
