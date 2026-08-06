import { Router } from "express";
import { ok, fail } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json(ok(notifications));
});

router.post("/:id/read", authenticate, async (req: AuthRequest, res) => {
  const n = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!n) return res.status(404).json(fail("NOT_FOUND", "Notification not found"));
  const updated = await prisma.notification.update({
    where: { id: n.id },
    data: { isRead: true },
  });
  return res.json(ok(updated));
});

router.post("/read-all", authenticate, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.sub, isRead: false },
    data: { isRead: true },
  });
  return res.json(ok({ read: true }));
});

export default router;
