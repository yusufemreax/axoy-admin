import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ses Sistemi",
  description: "Stok takibi ve ürün yönetim sistemi",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
