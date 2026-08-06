import { Router } from "express";
import { z } from "zod";
import {
  animalCreateSchema,
  ok,
  fail,
  paginationSchema,
} from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { cacheGet, cacheSet, cacheDel } from "../lib/redis";
import { slugify, writeAudit } from "../lib/helpers";
import { authenticate, requireRoles, AuthRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";

const router = Router();

const listQuery = paginationSchema.extend({
  species: z.enum(["GOAT", "SHEEP", "COW"]).optional(),
  farmId: z.string().optional(),
});

router.get("/", validateQuery(listQuery), async (req, res) => {
  const q = (req as typeof req & { validatedQuery: z.infer<typeof listQuery> })
    .validatedQuery;
  const cacheKey = `animals:${q.species || "all"}:${q.farmId || "all"}:${q.page}:${q.limit}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return res.json(cached);

  const where = {
    status: { in: ["LISTED" as const, "PARTIALLY_FUNDED" as const] },
    farm: { status: "APPROVED" as const },
    ...(q.species ? { species: q.species } : {}),
    ...(q.farmId ? { farmId: q.farmId } : {}),
  };
  const [total, animals] = await Promise.all([
    prisma.animal.count({ where }),
    prisma.animal.findMany({
      where,
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      orderBy: { createdAt: "desc" },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true, province: true },
        },
      },
    }),
  ]);
  const payload = ok(animals, { page: q.page, limit: q.limit, total });
  await cacheSet(cacheKey, payload, 30);
  return res.json(payload);
});

router.get("/:slug", async (req, res) => {
  const cacheKey = `animal:${req.params.slug}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return res.json(cached);

  const animal = await prisma.animal.findUnique({
    where: { slug: req.params.slug },
    include: {
      farm: true,
      updates: { orderBy: { createdAt: "desc" }, take: 10 },
      vaccinations: { orderBy: { administeredAt: "desc" }, take: 10 },
    },
  });
  if (!animal) return res.status(404).json(fail("NOT_FOUND", "Animal not found"));
  const payload = ok(animal);
  await cacheSet(cacheKey, payload, 45);
  return res.json(payload);
});

router.post(
  "/",
  authenticate,
  requireRoles("FARM_OWNER"),
  validateBody(animalCreateSchema),
  async (req: AuthRequest, res) => {
    const farm = await prisma.farm.findFirst({
      where: { id: req.body.farmId, ownerId: req.user!.sub },
    });
    if (!farm) return res.status(404).json(fail("NOT_FOUND", "Farm not found"));
    if (farm.status !== "APPROVED") {
      return res
        .status(400)
        .json(fail("FARM_NOT_VERIFIED", "Farm must be verified before listing"));
    }
    const totalShares = req.body.totalShares || 1;
    const animal = await prisma.animal.create({
      data: {
        farmId: farm.id,
        name: req.body.name,
        slug: slugify(req.body.name),
        species: req.body.species,
        breed: req.body.breed,
        ageMonths: req.body.ageMonths,
        weightKg: req.body.weightKg,
        pricePkr: req.body.pricePkr,
        sharePricePkr: req.body.sharePricePkr || req.body.pricePkr / totalShares,
        totalShares,
        availableShares: totalShares,
        expectedRoiPercent: req.body.expectedRoiPercent,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
      },
    });
    await writeAudit({
      actorId: req.user!.sub,
      action: "ANIMAL_CREATE",
      entityType: "Animal",
      entityId: animal.id,
    });
    await cacheDel("animals:*");
    return res.status(201).json(ok(animal));
  }
);

router.post(
  "/:id/updates",
  authenticate,
  requireRoles("FARM_OWNER"),
  async (req: AuthRequest, res) => {
    const animal = await prisma.animal.findUnique({
      where: { id: req.params.id },
      include: { farm: true },
    });
    if (!animal || animal.farm.ownerId !== req.user!.sub) {
      return res.status(404).json(fail("NOT_FOUND", "Animal not found"));
    }
    const { title, body, imageUrl, weightKg } = req.body;
    if (!title || !body) {
      return res.status(400).json(fail("VALIDATION_ERROR", "title and body required"));
    }
    const update = await prisma.animalUpdate.create({
      data: { animalId: animal.id, title, body, imageUrl, weightKg },
    });
    if (weightKg) {
      await prisma.animal.update({
        where: { id: animal.id },
        data: { weightKg },
      });
    }
    await cacheDel(`animal:${animal.slug}`);
    return res.status(201).json(ok(update));
  }
);

router.post(
  "/:id/vaccinations",
  authenticate,
  requireRoles("FARM_OWNER"),
  async (req: AuthRequest, res) => {
    const animal = await prisma.animal.findUnique({
      where: { id: req.params.id },
      include: { farm: true },
    });
    if (!animal || animal.farm.ownerId !== req.user!.sub) {
      return res.status(404).json(fail("NOT_FOUND", "Animal not found"));
    }
    const { vaccineName, administeredAt, nextDueAt, notes } = req.body;
    if (!vaccineName || !administeredAt) {
      return res
        .status(400)
        .json(fail("VALIDATION_ERROR", "vaccineName and administeredAt required"));
    }
    const vaccination = await prisma.vaccination.create({
      data: {
        animalId: animal.id,
        vaccineName,
        administeredAt: new Date(administeredAt),
        nextDueAt: nextDueAt ? new Date(nextDueAt) : undefined,
        notes,
      },
    });
    return res.status(201).json(ok(vaccination));
  }
);

export default router;
