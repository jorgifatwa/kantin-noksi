import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"
import TombolHapus from "./TombolHapus"

const prisma = new PrismaClient()

const jenisLabel: Record<string, string> = {
  PERALATAN: "Peralatan",
  BAHAN_BAKU: "Bahan Baku",
  LAINNYA: "Lainnya",
}

const jenisColor: Record<string, string> = {
  PERALATAN: "bg-blue-50 text-blue-600",
  BAHAN_BAKU: "bg-green-50 text-green-600",
  LAINNYA: "bg-gray-50 text-gray-600",
}

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka)
}

export default async function TabelModal() {
  const session = await authHandler()

  const modals = await prisma.modal.findMany({
    where: { userId: session?.user?.id },
    orderBy: { tanggal: "desc" },
  })

  const total = modals.reduce((sum, m) => sum + Number(m.jumlah), 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-gray-700">Riwayat Modal</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Modal</p>
          <p className="text-base font-semibold text-orange-500">{formatRupiah(total)}</p>
        </div>
      </div>

      {modals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🏦</p>
          <p className="text-gray-400 text-sm">Belum ada modal yang dicatat</p>
        </div>
      ) : (
        <div className="space-y-2">
          {modals.map((modal) => (
            <div
              key={modal.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{modal.nama}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${jenisColor[modal.jenisModal]}`}>
                      {jenisLabel[modal.jenisModal]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(modal.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {modal.keterangan && (
                    <p className="text-xs text-gray-400 mt-0.5">{modal.keterangan}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  {formatRupiah(Number(modal.jumlah))}
                </p>
                <TombolHapus id={modal.id} nama={modal.nama} />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}