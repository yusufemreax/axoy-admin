"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import { columns, ProductType } from "./columns"
import { useState } from "react"
import AddProductTypeForm from "./add-product-type-form"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProductTypesPage() {
  const { data, mutate } = useSWR<ProductType[]>("/api/product-types", fetcher)
  const [editing, setEditing] = useState<ProductType | null>(null)
  const [open, setOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tipi silmek istediğinize emin misiniz?")) return
    await fetch(`/api/product-types/${id}`, { method: "DELETE" })
    mutate()
  }

  const handleEdit = (item: ProductType) => {
    setEditing(item)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Product Types</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          + Yeni Tip
        </Button>
      </div>

      <DataTable columns={columns(handleEdit, handleDelete)} data={data || []} />

      <AddProductTypeForm
        editing={editing}
        setEditing={setEditing}
        open={open}
        setOpen={setOpen}
        mutate={mutate}
      />
    </div>
  )
}
