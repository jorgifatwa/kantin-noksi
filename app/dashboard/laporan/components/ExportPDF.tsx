"use client"

import { useState } from "react"
import {
  Document, Page, Text, View, StyleSheet, PDFDownloadLink
} from "@react-pdf/renderer"

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#374151" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, backgroundColor: "#f9fafb", fontWeight: "bold" },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  summaryBox: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: { flex: 1, padding: 10, backgroundColor: "#f9fafb", borderRadius: 4 },
  cardLabel: { fontSize: 9, color: "#6b7280", marginBottom: 3 },
  cardValue: { fontSize: 12, fontWeight: "bold" },
  green: { color: "#16a34a" },
  red: { color: "#dc2626" },
  blue: { color: "#2563eb" },
  orange: { color: "#ea580c" },
  footer: { marginTop: 20, borderTopWidth: 0.5, borderTopColor: "#e5e7eb", paddingTop: 10, color: "#9ca3af", fontSize: 9 },
})

type Transaksi = {
  id: string
  tanggal: string
  keterangan: string
  jumlah: number
  jenis: "MASUK" | "KELUAR"
  kategori: string
}

const kategoriLabel: Record<string, string> = {
  PENJUALAN: "Penjualan",
  BAHAN_BAKU: "Bahan Baku",
  OPERASIONAL: "Operasional",
  LAINNYA: "Lainnya",
}

function LaporanPDF({
  transaksi,
  totalModal,
  akumulasiProfit,
  periode,
}: {
  transaksi: Transaksi[]
  totalModal: number
  akumulasiProfit: number
  periode: string
}) {
  const totalMasuk = transaksi.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + Number(t.jumlah), 0)
  const totalKeluar = transaksi.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + Number(t.jumlah), 0)
  const profit = totalMasuk - totalKeluar
  const progressModal = totalModal > 0 ? Math.min((akumulasiProfit / totalModal) * 100, 100) : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Keuangan Kantin Noksi</Text>
          <Text style={styles.subtitle}>
            Periode: {periode} · Dicetak: {new Date().toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.summaryBox}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Masuk</Text>
              <Text style={[styles.cardValue, styles.green]}>{formatRupiah(totalMasuk)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Keluar</Text>
              <Text style={[styles.cardValue, styles.red]}>{formatRupiah(totalKeluar)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Profit</Text>
              <Text style={[styles.cardValue, profit >= 0 ? styles.blue : styles.red]}>
                {formatRupiah(profit)}
              </Text>
            </View>
          </View>

          {/* Progress Modal */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Progress Balik Modal</Text>
            <Text style={[styles.cardValue, styles.orange]}>
              {progressModal.toFixed(1)}% · {formatRupiah(akumulasiProfit)} dari {formatRupiah(totalModal)}
            </Text>
          </View>
        </View>

        {/* Tabel Transaksi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Transaksi ({transaksi.length} data)</Text>

          {/* Header tabel */}
          <View style={styles.rowHeader}>
            <Text style={styles.col1}>Keterangan</Text>
            <Text style={styles.col2}>Kategori</Text>
            <Text style={styles.col2}>Tanggal</Text>
            <Text style={styles.col3}>Jumlah</Text>
          </View>

          {/* Baris transaksi */}
          {transaksi.map((t) => (
            <View key={t.id} style={styles.row}>
              <Text style={styles.col1}>{t.keterangan}</Text>
              <Text style={styles.col2}>{kategoriLabel[t.kategori]}</Text>
              <Text style={styles.col2}>
                {new Date(t.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </Text>
              <Text style={[styles.col3, t.jenis === "MASUK" ? styles.green : styles.red]}>
                {t.jenis === "MASUK" ? "+" : "-"}{formatRupiah(Number(t.jumlah))}
              </Text>
            </View>
          ))}

          {/* Total */}
          <View style={[styles.rowHeader, { marginTop: 4 }]}>
            <Text style={styles.col1}>TOTAL</Text>
            <Text style={styles.col2} />
            <Text style={styles.col2} />
            <Text style={[styles.col3, profit >= 0 ? styles.green : styles.red]}>
              {formatRupiah(profit)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Dokumen ini dibuat otomatis oleh sistem Kantin Noksi</Text>
        </View>

      </Page>
    </Document>
  )
}

export default function ExportPDF() {
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<{
    transaksi: Transaksi[]
    totalModal: number
    akumulasiProfit: number
  } | null>(null)

  const [filterDari, setFilterDari] = useState("")
  const [filterSampai, setFilterSampai] = useState("")

  const handleSiapkan = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterDari) params.set("dari", filterDari)
      if (filterSampai) params.set("sampai", filterSampai)

      const [transaksiRes, laporanRes] = await Promise.all([
        fetch(`/api/transaksi?${params}`),
        fetch("/api/laporan"),
      ])

      const transaksi = await transaksiRes.json()
      const laporan = await laporanRes.json()

      // Filter manual by tanggal kalau ada
      const filtered = transaksi.filter((t: Transaksi) => {
        if (filterDari && new Date(t.tanggal) < new Date(filterDari)) return false
        if (filterSampai && new Date(t.tanggal) > new Date(filterSampai + "T23:59:59")) return false
        return true
      })

      setData({
        transaksi: filtered,
        totalModal: laporan.totalModal ?? 0,
        akumulasiProfit: laporan.akumulasiProfit ?? 0,
      })
      setReady(true)
    } catch {
      alert("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  const periode =
    filterDari && filterSampai
      ? `${new Date(filterDari).toLocaleDateString("id-ID")} - ${new Date(filterSampai).toLocaleDateString("id-ID")}`
      : filterDari
      ? `Sejak ${new Date(filterDari).toLocaleDateString("id-ID")}`
      : filterSampai
      ? `Sampai ${new Date(filterSampai).toLocaleDateString("id-ID")}`
      : "Semua Periode"

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📄</span>
        <div>
          <h2 className="font-medium text-gray-700">Export Laporan PDF</h2>
          <p className="text-xs text-gray-400 mt-0.5">Download laporan keuangan dalam format PDF</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Dari tanggal</label>
          <input
            type="date"
            value={filterDari}
            onChange={(e) => { setFilterDari(e.target.value); setReady(false) }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sampai tanggal</label>
          <input
            type="date"
            value={filterSampai}
            onChange={(e) => { setFilterSampai(e.target.value); setReady(false) }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {!ready ? (
        <button
          onClick={handleSiapkan}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          {loading ? "Menyiapkan data..." : "Siapkan PDF"}
        </button>
      ) : (
        <PDFDownloadLink
          document={
            <LaporanPDF
              transaksi={data!.transaksi}
              totalModal={data!.totalModal}
              akumulasiProfit={data!.akumulasiProfit}
              periode={periode}
            />
          }
          fileName={`laporan-kantin-${new Date().toISOString().split("T")[0]}.pdf`}
          className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg text-sm transition text-center"
        >
          {({ loading: pdfLoading }) =>
            pdfLoading ? "Membuat PDF..." : `Download PDF · ${data!.transaksi.length} transaksi`
          }
        </PDFDownloadLink>
      )}

    </div>
  )
}