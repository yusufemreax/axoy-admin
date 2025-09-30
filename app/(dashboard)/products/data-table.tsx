"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** tipi değiştirince filtre/sort resetlemek istersen */
  resetSignal?: string | number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  resetSignal,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnFilters: false, // filtre kutularını kolon bazında kontrol ediyoruz
  })

  // tip değişince filtreleri VE sıralamayı sıfırla
  useEffect(() => {
    table.setColumnFilters([])
    setSorting([])
  }, [resetSignal, table])

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto w-full">
        <table className="min-w-[900px] text-sm">
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
                          {/* Başlık + Sort */}
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

                          {/* Kolon bazlı filtre kutusu */}
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
