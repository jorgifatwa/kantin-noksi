import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"

const prisma = new PrismaClient()

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // derive id from params or fallback to parsing the URL
    const idFromParams = params?.id
    const idFromUrl = new URL(req.url).pathname.split("/").pop()
    const id = idFromParams ?? idFromUrl
    console.log("DELETE /api/transaksi/:id called", { id, params })
    console.log("cookie header (trunc):", String(req.headers.get("cookie") ?? "").slice(0, 200))
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pastikan transaksi milik user yang login
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const transaksi = await prisma.transaksi.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!transaksi) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }

    await prisma.transaksi.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // derive id from params or fallback to parsing the URL
    const idFromParams = params?.id
    const idFromUrl = new URL(req.url).pathname.split("/").pop()
    const id = idFromParams ?? idFromUrl
    console.log("PUT /api/transaksi/:id called", { id, params })
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pastikan transaksi milik user yang login
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const transaksi = await prisma.transaksi.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!transaksi) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }

    const body = await req.json()
    const { tanggal, keterangan, jumlah, jenis, kategori } = body

    const updated = await prisma.transaksi.update({
      where: { id },
      data: {
        tanggal: new Date(tanggal),
        keterangan,
        jumlah,
        jenis,
        kategori,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengupdate" }, { status: 500 })
  }
}