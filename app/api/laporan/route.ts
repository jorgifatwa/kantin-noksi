import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const periode = searchParams.get("periode") // harian, minggu, bulan, tahun
    const bulan = searchParams.get("bulan")
    const tahun = searchParams.get("tahun") ?? new Date().getFullYear().toString()

    const userId = session.user.id

    // ===== SUMMARY CARDS =====
    const sekarang = new Date()
    const startHari = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate())
    const startBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)
    const startTahun = new Date(sekarang.getFullYear(), 0, 1)

    const [transaksiHari, transaksiBulan, transaksiTahun, semuaTransaksi, totalModal] =
      await Promise.all([
        prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startHari } } }),
        prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startBulan } } }),
        prisma.transaksi.findMany({ where: { userId, tanggal: { gte: startTahun } } }),
        prisma.transaksi.findMany({ where: { userId } }),
        prisma.modal.findMany({ where: { userId } }),
      ])

    const hitung = (data: typeof transaksiHari) => {
      const masuk = data.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + Number(t.jumlah), 0)
      const keluar = data.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + Number(t.jumlah), 0)
      return { masuk, keluar, profit: masuk - keluar }
    }

    const summary = {
      hari: hitung(transaksiHari),
      bulan: hitung(transaksiBulan),
      tahun: hitung(transaksiTahun),
    }

    const totalModalNominal = totalModal.reduce((s, m) => s + Number(m.jumlah), 0)
    const akumulasiProfit = hitung(semuaTransaksi).profit
    const progressModal = totalModalNominal > 0
      ? Math.min((akumulasiProfit / totalModalNominal) * 100, 100)
      : 0

    // ===== GRAFIK PER MINGGU (filter by bulan) =====
    if (periode === "minggu" && bulan) {
      const thn = parseInt(tahun)
      const bln = parseInt(bulan)
      const start = new Date(thn, bln - 1, 1)
      const end = new Date(thn, bln, 0, 23, 59, 59)

      const data = await prisma.transaksi.findMany({
        where: { userId, tanggal: { gte: start, lte: end } },
        orderBy: { tanggal: "asc" },
      })

      // Kelompokkan per minggu
      const mingguMap: Record<string, { masuk: number; keluar: number; label: string }> = {}

      data.forEach((t) => {
        const tgl = new Date(t.tanggal)
        const hariDalamBulan = tgl.getDate()
        const mingguKe = Math.ceil(hariDalamBulan / 7)
        const key = `Minggu ${mingguKe}`

        if (!mingguMap[key]) {
          mingguMap[key] = { masuk: 0, keluar: 0, label: key }
        }

        if (t.jenis === "MASUK") mingguMap[key].masuk += Number(t.jumlah)
        else mingguMap[key].keluar += Number(t.jumlah)
      })

      const grafikMinggu = Object.values(mingguMap).map((m) => ({
        ...m,
        profit: m.masuk - m.keluar,
      }))

      return NextResponse.json({ summary, progressModal, totalModal: totalModalNominal, akumulasiProfit, grafikMinggu })
    }

    // ===== GRAFIK PER BULAN =====
    if (periode === "bulan") {
      const thn = parseInt(tahun)
      const start = new Date(thn, 0, 1)
      const end = new Date(thn, 11, 31, 23, 59, 59)

      const data = await prisma.transaksi.findMany({
        where: { userId, tanggal: { gte: start, lte: end } },
        orderBy: { tanggal: "asc" },
      })

      const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
      const bulanMap: Record<number, { masuk: number; keluar: number; label: string }> = {}

      for (let i = 0; i < 12; i++) {
        bulanMap[i] = { masuk: 0, keluar: 0, label: namaBulan[i] }
      }

      data.forEach((t) => {
        const bln = new Date(t.tanggal).getMonth()
        if (t.jenis === "MASUK") bulanMap[bln].masuk += Number(t.jumlah)
        else bulanMap[bln].keluar += Number(t.jumlah)
      })

      const grafikBulan = Object.values(bulanMap).map((b) => ({
        ...b,
        profit: b.masuk - b.keluar,
      }))

      return NextResponse.json({ summary, progressModal, totalModal: totalModalNominal, akumulasiProfit, grafikBulan })
    }

    // ===== GRAFIK PER TAHUN =====
    if (periode === "tahun") {
      const data = await prisma.transaksi.findMany({
        where: { userId },
        orderBy: { tanggal: "asc" },
      })

      const tahunMap: Record<number, { masuk: number; keluar: number; label: string }> = {}

      data.forEach((t) => {
        const thn = new Date(t.tanggal).getFullYear()
        if (!tahunMap[thn]) tahunMap[thn] = { masuk: 0, keluar: 0, label: String(thn) }
        if (t.jenis === "MASUK") tahunMap[thn].masuk += Number(t.jumlah)
        else tahunMap[thn].keluar += Number(t.jumlah)
      })

      const grafikTahun = Object.values(tahunMap).map((t) => ({
        ...t,
        profit: t.masuk - t.keluar,
      }))

      return NextResponse.json({ summary, progressModal, totalModal: totalModalNominal, akumulasiProfit, grafikTahun })
    }

    return NextResponse.json({ summary, progressModal, totalModal: totalModalNominal, akumulasiProfit })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}