import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authHandler } from "@/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { nama, jumlah, jenisModal, keterangan, tanggal } = body

    const modal = await prisma.modal.create({
      data: {
        nama,
        jumlah,
        jenisModal,
        keterangan: keterangan || null,
        tanggal: new Date(tanggal),
        userId: session.user.id,
      },
    })

    return NextResponse.json(modal, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const modals = await prisma.modal.findMany({
      where: { userId: session.user.id },
      orderBy: { tanggal: "desc" },
    })

    return NextResponse.json(modals)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}