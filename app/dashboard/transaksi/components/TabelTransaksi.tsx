import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"
import TombolHapus from "./TombolHapus"

const prisma = new PrismaClient()

const kategoriLabel: Record<string, string> = {
  PENJUALAN: "Penjualan",
  BAHAN_BAKU: "Bahan Baku",
  OPERASIONAL: "Operasional",
  LAINNYA: "Lainnya",
}

const kategoriColor: Record<string, string> = {
  PENJUALAN: "bg-green-50 text-green-600",
  BAHAN_BAKU: "bg-orange-50 text-orange-600",
  OPERASIONAL: "bg-blue-50 text-blue-600",
  LAINNYA: "bg-gray-50 text-gray-500",
}

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

export default async function TabelTransaksi() {
  const session = await authHandler()

  const transaksi = await prisma.transaksi.findMany({
    where: { userId: session?.user?.id },
    orderBy: { tanggal: "desc" },
    take: 50,
  })

  const totalMasuk = transaksi
    .filter((t) => t.jenis === "MASUK")
    .reduce((sum, t) => sum + Number(t.jumlah), 0)

  const totalKeluar = transaksi
    .filter((t) => t.jenis === "KELUAR")
    .reduce((sum, t) => sum + Number(t.jumlah), 0)

  const profit = totalMasuk - totalKeluar

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">Total Masuk</p>
          <p className="text-sm font-semibold text-green-700 mt-0.5">{formatRupiah(totalMasuk)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-xs text-red-600 font-medium">Total Keluar</p>
          <p className="text-sm font-semibold text-red-700 mt-0.5">{formatRupiah(totalKeluar)}</p>
        </div>
        <div className={`rounded-xl p-3 ${profit >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
          <p className={`text-xs font-medium ${profit >= 0 ? "text-blue-600" : "text-orange-600"}`}>Profit</p>
          <p className={`text-sm font-semibold mt-0.5 ${profit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {formatRupiah(profit)}
          </p>
        </div>
      </div>

      <h2 className="font-medium text-gray-700">Riwayat Transaksi</h2>

      {transaksi.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-gray-400 text-sm">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transaksi.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  t.jenis === "MASUK" ? "bg-green-100" : "bg-red-100"
                }`}>
                  {t.jenis === "MASUK" ? "↑" : "↓"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t.keterangan}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kategoriColor[t.kategori]}`}>
                      {kategoriLabel[t.kategori]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${
                  t.jenis === "MASUK" ? "text-green-600" : "text-red-600"
                }`}>
                  {t.jenis === "MASUK" ? "+" : "-"}{formatRupiah(Number(t.jumlah))}
                </p>
                <TombolHapus id={t.id} />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}