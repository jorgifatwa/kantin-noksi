import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"
import Link from "next/link"

const prisma = new PrismaClient()

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

export default async function DashboardPage() {
  const session = await authHandler()
  const userId = session?.user?.id

  const sekarang = new Date()
  const startHari = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate())
  const startBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)

  const [transaksiHari, transaksiBulan, semuaTransaksi, semuaModal, transaksiTerbaru] =
    await Promise.all([
      prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startHari } } }),
      prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startBulan } } }),
      prisma.transaksi.findMany({ where: { userId } }),
      prisma.modal.findMany({ where: { userId } }),
      prisma.transaksi.findMany({
        where: { userId },
        orderBy: { tanggal: "desc" },
        take: 5,
      }),
    ])

  const hitung = (data: typeof transaksiHari) => {
    const masuk = data.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + Number(t.jumlah), 0)
    const keluar = data.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + Number(t.jumlah), 0)
    return { masuk, keluar, profit: masuk - keluar }
  }

  const hari = hitung(transaksiHari)
  const bulan = hitung(transaksiBulan)
  const semua = hitung(semuaTransaksi)

  const totalModal = semuaModal.reduce((s, m) => s + Number(m.jumlah), 0)
  const akumulasiProfit = semua.profit
  const progressModal = totalModal > 0
    ? Math.min((akumulasiProfit / totalModal) * 100, 100)
    : 0
  const sudahBalik = akumulasiProfit >= totalModal && totalModal > 0

  const kategoriLabel: Record<string, string> = {
    PENJUALAN: "Penjualan",
    BAHAN_BAKU: "Bahan Baku",
    OPERASIONAL: "Operasional",
    LAINNYA: "Lainnya",
  }

  const jamSekarang = sekarang.getHours()
  const sapa =
    jamSekarang < 11 ? "Selamat pagi" :
    jamSekarang < 15 ? "Selamat siang" :
    jamSekarang < 18 ? "Selamat sore" : "Selamat malam"

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          {sapa}, {session?.user?.nama}! 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {sekarang.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* Summary Cards Hari Ini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Masuk Hari Ini</p>
          <p className="text-xl font-bold text-green-600">{formatRupiah(hari.masuk)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Bulan ini: <span className="text-green-600">{formatRupiah(bulan.masuk)}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Keluar Hari Ini</p>
          <p className="text-xl font-bold text-red-500">{formatRupiah(hari.keluar)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Bulan ini: <span className="text-red-500">{formatRupiah(bulan.keluar)}</span>
          </p>
        </div>
        <div className={`rounded-2xl border p-5 ${
          hari.profit >= 0
            ? "bg-green-50 border-green-100"
            : "bg-red-50 border-red-100"
        }`}>
          <p className="text-xs text-gray-500 font-medium mb-1">Profit Hari Ini</p>
          <p className={`text-xl font-bold ${hari.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
            {formatRupiah(hari.profit)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Bulan ini: <span className={bulan.profit >= 0 ? "text-green-600" : "text-red-500"}>
              {formatRupiah(bulan.profit)}
            </span>
          </p>
        </div>
      </div>

      {/* Progress Balik Modal */}
      {totalModal > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-medium text-gray-700">Progress Balik Modal</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatRupiah(akumulasiProfit)} dari {formatRupiah(totalModal)}
              </p>
            </div>
            {sudahBalik ? (
              <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                ✅ Sudah Balik Modal!
              </span>
            ) : (
              <span className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                {progressModal.toFixed(1)}% tercapai
              </span>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                sudahBalik ? "bg-green-500" : "bg-orange-400"
              }`}
              style={{ width: `${progressModal}%` }}
            />
          </div>
          {!sudahBalik && (
            <p className="text-xs text-gray-400 mt-2">
              Butuh <span className="font-medium text-orange-500">
                {formatRupiah(totalModal - akumulasiProfit)}
              </span> lagi untuk balik modal
            </p>
          )}
        </div>
      )}

      {/* Transaksi Terbaru + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transaksi Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-700">Transaksi Terbaru</h2>
            <Link
              href="/dashboard/transaksi"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Lihat semua →
            </Link>
          </div>

          {transaksiTerbaru.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-gray-400 text-sm">Belum ada transaksi</p>
              <Link
                href="/dashboard/transaksi"
                className="text-xs text-orange-500 mt-2 inline-block"
              >
                Tambah transaksi pertama →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {transaksiTerbaru.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      t.jenis === "MASUK"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}>
                      {t.jenis === "MASUK" ? "↑" : "↓"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t.keterangan}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {kategoriLabel[t.kategori]}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(t.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${
                    t.jenis === "MASUK" ? "text-green-600" : "text-red-500"
                  }`}>
                    {t.jenis === "MASUK" ? "+" : "-"}{formatRupiah(Number(t.jumlah))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-medium text-gray-700 mb-3">Menu Cepat</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/transaksi"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition"
              >
                <span className="text-lg">💚</span>
                <div>
                  <p className="text-sm font-medium text-green-700">Catat Pemasukan</p>
                  <p className="text-xs text-green-500">Tambah uang masuk</p>
                </div>
              </Link>
              <Link
                href="/dashboard/transaksi"
                className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition"
              >
                <span className="text-lg">🔴</span>
                <div>
                  <p className="text-sm font-medium text-red-700">Catat Pengeluaran</p>
                  <p className="text-xs text-red-400">Tambah uang keluar</p>
                </div>
              </Link>
              <Link
                href="/dashboard/laporan"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
              >
                <span className="text-lg">📈</span>
                <div>
                  <p className="text-sm font-medium text-blue-700">Lihat Laporan</p>
                  <p className="text-xs text-blue-400">Grafik & analisis</p>
                </div>
              </Link>
              <Link
                href="/dashboard/modal"
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition"
              >
                <span className="text-lg">🏦</span>
                <div>
                  <p className="text-sm font-medium text-orange-700">Kelola Modal</p>
                  <p className="text-xs text-orange-400">Lihat investasi awal</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats kecil */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-medium text-gray-700 mb-3">Statistik</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Total transaksi</p>
                <p className="text-xs font-semibold text-gray-700">{semuaTransaksi.length}x</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Transaksi hari ini</p>
                <p className="text-xs font-semibold text-gray-700">{transaksiHari.length}x</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Total modal</p>
                <p className="text-xs font-semibold text-gray-700">{formatRupiah(totalModal)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Akumulasi profit</p>
                <p className={`text-xs font-semibold ${akumulasiProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {formatRupiah(akumulasiProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}