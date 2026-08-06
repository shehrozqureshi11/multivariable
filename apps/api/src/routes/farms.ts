import { Router } from "express";
import { farmCreateSchema, ok, fail, paginationSchema } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { cacheGet, cacheSet, cacheDel } from "../lib/redis";
import { notify, slugify, writeAudit } from "../lib/helpers";
import { authenticate, requireRoles, AuthRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";

const router = Router();

router.get(
  "/me/mine",
  authenticate,
  requireRoles("FARM_OWNER"),
  async (req: AuthRequest, res) => {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.sub },
      include: {
        animals: true,
        expenses: { take: 20, orderBy: { incurredAt: "desc" } },
        _count: { select: { animals: true } },
      },
    });
    return res.json(ok(farm));
  }
);

router.get("/", validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = (req as typeof req & { validatedQuery: { page: number; limit: number } })
    .validatedQuery;
  const status = (req.query.status as string) || "APPROVED";
  const cacheKey = `farms:${status}:${page}:${limit}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return res.json(cached);

  const where = { status: status as "APPROVED" | "PENDING" | "REJECTED" };
  const [total, farms] = await Promise.all([
    prisma.farm.count({ where }),
    prisma.farm.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { fullName: true } },
        _count: { select: { animals: true, reviews: true } },
      },
    }),
  ]);
  const payload = ok(farms, { page, limit, total });
  await cacheSet(cacheKey, payload, 45);
  return res.json(payload);
});

router.get("/:slug", async (req, res) => {
  const cacheKey = `farm:${req.params.slug}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return res.json(cached);

  const farm = await prisma.farm.findUnique({
    where: { slug: req.params.slug },
    include: {
      owner: { select: { fullName: true, phone: true } },
      animals: {
        where: { status: { in: ["LISTED", "PARTIALLY_FUNDED"] } },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true } } },
      },
    },
  });
  if (!farm) return res.status(404).json(fail("NOT_FOUND", "Farm not found"));
  const payload = ok(farm);
  await cacheSet(cacheKey, payload, 60);
  return res.json(payload);
});

router.post(
  "/",
  authenticate,
  requireRoles("FARM_OWNER"),
  validateBody(farmCreateSchema),
  async (req: AuthRequest, res) => {
    const existing = await prisma.farm.findUnique({
      where: { ownerId: req.user!.sub },
    });
    if (existing) {
      return res.status(409).json(fail("FARM_EXISTS", "You already have a farm profile"));
    }
    const farm = await prisma.farm.create({
      data: {
        ...req.body,
        ownerId: req.user!.sub,
        slug: slugify(req.body.name),
      },
    });
    await writeAudit({
      actorId: req.user!.sub,
      action: "FARM_CREATE",
      entityType: "Farm",
      entityId: farm.id,
      ip: req.ip,
    });
    await cacheDel("farms:*");
    return res.status(201).json(ok(farm));
  }
);

router.patch(
  "/:id",
  authenticate,
  requireRoles("FARM_OWNER", "ADMIN"),
  async (req: AuthRequest, res) => {
    const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
    if (!farm) return res.status(404).json(fail("NOT_FOUND", "Farm not found"));
    if (req.user!.role === "FARM_OWNER" && farm.ownerId !== req.user!.sub) {
      return res.status(403).json(fail("FORBIDDEN", "Not your farm"));
    }
    const { name, description, location, city, province, capacity, imageUrl } =
      req.body;
    const updated = await prisma.farm.update({
      where: { id: farm.id },
      data: { name, description, location, city, province, capacity, imageUrl },
    });
    await cacheDel("farms:*");
    await cacheDel(`farm:${farm.slug}`);
    return res.json(ok(updated));
  }
);

export default router;
