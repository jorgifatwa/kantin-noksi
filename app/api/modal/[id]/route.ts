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
    console.log("DELETE /api/modal/:id called", { id, params })
    console.log("cookie header (trunc):", String(req.headers.get("cookie") ?? "").slice(0, 200))
    const session = await authHandler()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pastikan modal milik user yang login
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const modal = await prisma.modal.findFirst({ where: { id, userId: session.user.id } })

    if (!modal) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }

    await prisma.modal.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/modal/:id error:", error)
    return NextResponse.json(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { error: "Gagal menghapus", details: String((error as any)?.message ?? error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/modal/:id called", { id: params.id })
    console.log("cookie header (trunc):", String(req.headers.get("cookie") ?? "").slice(0, 200))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await authHandler(new Request(req.url, { headers: req.headers }) as any)
    console.log("session from authHandler:", session?.user?.id ? { id: session.user.id, email: session.user.email } : session)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const modal = await prisma.modal.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!modal) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }

    const body = await req.json()
    const { nama, jumlah, jenisModal, keterangan, tanggal } = body

    const updated = await prisma.modal.update({
      where: { id: params.id },
      data: {
        nama,
        jumlah,
        jenisModal,
        keterangan: keterangan || null,
        tanggal: new Date(tanggal),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengupdate" }, { status: 500 })
  }
}