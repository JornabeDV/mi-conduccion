/*
  Warnings:

  - You are about to drop the column `payment_method` on the `shift_incomes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cash_counts" ADD COLUMN     "app_amount" DECIMAL(12,2),
ADD COLUMN     "transfer_amount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "driver_profiles" ADD COLUMN     "wallet_account_owner" TEXT,
ADD COLUMN     "wallet_identifier" TEXT,
ADD COLUMN     "wallet_provider" TEXT;

-- AlterTable
ALTER TABLE "shift_incomes" DROP COLUMN "payment_method";

-- DropEnum
DROP TYPE "PaymentMethod";
