import { PrismaClient, AnimalSpecies, UserRole, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
      imageUrl:
        "https://images.unsplash.com/photo-1500595046743-cd271d694ee0?w=1200&q=80",
      status: VerificationStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

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
      imageUrl:
        "https://images.unsplash.com/photo-1516467508483-aeea2acf7045?w=1200&q=80",
      status: VerificationStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

  const animals = [
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
      imageUrl:
        "https://images.unsplash.com/photo-1533416754864-b4cf77745d1b?w=800&q=80",
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
      imageUrl:
        "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&q=80",
    },
    {
      farmId: farm2.id,
      name: "Sahiwal Heifer — Rani",
      species: AnimalSpecies.COW,
      breed: "Sahiwal",
      ageMonths: 24,
      weightKg: 280,
      pricePkr: 280000,
      sharePricePkr: 70000,
      totalShares: 4,
      availableShares: 4,
      expectedRoiPercent: 16,
      description: "Prime Sahiwal heifer with shared ownership model.",
      imageUrl:
        "https://images.unsplash.com/photo-1570042225831-d98fa800d222?w=800&q=80",
    },
    {
      farmId: farm2.id,
      name: "Teddy Goat — Chameli",
      species: AnimalSpecies.GOAT,
      breed: "Teddy",
      ageMonths: 10,
      weightKg: 28,
      pricePkr: 45000,
      sharePricePkr: 45000,
      totalShares: 1,
      availableShares: 1,
      expectedRoiPercent: 20,
      description: "Young Teddy goat under supervised farm care.",
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&q=80",
    },
  ];

  for (const a of animals) {
    await prisma.animal.create({
      data: {
        ...a,
        slug: slugify(`${a.name}-${Date.now().toString(36)}`),
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
        body: "Demo data loaded successfully.",
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
