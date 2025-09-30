"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

export type ProductType = {
  _id: string
  name: string
  fields: {
    key: string
    label: string
    inputType: string
    options?: string[]   // ✅ select tipinde buradan gelecek
  }[]
}

export const columns = (
  onEdit: (item: ProductType) => void,
  onDelete: (id: string) => void
): ColumnDef<ProductType>[] => [
  {
    accessorKey: "name",
    header: "Tip Adı",
  },
  {
    id: "fields",
    header: "Alanlar",
    cell: ({ row }) => {
      const fields = row.original.fields || []
      return (
        <div className="space-y-1">
          {fields.map((f) => (
            <div key={f.key} className="text-xs">
              <span className="font-medium">{f.label}</span> ({f.key}) [{f.inputType}]
            </div>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Aksiyonlar",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
          Düzenle
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(row.original._id)}
        >
          Sil
        </Button>
      </div>
    ),
  },
]
