import { Router } from "express";
import { ok } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/mine", authenticate, async (req: AuthRequest, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { investment: { select: { id: true, animalId: true, shares: true } } },
  });
  return res.json(ok(payments));
});

export default router;
