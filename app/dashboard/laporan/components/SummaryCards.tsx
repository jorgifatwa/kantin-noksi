import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"

const prisma = new PrismaClient()

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

export default async function SummaryCards() {
  const session = await authHandler()
  const userId = session?.user?.id

  const sekarang = new Date()
  const startHari = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate())
  const startBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)
  const startTahun = new Date(sekarang.getFullYear(), 0, 1)

  const [transaksiHari, transaksiBulan, transaksiTahun] = await Promise.all([
    prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startHari } } }),
    prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startBulan } } }),
    prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startTahun } } }),
  ])

  const hitung = (data: typeof transaksiHari) => {
    const masuk = data.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + Number(t.jumlah), 0)
    const keluar = data.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + Number(t.jumlah), 0)
    return { masuk, keluar, profit: masuk - keluar }
  }

  if (!userId) return <div className="text-center text-gray-400">Unauthorized</div>

  const cards = [
    { label: "Profit Hari Ini", icon: "📅", ...hitung(transaksiHari) },
    { label: "Profit Bulan Ini", icon: "📆", ...hitung(transaksiBulan) },
    { label: "Profit Tahun Ini", icon: "🗓️", ...hitung(transaksiTahun) },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{card.icon}</span>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
          </div>
          <p className={`text-xl font-bold ${card.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
            {formatRupiah(card.profit)}
          </p>
          <div className="flex gap-3 mt-2">
            <p className="text-xs text-gray-400">
              ↑ <span className="text-green-600">{formatRupiah(card.masuk)}</span>
            </p>
            <p className="text-xs text-gray-400">
              ↓ <span className="text-red-500">{formatRupiah(card.keluar)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}