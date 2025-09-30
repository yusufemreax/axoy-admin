/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type AnyRec = Record<string, any>

type ProductLookupTableProps = {
  data: AnyRec[]
  dynamicFields: { key: string; label: string; inputType: string }[]
  onSelect: (row: AnyRec) => void
  resetSignal?: string | number
}

export default function ProductLookupTable({
  data,
  dynamicFields,
  onSelect,
  resetSignal,
}: ProductLookupTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const formatPrice = (val: number) =>
    typeof val === "number"
      ? val.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
      : ""

  const columns: ColumnDef<AnyRec>[] = useMemo(() => {
    let cols: ColumnDef<AnyRec>[] = [
      {
        accessorKey: "image",
        header: "Foto",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.image ? (
            <Image
              src={row.original.image}
              alt={row.original.model || "image"}
              width={48}
              height={48}
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            "-"
          ),
        enableColumnFilter: false,
      },
      { accessorKey: "type", header: "Tip", enableSorting: true, enableColumnFilter: true },
      { accessorKey: "brand", header: "Marka", enableSorting: true, enableColumnFilter: true },
      { accessorKey: "model", header: "Model", enableSorting: true, enableColumnFilter: true },
      {
        accessorKey: "price",
        header: "Fiyat (₺)",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => `${formatPrice(row.original.price)} ₺`,
      },
      {
        accessorKey: "stock",
        header: "Stok",
        enableSorting: true,
        enableColumnFilter: true,
      },
    ]

    if (dynamicFields?.length) {
      const specCols: ColumnDef<AnyRec>[] = dynamicFields.map((f) => ({
        id: f.key,
        header: f.label,
        accessorFn: (row: AnyRec) => {
          const val = row.specs?.[f.key]
          return val !== undefined && val !== null ? String(val) : ""
        },
        cell: ({ row }) => row.original.specs?.[f.key] ?? "-",
        enableColumnFilter: true,
        enableSorting: true,
      }))
      cols = [...cols, ...specCols]
    }

    cols.push({
      id: "select",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelect(row.original)}
        >
          Seç
        </Button>
      ),
    })

    return cols
  }, [dynamicFields, onSelect])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnFilters: false, // kutuları kolon bazında kontrol ediyoruz
  })

  // tip değişince filtre + sort sıfırla
  useEffect(() => {
    table.setColumnFilters([])
    setSorting([])
  }, [resetSignal, table])

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto w-full">
        <table className="min-w-[1000px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const sorted = h.column.getIsSorted() as false | "asc" | "desc"
                  return (
                    <th
                      key={h.id}
                      className="px-3 py-2 text-left border-b whitespace-nowrap align-top"
                    >
                      {h.isPlaceholder ? null : (
                        <div className="flex flex-col gap-1">
                          {/* Başlık + Sıralama */}
                          <Button
                            type="button"
                            className={`inline-flex items-center gap-1 ${
                              canSort ? "cursor-pointer select-none" : "cursor-default"
                            }`}
                            onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                            aria-sort={
                              sorted === "asc"
                                ? "ascending"
                                : sorted === "desc"
                                ? "descending"
                                : "none"
                            }
                            variant="ghost"
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {canSort ? (
                              sorted === "asc" ? (
                                <ArrowUp className="h-4 w-4 opacity-70" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-4 w-4 opacity-70" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-40" />
                              )
                            ) : null}
                          </Button>

                          {/* Kolon bazlı filtre */}
                          {h.column.columnDef.enableColumnFilter && (
                            <Input
                              placeholder="Filtrele..."
                              value={(h.column.getFilterValue() as string) ?? ""}
                              onChange={(e) => h.column.setFilterValue(e.target.value)}
                              className="h-7 text-xs"
                            />
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
