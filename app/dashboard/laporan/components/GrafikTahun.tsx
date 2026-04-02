"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts"

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

export default function GrafikTahun() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/laporan?periode=tahun`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setData(d.grafikTahun ?? [])
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4">
        <h2 className="font-medium text-gray-700">Grafik Per Tahun</h2>
        <p className="text-xs text-gray-400 mt-0.5">Tren profit keseluruhan</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Memuat data...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Belum ada data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? formatRupiah(v) : v} />
            <Legend />
            <Line type="monotone" dataKey="masuk" name="Masuk" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="keluar" name="Keluar" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}