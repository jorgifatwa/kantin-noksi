"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
  jumlah: z.string().min(1, "Jumlah wajib diisi"),
  jenis: z.enum(["MASUK", "KELUAR"]),
  kategori: z.enum(["PENJUALAN", "BAHAN_BAKU", "OPERASIONAL", "LAINNYA"]),
})

type FormData = z.infer<typeof schema>

const kategoriOptions: Record<string, { value: string; label: string }[]> = {
  MASUK: [
    { value: "PENJUALAN", label: "Penjualan" },
    { value: "LAINNYA", label: "Lainnya" },
  ],
  KELUAR: [
    { value: "BAHAN_BAKU", label: "Bahan Baku" },
    { value: "OPERASIONAL", label: "Operasional" },
    { value: "LAINNYA", label: "Lainnya" },
  ],
}

function formatRupiahInput(value: string) {
  const cleaned = value.replace(/\D/g, "")
  const trimmed = cleaned.replace(/^0+/, "")
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export default function FormTransaksi() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      jenis: "MASUK",
      kategori: "PENJUALAN",
      tanggal: new Date().toISOString().split("T")[0],
    },
  })

  const jenis = watch("jenis")

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/transaksi", {
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
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
        jumlah: "",
        jenis: "MASUK",
        kategori: "PENJUALAN",
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
      <h2 className="font-medium text-gray-700 mb-4">Tambah Transaksi</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg px-4 py-3">
            Transaksi berhasil disimpan!
          </div>
        )}

        {/* Jenis Transaksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Jenis
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["MASUK", "KELUAR"].map((j) => (
              <label
                key={j}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition ${
                  jenis === j
                    ? j === "MASUK"
                      ? "bg-green-50 border-green-300 text-green-600"
                      : "bg-red-50 border-red-300 text-red-600"
                    : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <input
                  {...register("jenis")}
                  type="radio"
                  value={j}
                  className="hidden"
                />
                {j === "MASUK" ? "💚 Masuk" : "🔴 Keluar"}
              </label>
            ))}
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Kategori
          </label>
          <select
            {...register("kategori")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
          >
            {kategoriOptions[jenis].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Keterangan
          </label>
          <input
            {...register("keterangan")}
            placeholder="Contoh: Jualan soto 50 porsi"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
          {errors.keterangan && (
            <p className="text-red-500 text-xs mt-1">{errors.keterangan.message}</p>
          )}
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
            type="text"
            inputMode="numeric"
            placeholder="Contoh: 150.000"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>

      </form>
    </div>
  )
}