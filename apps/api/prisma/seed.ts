import { PrismaClient, AnimalSpecies, UserRole, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.animalUpdate.deleteMany();
  await prisma.profitDistribution.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.kycProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@herdshare.pk",
      passwordHash,
      fullName: "Platform Admin",
      role: UserRole.ADMIN,
      phone: "+923001111111",
      wallet: { create: { balancePkr: 0 } },
    },
  });

  const investor = await prisma.user.create({
    data: {
      email: "investor@herdshare.pk",
      passwordHash,
      fullName: "Ayesha Khan",
      role: UserRole.INVESTOR,
      phone: "+923002222222",
      wallet: { create: { balancePkr: 500000 } },
      kyc: {
        create: {
          cnicNumber: "35202-1234567-1",
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      },
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: "farm@herdshare.pk",
      passwordHash,
      fullName: "Imran Malik",
      role: UserRole.FARM_OWNER,
      phone: "+923003333333",
      wallet: { create: { balancePkr: 25000 } },
      kyc: {
        create: {
          cnicNumber: "35202-7654321-1",
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      },
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "punjab.farms@herdshare.pk",
      passwordHash,
      fullName: "Sara Ahmed",
      role: UserRole.FARM_OWNER,
      phone: "+923004444444",
      wallet: { create: { balancePkr: 10000 } },
      kyc: {
        create: {
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      },
    },
  });

  /** Green Pastures: 3 goats + 2 cows + sheep */
  const farm1 = await prisma.farm.create({
    data: {
      ownerId: owner1.id,
      name: "Green Pastures Farm",
      slug: "green-pastures-farm",
      description:
        "Family-run livestock farm in Kasur with transparent care logs and Shariah-aligned profit sharing.",
      location: "Kasur Road, Near Balloki",
      city: "Kasur",
      province: "Punjab",
      capacity: 200,
      imageUrl: "/images/farms/green-pastures.jpg",
      status: VerificationStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

  /** Indus Valley: 3 cows + 2 goats + sheep */
  const farm2 = await prisma.farm.create({
    data: {
      ownerId: owner2.id,
      name: "Indus Valley Livestock",
      slug: "indus-valley-livestock",
      description:
        "Verified cattle and goat farm near Multan specializing in healthy Beetal goats and Sahiwal cows.",
      location: "Bosan Road",
      city: "Multan",
      province: "Punjab",
      capacity: 150,
      imageUrl: "/images/farms/indus-valley.jpg",
      status: VerificationStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

  const animals = [
    // Green Pastures — 3 goats, 2 cows, sheep
    {
      farmId: farm1.id,
      name: "Beetal Buck — Noor",
      species: AnimalSpecies.GOAT,
      breed: "Beetal",
      ageMonths: 18,
      weightKg: 55,
      pricePkr: 85000,
      sharePricePkr: 85000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 22,
      description: "Healthy Beetal buck ready for fattening cycle.",
      imageUrl: "/images/animals/goat-6.jpg",
    },
    {
      farmId: farm1.id,
      name: "Teddy Doe — Chameli",
      species: AnimalSpecies.GOAT,
      breed: "Teddy",
      ageMonths: 12,
      weightKg: 28,
      pricePkr: 48000,
      sharePricePkr: 48000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 20,
      description: "Young Teddy doe under supervised farm care.",
      imageUrl: "/images/animals/goat-1.jpg",
    },
    {
      farmId: farm1.id,
      name: "Kamori Doe — Gul",
      species: AnimalSpecies.GOAT,
      breed: "Kamori",
      ageMonths: 16,
      weightKg: 42,
      pricePkr: 72000,
      sharePricePkr: 72000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 19,
      description: "Kamori doe with strong milk potential.",
      imageUrl: "/images/animals/goat-2.jpg",
    },
    {
      farmId: farm1.id,
      name: "Sahiwal Heifer — Rani",
      species: AnimalSpecies.COW,
      breed: "Sahiwal",
      ageMonths: 22,
      weightKg: 260,
      pricePkr: 260000,
      sharePricePkr: 65000,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 16,
      description: "Sahiwal heifer listed in share units.",
      imageUrl: "/images/animals/cow-6.jpg",
    },
    {
      farmId: farm1.id,
      name: "Cholistani Cow — Moti",
      species: AnimalSpecies.COW,
      breed: "Cholistani",
      ageMonths: 30,
      weightKg: 320,
      pricePkr: 310000,
      sharePricePkr: 77500,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 15,
      description: "Hardy Cholistani cow for shared ownership.",
      imageUrl: "/images/animals/cow-2.jpg",
    },
    {
      farmId: farm1.id,
      name: "Kajli Ewe Pair",
      species: AnimalSpecies.SHEEP,
      breed: "Kajli",
      ageMonths: 14,
      weightKg: 40,
      pricePkr: 120000,
      sharePricePkr: 60000,
      totalShares: 2,
      availableShares: 2,
      expectedRoiPercent: 18,
      description: "Two Kajli ewes offered as half-shares.",
      imageUrl: "/images/animals/sheep-1.jpg",
    },
    {
      farmId: farm1.id,
      name: "Lohi Ram — Sher",
      species: AnimalSpecies.SHEEP,
      breed: "Lohi",
      ageMonths: 15,
      weightKg: 48,
      pricePkr: 95000,
      sharePricePkr: 95000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 17,
      description: "Prime Lohi ram for breeding cycle.",
      imageUrl: "/images/animals/sheep-2.jpg",
    },

    // Indus Valley — 3 cows, 2 goats, sheep
    {
      farmId: farm2.id,
      name: "Red Sindhi Cow — Laila",
      species: AnimalSpecies.COW,
      breed: "Red Sindhi",
      ageMonths: 28,
      weightKg: 300,
      pricePkr: 290000,
      sharePricePkr: 72500,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 16,
      description: "Red Sindhi dairy cow with share model.",
      imageUrl: "/images/animals/cow-1.jpg",
    },
    {
      farmId: farm2.id,
      name: "Dhanni Bullock — Badshah",
      species: AnimalSpecies.COW,
      breed: "Dhanni",
      ageMonths: 26,
      weightKg: 340,
      pricePkr: 330000,
      sharePricePkr: 82500,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 14,
      description: "Strong Dhanni bullock for fattening.",
      imageUrl: "/images/animals/cow-3.jpg",
    },
    {
      farmId: farm2.id,
      name: "Jersey Cross — Meena",
      species: AnimalSpecies.COW,
      breed: "Jersey Cross",
      ageMonths: 24,
      weightKg: 270,
      pricePkr: 275000,
      sharePricePkr: 68750,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 15,
      description: "Jersey-cross heifer suited for milk yield.",
      imageUrl: "/images/animals/cow-5.jpg",
    },
    {
      farmId: farm2.id,
      name: "Beetal Doe — Sohni",
      species: AnimalSpecies.GOAT,
      breed: "Beetal",
      ageMonths: 14,
      weightKg: 38,
      pricePkr: 62000,
      sharePricePkr: 62000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 21,
      description: "Beetal doe from Multan paddock.",
      imageUrl: "/images/animals/goat-3.jpg",
    },
    {
      farmId: farm2.id,
      name: "Barbari Buck — Jazba",
      species: AnimalSpecies.GOAT,
      breed: "Barbari",
      ageMonths: 11,
      weightKg: 32,
      pricePkr: 52000,
      sharePricePkr: 52000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 20,
      description: "Barbari buck ready for market cycle.",
      imageUrl: "/images/animals/goat-4.jpg",
    },
    {
      farmId: farm2.id,
      name: "Kajli Flock Share",
      species: AnimalSpecies.SHEEP,
      breed: "Kajli",
      ageMonths: 13,
      weightKg: 36,
      pricePkr: 110000,
      sharePricePkr: 55000,
      totalShares: 2,
      availableShares: 2,
      expectedRoiPercent: 18,
      description: "Kajli sheep share from Indus Valley.",
      imageUrl: "/images/animals/sheep-2.jpg",
    },
    {
      farmId: farm2.id,
      name: "Salt Range Ewe",
      species: AnimalSpecies.SHEEP,
      breed: "Salt Range",
      ageMonths: 12,
      weightKg: 34,
      pricePkr: 70000,
      sharePricePkr: 70000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 17,
      description: "Salt Range ewe with care tracking enabled.",
      imageUrl: "/images/animals/sheep-1.jpg",
    },
  ];

  for (const a of animals) {
    await prisma.animal.create({
      data: {
        ...a,
        slug: slugify(a.name),
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: investor.id,
        title: "Welcome to HerdShare",
        body: "Your account is ready. Explore verified livestock investments.",
        type: "SYSTEM",
      },
      {
        userId: owner1.id,
        title: "Farm verified",
        body: "Green Pastures Farm is now live on the marketplace.",
        type: "FARM",
      },
      {
        userId: admin.id,
        title: "Seed complete",
        body: `Demo data loaded: ${animals.length} animals across 2 farms.`,
        type: "SYSTEM",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_DATABASE",
      entityType: "System",
      metadata: { farms: 2, animals: animals.length },
    },
  });

  console.log("Seeded HerdShare demo users:");
  console.log("  admin@herdshare.pk / Password123!");
  console.log("  investor@herdshare.pk / Password123!");
  console.log("  farm@herdshare.pk / Password123!");
  console.log(`Animals: ${animals.length} (Green Pastures goats-heavy, Indus Valley cows-heavy)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
