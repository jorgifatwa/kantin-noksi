import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { tanggal, keterangan, jumlah, jenis, kategori } = body

    const transaksi = await prisma.transaksi.create({
      data: {
        tanggal: new Date(tanggal),
        keterangan,
        jumlah,
        jenis,
        kategori,
        userId: session.user.id,
      },
    })

    return NextResponse.json(transaksi, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bulan = searchParams.get("bulan")
    const tahun = searchParams.get("tahun")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: session.user.id }

    if (bulan && tahun) {
      const start = new Date(parseInt(tahun), parseInt(bulan) - 1, 1)
      const end = new Date(parseInt(tahun), parseInt(bulan), 0, 23, 59, 59)
      where.tanggal = { gte: start, lte: end }
    }

    const transaksi = await prisma.transaksi.findMany({
      where,
      orderBy: { tanggal: "desc" },
    })

    return NextResponse.json(transaksi)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}