-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'APP');

-- CreateEnum
CREATE TYPE "CashCountType" AS ENUM ('OPEN', 'CLOSE');

-- AlterTable
ALTER TABLE "shift_incomes" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- CreateTable
CREATE TABLE "cash_counts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "type" "CashCountType" NOT NULL,
    "date" DATE NOT NULL,
    "denominations" JSONB NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "extra_amount" DECIMAL(12,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cash_counts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_counts_userId_date_idx" ON "cash_counts"("userId", "date");

-- CreateIndex
CREATE INDEX "cash_counts_shift_id_idx" ON "cash_counts"("shift_id");

-- CreateIndex
CREATE INDEX "cash_counts_deleted_at_idx" ON "cash_counts"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "cash_counts_shift_id_type_key" ON "cash_counts"("shift_id", "type");

-- AddForeignKey
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "work_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
