-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'KASIR');

-- CreateEnum
CREATE TYPE "JenisModal" AS ENUM ('PERALATAN', 'BAHAN_BAKU', 'LAINNYA');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('PENJUALAN', 'BAHAN_BAKU', 'OPERASIONAL', 'LAINNYA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modal" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "jenisModal" "JenisModal" NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Modal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "jenis" "JenisTransaksi" NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Modal" ADD CONSTRAINT "Modal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
