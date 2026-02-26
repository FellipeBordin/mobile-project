-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('IN_STOCK', 'SOLD');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'IN_STOCK',
    "purchasePrice" DECIMAL(65,30) NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "soldPrice" DECIMAL(65,30),
    "soldDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_createdAt_idx" ON "Vehicle"("createdAt");

-- CreateIndex
CREATE INDEX "Expense_vehicleId_idx" ON "Expense"("vehicleId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
