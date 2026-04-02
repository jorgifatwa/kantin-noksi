"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jumlah: z.string().min(1, "Jumlah wajib diisi"),
  jenisModal: z.enum(["PERALATAN", "BAHAN_BAKU", "LAINNYA"]),
  keterangan: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
})

type FormData = z.infer<typeof schema>

const jenisOptions = [
  { value: "PERALATAN", label: "Peralatan", contoh: "Kompor, meja, kursi" },
  { value: "BAHAN_BAKU", label: "Bahan Baku", contoh: "Stok awal ayam, bumbu" },
  { value: "LAINNYA", label: "Lainnya", contoh: "Dll" },
]

function formatRupiahInput(value: string) {
  const cleaned = value.replace(/\D/g, "")
  const trimmed = cleaned.replace(/^0+/, "")
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export default function FormModal() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      jenisModal: "PERALATAN",
      tanggal: new Date().toISOString().split("T")[0],
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/modal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          jumlah: parseFloat(data.jumlah.replace(/\./g, "")),
        }),
      })

      if (!res.ok) throw new Error()

      setSuccess(true)
      reset({
        nama: "",
        jumlah: "",
        jenisModal: "PERALATAN",
        keterangan: "",
        tanggal: new Date().toISOString().split("T")[0],
      })
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert("Gagal menyimpan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-medium text-gray-700 mb-4">Tambah Modal</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg px-4 py-3">
            Modal berhasil disimpan!
          </div>
        )}

        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Item
          </label>
          <input
            {...register("nama")}
            placeholder="Contoh: Kompor gas 2 tungku"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
          {errors.nama && (
            <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>
          )}
        </div>

        {/* Jenis Modal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Jenis Modal
          </label>
          <select
            {...register("jenisModal")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
          >
            {jenisOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.contoh}
              </option>
            ))}
          </select>
        </div>

        {/* Jumlah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Jumlah (Rp)
          </label>
          <input
            {...register("jumlah", {
              onChange: (e) => {
                const formatted = formatRupiahInput(e.target.value)
                setValue("jumlah", formatted, { shouldValidate: true, shouldDirty: true })
              },
            })}
            placeholder="Contoh: 500.000"
            type="text"
            inputMode="numeric"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
          {errors.jumlah && (
            <p className="text-red-500 text-xs mt-1">{errors.jumlah.message}</p>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tanggal
          </label>
          <input
            {...register("tanggal")}
            type="date"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
          {errors.tanggal && (
            <p className="text-red-500 text-xs mt-1">{errors.tanggal.message}</p>
          )}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Keterangan <span className="text-gray-400">(opsional)</span>
          </label>
          <textarea
            {...register("keterangan")}
            placeholder="Catatan tambahan..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          {loading ? "Menyimpan..." : "Simpan Modal"}
        </button>

      </form>
    </div>
  )
}