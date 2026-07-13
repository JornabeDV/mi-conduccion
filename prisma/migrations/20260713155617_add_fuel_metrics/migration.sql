-- AlterTable
ALTER TABLE "fuel_logs" ADD COLUMN     "consumption_l_per_100km" DECIMAL(10,2),
ADD COLUMN     "cost_per_km" DECIMAL(12,4),
ADD COLUMN     "efficiency_km_per_l" DECIMAL(10,2),
ADD COLUMN     "estimated_range_km" DECIMAL(10,2),
ADD COLUMN     "full_tank" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT;
