import { ok } from "@herdshare/shared";

/** In-memory catalog for when DATABASE_URL is missing or Postgres is down. */
export const DEMO_FARMS = [
  {
    id: "demo-farm-1",
    name: "Green Pastures Farm",
    slug: "green-pastures-farm",
    description:
      "Family-run livestock farm in Kasur with transparent care logs and Shariah-aligned profit sharing.",
    location: "Kasur Road, Near Balloki",
    city: "Kasur",
    province: "Punjab",
    capacity: 200,
    imageUrl: "/images/farms/green-pastures.jpg",
    status: "APPROVED",
    owner: { fullName: "Imran Malik" },
    _count: { animals: 6, reviews: 0 },
  },
  {
    id: "demo-farm-2",
    name: "Indus Valley Livestock",
    slug: "indus-valley-livestock",
    description:
      "Verified cattle and goat farm near Multan specializing in healthy Beetal goats and Sahiwal cows.",
    location: "Bosan Road",
    city: "Multan",
    province: "Punjab",
    capacity: 150,
    imageUrl: "/images/farms/indus-valley.jpg",
    status: "APPROVED",
    owner: { fullName: "Sara Ahmed" },
    _count: { animals: 4, reviews: 0 },
  },
];

export const DEMO_ANIMALS = [
  {
    id: "demo-goat-1",
    name: "Beetal Buck — Noor",
    slug: "beetal-buck-noor",
    species: "GOAT",
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
    status: "LISTED",
    farmId: "demo-farm-1",
    farm: {
      id: "demo-farm-1",
      name: "Green Pastures Farm",
      slug: "green-pastures-farm",
      city: "Kasur",
      province: "Punjab",
    },
  },
  {
    id: "demo-goat-2",
    name: "Teddy Doe — Chameli",
    slug: "teddy-doe-chameli",
    species: "GOAT",
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
    status: "LISTED",
    farmId: "demo-farm-1",
    farm: {
      id: "demo-farm-1",
      name: "Green Pastures Farm",
      slug: "green-pastures-farm",
      city: "Kasur",
      province: "Punjab",
    },
  },
  {
    id: "demo-cow-1",
    name: "Sahiwal Heifer — Rani",
    slug: "sahiwal-heifer-rani",
    species: "COW",
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
    status: "LISTED",
    farmId: "demo-farm-1",
    farm: {
      id: "demo-farm-1",
      name: "Green Pastures Farm",
      slug: "green-pastures-farm",
      city: "Kasur",
      province: "Punjab",
    },
  },
  {
    id: "demo-sheep-1",
    name: "Kajli Sheep — Sitara",
    slug: "kajli-sheep-sitara",
    species: "SHEEP",
    breed: "Kajli",
    ageMonths: 14,
    weightKg: 45,
    pricePkr: 52000,
    sharePricePkr: 52000,
    totalShares: 1,
    availableShares: 1,
    expectedRoiPercent: 18,
    description: "Kajli sheep from Green Pastures herd.",
    imageUrl: "/images/animals/sheep-1.jpg",
    status: "LISTED",
    farmId: "demo-farm-1",
    farm: {
      id: "demo-farm-1",
      name: "Green Pastures Farm",
      slug: "green-pastures-farm",
      city: "Kasur",
      province: "Punjab",
    },
  },
  {
    id: "demo-cow-3",
    name: "Sahiwal Cow — Laila",
    slug: "sahiwal-cow-laila",
    species: "COW",
    breed: "Sahiwal",
    ageMonths: 36,
    weightKg: 380,
    pricePkr: 420000,
    sharePricePkr: 84000,
    totalShares: 5,
    availableShares: 5,
    expectedRoiPercent: 14,
    description: "Dairy Sahiwal cow from Indus Valley.",
    imageUrl: "/images/animals/cow-2.jpg",
    status: "LISTED",
    farmId: "demo-farm-2",
    farm: {
      id: "demo-farm-2",
      name: "Indus Valley Livestock",
      slug: "indus-valley-livestock",
      city: "Multan",
      province: "Punjab",
    },
  },
  {
    id: "demo-goat-4",
    name: "Beetal Doe — Roshni",
    slug: "beetal-doe-roshni",
    species: "GOAT",
    breed: "Beetal",
    ageMonths: 15,
    weightKg: 38,
    pricePkr: 62000,
    sharePricePkr: 62000,
    totalShares: 1,
    availableShares: 1,
    expectedRoiPercent: 21,
    description: "Beetal doe from Multan farm stock.",
    imageUrl: "/images/animals/goat-3.jpg",
    status: "LISTED",
    farmId: "demo-farm-2",
    farm: {
      id: "demo-farm-2",
      name: "Indus Valley Livestock",
      slug: "indus-valley-livestock",
      city: "Multan",
      province: "Punjab",
    },
  },
];

export function listDemoAnimals(opts: {
  species?: string;
  farmId?: string;
  page: number;
  limit: number;
}) {
  let rows = [...DEMO_ANIMALS];
  if (opts.species) rows = rows.filter((a) => a.species === opts.species);
  if (opts.farmId) rows = rows.filter((a) => a.farmId === opts.farmId);
  const total = rows.length;
  const start = (opts.page - 1) * opts.limit;
  const data = rows.slice(start, start + opts.limit);
  return ok(data, { page: opts.page, limit: opts.limit, total });
}

export function getDemoAnimalBySlug(slug: string) {
  const animal = DEMO_ANIMALS.find((a) => a.slug === slug);
  if (!animal) return null;
  return {
    ...animal,
    updates: [],
    vaccinations: [],
    farm: DEMO_FARMS.find((f) => f.id === animal.farmId) || animal.farm,
  };
}

export function listDemoFarms(page: number, limit: number) {
  const total = DEMO_FARMS.length;
  const start = (page - 1) * limit;
  const data = DEMO_FARMS.slice(start, start + limit);
  return ok(data, { page, limit, total });
}

export function getDemoFarmBySlug(slug: string) {
  const farm = DEMO_FARMS.find((f) => f.slug === slug);
  if (!farm) return null;
  return {
    ...farm,
    animals: DEMO_ANIMALS.filter((a) => a.farmId === farm.id),
    reviews: [],
  };
}
