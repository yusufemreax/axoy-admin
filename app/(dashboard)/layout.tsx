"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Package, Tags, Layers, Wrench, Users } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menu = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/product-types", label: "Product Types", icon: Tags },
    { href: "/ready-systems", label: "Ready Systems", icon: Layers },
    { href: "/system-builder", label: "System Builder", icon: Wrench },
    { href: "/customers", label: "Customers", icon: Users },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar 
      <aside className="w-60 bg-gray-50 border-r flex flex-col">
        <div className="p-4 font-bold text-lg">Ses Sistemi</div>
        <nav className="flex-1 p-2 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors",
                  pathname === item.href && "bg-gray-300 font-semibold"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    */}
      {/* İçerik */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
