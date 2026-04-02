"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"

const menus = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: "💰" },
  { href: "/dashboard/modal", label: "Modal", icon: "🏦" },
  { href: "/dashboard/laporan", label: "Laporan", icon: "📈" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
            🍜
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Kantin Noksi</p>
            <p className="text-xs text-gray-400">Manajemen Keuangan</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menus.map((menu) => {
          const isActive = pathname === menu.href
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span className="text-base">{menu.icon}</span>
              {menu.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          id="logout-button"
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10 pointer-events-auto"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-6 z-50">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Konfirmasi Logout</h3>
            <p className="text-sm text-gray-600 mb-4">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    console.log("confirm logout: yes")
                    setShowConfirm(false)
                    await signOut({ callbackUrl: "/login" })
                  } catch (err) {
                    console.error("signOut error:", err)
                  }
                }}
                className="px-3 py-2 rounded-md bg-red-500 text-sm text-white hover:bg-red-600"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  )
}