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

export default function GrafikBulan() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([])
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)

  const tahunOptions = Array.from({ length: 3 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  )

  useEffect(() => {
    let isMounted = true
    fetch(`/api/laporan?periode=bulan&tahun=${tahun}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setData(d.grafikBulan ?? [])
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [tahun])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-medium text-gray-700">Grafik Per Bulan</h2>
          <p className="text-xs text-gray-400 mt-0.5">Pemasukan & pengeluaran per bulan</p>
        </div>
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

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Memuat data...
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