/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "./data-table";
import { useMemo } from "react";
import { buildColumns } from "./columns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CustomersPage() {
  const { data, mutate } = useSWR<any[]>("/api/customers", fetcher);

  // columns’u burada oluşturuyoruz ki mutate’i actions kolonu içinde kullanabilelim
  const columns = useMemo(() => buildColumns(mutate), [mutate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Müşteriler</h1>
        <Link href="/customers/new">
          <Button>+ Yeni</Button>
        </Link>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <DataTable columns={columns} data={data || []} />
      </div>
    </div>
  );
}
