// app/layout.tsx
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kantin Noksi",
  description: "Sistem keuangan kantin",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}