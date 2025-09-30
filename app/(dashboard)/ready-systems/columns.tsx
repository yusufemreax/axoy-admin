"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

export type ReadySystem = {
  _id: string
  name: string
  totalPrice: number
  createdAt: string
}

export const columns = (
  handleEdit: (item: ReadySystem) => void,
  handleDelete: (id: string) => void
): ColumnDef<ReadySystem>[] => [
  {
    accessorKey: "name",
    header: "Sistem Adı",
  },
  {
    accessorKey: "totalPrice",
    header: "Toplam Fiyat",
    cell: ({ row }) => <span>{row.original.totalPrice} ₺</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Oluşturulma Tarihi",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("tr-TR"),
  },
  {
    id: "actions",
    header: "İşlemler",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(row.original)}
        >
          Düzenle
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(row.original._id)}
        >
          Sil
        </Button>
      </div>
    ),
  },
]
