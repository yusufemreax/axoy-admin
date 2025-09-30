"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

type Customer = {
  _id: string;
  customerName: string;
  jobDate?: string | Date | null;
  probability?: number;
  productTotal?: number;
  laborCost?: number;
  totalCommission?: number;
  customerPrice?: number;
  profit?: number;
};

// Ortak para formatter
const money = (val: unknown) => {
  const num = typeof val === "number" ? val : Number(val ?? 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(num) ? num : 0);
};

// Tarih formatter (gg.aa.yyyy)
const dateTR = (val: unknown) => {
  if (!val) return "-";
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("tr-TR"); // gg.aa.yyyy
};

// Yüzde formatter
const percent = (val: unknown) => {
  const num = typeof val === "number" ? val : Number(val ?? 0);
  if (!Number.isFinite(num)) return "-";
  return `${num}%`;
};

// columns’u fonksiyon olarak export ediyoruz ki mutate’i actions’da kullanabilelim
export const buildColumns = (mutate: () => void): ColumnDef<Customer>[] => [
  {
    accessorKey: "customerName",
    header: "Müşteri Adı",
    cell: ({ row }) => row.original.customerName || "-",
  },
  {
    accessorKey: "jobDate",
    header: "Yapılma Tarihi",
    cell: ({ row }) => dateTR(row.original.jobDate),
  },
  {
    accessorKey: "probability",
    header: "Olasılık",
    cell: ({ row }) => percent(row.original.probability),
  },
  {
    accessorKey: "productTotal",
    header: "Ürünler Toplamı",
    cell: ({ row }) => <div className="font-medium">{money(row.original.productTotal)}</div>,
  },
  {
    accessorKey: "totalCommission",
    header: "Komisyon",
    cell: ({ row }) => <div className="font-medium">{money(row.original.totalCommission)}</div>,
  },
  {
    accessorKey: "laborCost",
    header: "İşçilik Ücreti",
    cell: ({ row }) => <div className="font-medium">{money(row.original.laborCost)}</div>,
  },
  {
    accessorKey: "customerPrice",
    header: "Müşteri Fiyatı",
    cell: ({ row }) => <div className="font-medium">{money(row.original.customerPrice)}</div>,
  },
  {
    accessorKey: "profit",
    header: "Toplam Kâr",
    cell: ({ row }) => <div className="font-medium">{money(row.original.profit)}</div>,
  },
  {
    id: "actions",
    header: "İşlemler",
    cell: ({ row }) => {
      const id = row.original._id;
      return (
        <div className="flex gap-2">
          <Link href={`/customers/${id}`}>
            <Button size="sm" variant="outline">Düzenle</Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
              await fetch(`/api/customers/${id}`, { method: "DELETE" });
              mutate(); // tabloyu yenile
            }}
          >
            Sil
          </Button>
        </div>
      );
    },
  },
];
