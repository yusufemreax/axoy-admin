/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export type Product = {
  _id: string
  type: string
  brand: string
  model: string
  price: number
  stock?: number
  specs?: Record<string, any>
  image?: string
}

export const buildColumns = (
  selectedTypeDef: any,
  setEditing: (p: any) => void,
  setOpen: (v: boolean) => void,
  mutate: () => void,
  onPreview?: (src?: string) => void // 🔍 yeni param: foto önizleme
): ColumnDef<any>[] => {
  const formatPrice = (val: number) =>
    val?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

  // Default kolonlar
  let cols: ColumnDef<any>[] = [
    {
      accessorKey: "image",
      header: "Foto",
      cell: ({ row }) =>
        row.original.image ? (
          <button
            type="button"
            onClick={() => onPreview?.(row.original.image)}
            className="group"
            title="Büyüt"
          >
            <Image
              src={row.original.image}
              alt={row.original.model}
              width={48}
              height={48}
              className="h-12 w-12 object-cover rounded ring-1 ring-transparent group-hover:ring-primary transition"
            />
          </button>
        ) : (
          "-"
        ),
      enableColumnFilter: false,
      enableSorting: false,
    },
    { accessorKey: "type", header: "Tip" ,enableSorting: false,},
    { accessorKey: "brand", header: "Marka", enableColumnFilter: true },
    { accessorKey: "model", header: "Model", enableColumnFilter: true },
    {
      accessorKey: "price",
      header: "Fiyat (₺)",
      cell: ({ row }) => `${formatPrice(row.original.price)} ₺`,
      enableColumnFilter: true,
    },
    { accessorKey: "stock", header: "Stok", enableColumnFilter: true },
  ]

  // Seçilen tipe göre specs kolonları
  if (selectedTypeDef?.fields) {
    const specCols = selectedTypeDef.fields.map((f: any) => ({
      id: f.key,
      header: f.label,
      accessorFn: (row: any) => {
        const val = row.specs?.[f.key]
        return val !== undefined && val !== null ? String(val) : ""
      },
      cell: ({ row }: any) => row.original.specs?.[f.key] ?? "-",
      enableColumnFilter: true,
    }))
    cols = [...cols, ...specCols]
  }

  // Aksiyonlar
  cols.push({
    id: "actions",
    header: "Aksiyonlar",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(row.original)
            setOpen(true)
          }}
        >
          Düzenle
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return
            await fetch(`/api/products/${row.original._id}`, { method: "DELETE" })
            mutate()
          }}
        >
          Sil
        </Button>
      </div>
    ),
  })

  return cols
}
