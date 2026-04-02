// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "owner@kantin.com" },
    update: {},
    create: {
      nama: "Owner Kantin",
      email: "owner@kantin.com",
      password: hashedPassword,
      role: "OWNER",
    },
  })

  console.log("✅ Seed berhasil! Login dengan owner@kantin.com / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())