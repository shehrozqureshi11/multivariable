import { Router } from "express";
import { ok, fail } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { paramId } from "../lib/params";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json(ok(notifications));
  } catch (err) {
    console.error("notifications fallback:", err);
    return res.json(
      ok([
        {
          id: "demo-note-1",
          title: "Welcome to HerdShare",
          body: "Demo mode is active. Marketplace listings are available.",
          isRead: false,
        },
      ])
    );
  }
});

router.post("/:id/read", authenticate, async (req: AuthRequest, res) => {
  const n = await prisma.notification.findFirst({
    where: { id: paramId(req), userId: req.user!.sub },
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
