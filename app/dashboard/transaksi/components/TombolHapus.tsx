"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal"

interface TombolHapusProps {
  id: string
  keterangan?: string
}

export default function TombolHapus({ id, keterangan }: TombolHapusProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleHapus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      })
      if (!res.ok) throw new Error("Gagal menghapus")
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Gagal menghapus, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
        title="Hapus"
      >
        🗑️
      </button>

      <ConfirmDeleteModal
        isOpen={showConfirm}
        title="Hapus Transaksi?"
        message="Data transaksi ini akan dihapus secara permanen."
        itemName={keterangan}
        onConfirm={handleHapus}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </>
  )
}