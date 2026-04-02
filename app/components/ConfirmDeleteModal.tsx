"use client"

import { useState } from "react"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title: string
  message: string
  itemName?: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
            ⚠️
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-center text-sm text-gray-600 mb-2">
          {message}
        </p>

        {/* Item Name */}
        {itemName && (
          <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
            <p className="text-xs text-gray-500 mb-1">Item yang akan dihapus:</p>
            <p className="text-sm font-medium text-gray-800 truncate">{itemName}</p>
          </div>
        )}

        {/* Warning */}
        <p className="text-xs text-gray-500 text-center mb-6">
          Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading || loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Menghapus...
              </>
            ) : (
              <>
                <span>🗑️</span>
                Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
