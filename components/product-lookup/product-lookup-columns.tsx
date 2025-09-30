"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Product } from "@/app/(dashboard)/products/columns"

export type DynamicField = { key: string; label: string }

const formatPrice = (val: number) =>
  val?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

/**
 * onSelect: satır seç butonuna basıldığında çağrılır
 * dynamicFields: ürün tipine göre gelen dinamik kolon tanımları
 */
export const productLookupColumns = (
  onSelect: (p: Product) => void,
  dynamicFields: DynamicField[] = []
): ColumnDef<Product>[] => {
  // Base kolonlar
  const base: ColumnDef<Product>[] = [
    {
      id: "actions",
      header: "Seç",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button size="sm" onClick={() => onSelect(row.original)}>
          Seç
        </Button>
      ),
    },
    {
      accessorKey: "image",
      header: "Foto",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.image ? (
          <Image
            src={row.original.image}
            alt={row.original.model}
            width={48}
            height={48}
            className="h-12 w-12 object-cover rounded"
          />
        ) : (
          "-"
        ),
    },
    { accessorKey: "type", header: "Tip", enableColumnFilter: false },
    { accessorKey: "brand", header: "Marka", enableColumnFilter: true },
    { accessorKey: "model", header: "Model", enableColumnFilter: true },
    {
      accessorKey: "price",
      header: "Fiyat (₺)",
      enableColumnFilter: true,
      cell: ({ row }) => `${formatPrice(row.original.price)} ₺`,
    },
  ]

  // Dinamik kolonlar (specs.*)
  const dyn: ColumnDef<Product>[] = dynamicFields.map((f) => ({
    id: f.key,               // ör: "2OHM" gibi anahtarlar güvenle id olarak kullanılabilir
    header: f.label,
    enableColumnFilter: true,
    accessorFn: (row) => {
      const v = row.specs?.[f.key as keyof typeof row.specs]
      return v == null ? "" : String(v)
    },
    cell: ({ row }) => (row.original.specs?.[f.key] ?? "-") as string,
  }))

  return [...base, ...dyn]
}
