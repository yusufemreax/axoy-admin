"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Product } from "@/app/(dashboard)/products/columns"

const formatPrice = (val: number) =>
  val?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

export const productLookupColumns = (
  onSelect: (p: Product) => void
): ColumnDef<Product>[] => [
  {
    id: "actions",
    header: "Seç",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <Button size="sm" onClick={() => onSelect(row.original)}>
        Seç
      </Button>
    ),
  },
  {
    accessorKey: "image",
    header: "Foto",
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
    enableColumnFilter: false,
  },
  {
    accessorKey: "type",
    header: "Tip",
    enableColumnFilter: true,
  },
  {
    accessorKey: "brand",
    header: "Marka",
    enableColumnFilter: true,
  },
  {
    accessorKey: "model",
    header: "Model",
    enableColumnFilter: true,
  },
  {
    accessorKey: "price",
    header: "Fiyat (₺)",
    cell: ({ row }) => `${formatPrice(row.original.price)} ₺`,
    enableColumnFilter: true,
  },
  
]
