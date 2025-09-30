/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductType } from "../product-types/columns"
import useSWR from "swr"
import { useEffect, useState } from "react"
import Image from "next/image"

type AddProductFormProps = {
  editing: any | null
  setEditing: (value: any | null) => void
  open: boolean
  setOpen: (value: boolean) => void
  mutate: () => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AddProductForm({
  editing,
  setEditing,
  open,
  setOpen,
  mutate,
}: AddProductFormProps) {
  const { data: types } = useSWR<ProductType[]>("/api/product-types", fetcher)
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<{
    type: string
    brand: string
    model: string
    price: number
    stock?: number
    image?: string
    specs: Record<string, any>
  }>({
    defaultValues: { type: "", brand: "", model: "", price: 0, stock: 0, image: "", specs: {} },
  })

  useEffect(() => {
    if (editing) {
      setSelectedType(types?.find((t) => t.name === editing.type) || null)
      form.reset({
        ...editing,
        price: Number(editing.price) || 0,
        stock: Number(editing.stock) || 0,
        image: editing.image || "",
        specs: editing.specs || {},
      })
    } else {
      form.reset({ type: "", brand: "", model: "", price: 0, stock: 0, image: "", specs: {} })
      setSelectedType(null)
    }
  }, [editing, types, form])

  const onSubmit = async (values: any) => {
    if (isUploading) {
      alert("Resim yükleniyor, lütfen bekleyin…")
      return
    }

    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock) || 0,
      image: values.image || "", // RHF hidden input sayesinde dolu gelecek
    }

    if (editing?._id) {
      await fetch(`/api/products/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    form.reset({ type: "", brand: "", model: "", price: 0, stock: 0, image: "", specs: {} })
    setEditing(null)
    setSelectedType(null)
    setOpen(false)
    mutate()
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    form.reset({ type: "", brand: "", model: "", price: 0, stock: 0, image: "", specs: {} })
    setSelectedType(null)
    setIsUploading(false)
  }

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* RHF'e image alanını garanti kaydetmek için gizli input */}
          <input type="hidden" {...form.register("image")} />

          {/* Ürün Tipi */}
          <div>
            <label className="block text-sm font-medium mb-1">Ürün Tipi</label>
            <Select
              onValueChange={(val) => {
                form.setValue("type", val, { shouldDirty: true })
                setSelectedType(types?.find((t) => t.name === val) || null)
              }}
              value={form.watch("type")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tip seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t._id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marka */}
          <div>
            <label className="block text-sm font-medium mb-1">Marka</label>
            <Input {...form.register("brand", { required: true })} />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <Input {...form.register("model", { required: true })} />
          </div>

          {/* Fiyat */}
          <div>
            <label className="block text-sm font-medium mb-1">Fiyat</label>
            <Input
              type="text"
              value={
                form.watch("price")
                  ? form.watch("price").toLocaleString("tr-TR")
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                form.setValue("price", raw ? Number(raw) : 0, { shouldDirty: true })
              }}
              placeholder="örn: 15000"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="block text-sm font-medium mb-1">Stok</label>
            <Input type="number" {...form.register("stock")} placeholder="örn: 10" />
          </div>

          {/* Fotoğraf */}
          <div>
            <label className="block text-sm font-medium mb-1">Fotoğraf</label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return

                setIsUploading(true)
                try {
                  const reader = new FileReader()
                  reader.onloadend = async () => {
                    try {
                      const base64 = reader.result as string
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ file: base64 }),
                      })
                      const data = await res.json()
                      if (data.url) {
                        form.setValue("image", data.url, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    } finally {
                      setIsUploading(false)
                    }
                  }
                  reader.readAsDataURL(file)
                } catch {
                  setIsUploading(false)
                }
              }}
            />

            {/* Önizleme */}
            {form.watch("image") && (
              <Image
                src={form.watch("image") || ""}
                alt="preview"
                width={96}
                height={96}
                className="mt-2 h-24 w-24 object-cover border rounded"
              />
            )}

            {/* Yükleme durumu */}
            {isUploading && (
              <p className="text-xs text-muted-foreground mt-1">Görsel yükleniyor…</p>
            )}
          </div>

          {/* Dinamik Özellikler */}
          {selectedType?.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              {f.inputType === "select" ? (
                <Select
                  onValueChange={(val) =>
                    form.setValue(`specs.${f.key}`, val, { shouldDirty: true })
                  }
                  value={form.watch(`specs.${f.key}`) || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.inputType}
                  {...form.register(`specs.${f.key}`)}
                  value={form.watch(`specs.${f.key}`) ?? ""}
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isUploading || form.formState.isSubmitting}
          >
            {isUploading ? "Görsel yükleniyor…" : editing ? "Güncelle" : "Kaydet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
