"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts"

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

const namaBulan = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

export default function GrafikMinggu() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([])
  const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString())
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)

  const tahunOptions = Array.from({ length: 3 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  )

  useEffect(() => {
    let isMounted = true
    fetch(`/api/laporan?periode=minggu&bulan=${bulan}&tahun=${tahun}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setData(d.grafikMinggu ?? [])
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [bulan, tahun])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-medium text-gray-700">Grafik Per Minggu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Pilih bulan untuk melihat detail minggu</p>
        </div>
        <div className="flex gap-2">
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {namaBulan.map((nama, i) => (
              <option key={i + 1} value={(i + 1).toString()}>{nama}</option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {tahunOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Memuat data...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data di bulan ini
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? formatRupiah(v) : v} />
            <Legend />
            <Bar dataKey="masuk" name="Masuk" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="Keluar" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Profit" fill="#fb923c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}