/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ReadySystemsPage() {
  const { data, mutate } = useSWR<any[]>("/api/ready-systems", fetcher)
  const router = useRouter()

  const formatPrice = (val: number) =>
    val.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

  const handleDelete = async (id: string) => {
    if (!confirm("Bu sistemi silmek istediğinize emin misiniz?")) return
    await fetch(`/api/ready-systems/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Hazır Sistemler</h1>
        <Button onClick={() => router.push("/system-builder")}>
          + Yeni Sistem
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sistem Adı</TableHead>
            <TableHead>Ürün Adedi</TableHead>
            <TableHead>Müşteri Fiyatı</TableHead>
            <TableHead>Kazanç</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.products.length}</TableCell>
                <TableCell>{formatPrice(s.customerPrice)} ₺</TableCell>
                <TableCell>{formatPrice(s.profit)} ₺</TableCell>
                <TableCell>
                  {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/system-builder/${s._id}`)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(s._id)}
                  >
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                Henüz kayıtlı sistem yok
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
