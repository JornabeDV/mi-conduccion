import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY, DEFAULT_TIMEZONE } from "@/shared/constants/app";

const SEED_EMAIL = "driver@example.com";
const SEED_PASSWORD = "password123";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });

  if (existing) {
    console.log(`✅ Usuario de prueba ya existe: ${SEED_EMAIL}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name: "Conductor de Prueba",
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
    },
  });

  const user = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });

  if (!user) {
    throw new Error("No se pudo crear el usuario de prueba");
  }

  await prisma.driverProfile.create({
    data: {
      userId: user.id,
      preferredCurrency: DEFAULT_CURRENCY,
      timezone: DEFAULT_TIMEZONE,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      brand: "Toyota",
      model: "Etios",
      year: 2020,
      licensePlate: "ABC123",
      currentKm: 50000,
      fuelType: "NAFTA",
      tankCapacity: 45,
    },
  });

  await prisma.driverProfile.update({
    where: { userId: user.id },
    data: { defaultVehicleId: vehicle.id },
  });

  console.log(`🌱 Seed completado: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
