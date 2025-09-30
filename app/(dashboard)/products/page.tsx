/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import { useState, useMemo, useCallback } from "react"
import AddProductForm from "./add-product-form"
import { ProductType } from "../product-types/columns"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { buildColumns } from "./columns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProductsPage() {
  const { data: types } = useSWR<ProductType[]>("/api/product-types", fetcher)

  const [selectedType, setSelectedType] = useState<string>("")
  const { data, mutate } = useSWR(
    selectedType && selectedType !== "all"
      ? `/api/products?type=${selectedType}`
      : "/api/products",
    fetcher
  )

  const [editing, setEditing] = useState<any | null>(null)
  const [open, setOpen] = useState(false)

  // 🔍 Foto preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const openPreview = useCallback((src?: string) => {
    if (!src) return
    setPreviewSrc(src)
    setPreviewOpen(true)
  }, [])

  // Dinamik kolonlar
  const selectedTypeDef = types?.find((t) => t.name === selectedType)
  const columns = useMemo(
    () => buildColumns(selectedTypeDef, setEditing, setOpen, mutate, openPreview),
    [selectedTypeDef, openPreview, mutate]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products</h1>
        <div className="flex gap-2">
          {/* Tip filtresi */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tüm Tipler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              {types?.map((t) => (
                <SelectItem key={t._id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Yeni Ürün
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={data || []} resetSignal={selectedType}/>

      <AddProductForm
        editing={editing}
        setEditing={setEditing}
        open={open}
        setOpen={setOpen}
        mutate={mutate}
      />

      {/* 📸 Fotoğraf Önizleme */}
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
