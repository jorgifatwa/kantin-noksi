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

export default async function ProgressModal() {
  const session = await authHandler()

  const [semuaTransaksi, semuaModal] = await Promise.all([
    prisma.transaksi.findMany({ where: { userId: session?.user?.id } }),
    prisma.modal.findMany({ where: { userId: session?.user?.id } }),
  ])

  const totalModal = semuaModal.reduce((s, m) => s + Number(m.jumlah), 0)
  const totalMasuk = semuaTransaksi.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + Number(t.jumlah), 0)
  const totalKeluar = semuaTransaksi.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + Number(t.jumlah), 0)
  const akumulasiProfit = totalMasuk - totalKeluar
  const progress = totalModal > 0 ? Math.min((akumulasiProfit / totalModal) * 100, 100) : 0
  const sisaModal = Math.max(totalModal - akumulasiProfit, 0)
  const sudahBalik = akumulasiProfit >= totalModal

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-medium text-gray-700">Progress Balik Modal</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total modal: {formatRupiah(totalModal)}</p>
        </div>
        {sudahBalik ? (
          <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
            ✅ Sudah Balik Modal!
          </span>
        ) : (
          <span className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
            ⏳ Belum Balik Modal
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-4 mb-3">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            sudahBalik ? "bg-green-500" : "bg-orange-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>{progress.toFixed(1)}% tercapai</span>
        <span>{formatRupiah(akumulasiProfit)} dari {formatRupiah(totalModal)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-600 font-medium">Total Modal</p>
          <p className="text-sm font-semibold text-blue-700 mt-0.5">{formatRupiah(totalModal)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">Akumulasi Profit</p>
          <p className="text-sm font-semibold text-green-700 mt-0.5">{formatRupiah(akumulasiProfit)}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3">
          <p className="text-xs text-orange-600 font-medium">Sisa Modal</p>
          <p className="text-sm font-semibold text-orange-700 mt-0.5">{formatRupiah(sisaModal)}</p>
        </div>
      </div>
    </div>
  )
}