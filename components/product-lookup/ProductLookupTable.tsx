"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import type { Product } from "@/app/(dashboard)/products/columns"
import {
  productLookupColumns,
  type DynamicField,
} from "./product-lookup-columns"

// shadcn Table
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

type Props = {
  data: Product[]
  dynamicFields: DynamicField[]
  onSelect: (p: Product) => void
}

export default function ProductLookupTable({ data, dynamicFields, onSelect }: Props) {
  // sorting state
  const [sorting, setSorting] = React.useState<SortingState>([])

  // build columns (base + dynamic)
  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => productLookupColumns(onSelect, dynamicFields),
    [onSelect, dynamicFields]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    // Varsayılan olarak kolon filtreleri kapalı; başlık altına input basınca aktif oluyor
    enableColumnFilters: false,
  })

  // 🔧 Tip/dinamik kolonlar değiştiğinde önceki filtreler “kolon yok” hatası doğurmasın
  React.useEffect(() => {
    table.resetColumnFilters()
  }, [table, dynamicFields])

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => {
                if (h.isPlaceholder) return <TableHead key={h.id} />
                const canSort = h.column.getCanSort()
                const sorted = h.column.getIsSorted() as false | "asc" | "desc"
                const showFilter = Boolean(h.column.columnDef.enableColumnFilter)

                return (
                  <TableHead key={h.id} className="align-top">
                    <div className="flex flex-col gap-1">
                      {/* --- Sorting Button (senin verdiğin kalıp) --- */}
                      <Button
                        type="button"
                        variant="ghost"
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

                      {/* --- Column Filter Input --- */}
                      {showFilter && (
                        <Input
                          placeholder="Filtrele…"
                          className="h-7 text-xs"
                          value={(h.column.getFilterValue() as string) ?? ""}
                          onChange={(e) => h.column.setFilterValue(e.target.value)}
                        />
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-b">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="whitespace-nowrap px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-sm py-6">
                Kayıt yok.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
