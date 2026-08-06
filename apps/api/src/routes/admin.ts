import { Router } from "express";
import { ok, fail } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { cacheDel } from "../lib/redis";
import { notify, writeAudit } from "../lib/helpers";
import { authenticate, requireRoles, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireRoles("ADMIN"));

router.get("/stats", async (_req, res) => {
  const [
    users,
    farmsPending,
    farmsApproved,
    animals,
    investments,
    paymentsTotal,
    openDisputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.farm.count({ where: { status: "PENDING" } }),
    prisma.farm.count({ where: { status: "APPROVED" } }),
    prisma.animal.count(),
    prisma.investment.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amountPkr: true },
    }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
  ]);
  return res.json(
    ok({
      users,
      farmsPending,
      farmsApproved,
      animals,
      investments,
      volumePkr: Number(paymentsTotal._sum.amountPkr || 0),
      openDisputes,
    })
  );
});

router.get("/farms/pending", async (_req, res) => {
  const farms = await prisma.farm.findMany({
    where: { status: "PENDING" },
    include: { owner: { select: { id: true, fullName: true, email: true, phone: true } } },
    orderBy: { createdAt: "asc" },
  });
  return res.json(ok(farms));
});

router.post("/farms/:id/verify", async (req: AuthRequest, res) => {
  const { status, notes } = req.body as {
    status: "APPROVED" | "REJECTED";
    notes?: string;
  };
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json(fail("VALIDATION_ERROR", "status must be APPROVED or REJECTED"));
  }
  const farm = await prisma.farm.update({
    where: { id: req.params.id },
    data: {
      status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
    },
  });
  await notify(
    farm.ownerId,
    status === "APPROVED" ? "Farm verified" : "Farm verification rejected",
    notes ||
      (status === "APPROVED"
        ? "Your farm is now live on HerdShare."
        : "Please update your farm details and resubmit."),
    "FARM"
  );
  await writeAudit({
    actorId: req.user!.sub,
    action: `FARM_${status}`,
    entityType: "Farm",
    entityId: farm.id,
    metadata: { notes },
    ip: req.ip,
  });
  await cacheDel("farms:*");
  return res.json(ok(farm));
});

router.get("/kyc/pending", async (_req, res) => {
  const pending = await prisma.kycProfile.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
  });
  return res.json(ok(pending));
});

router.post("/kyc/:id/review", async (req: AuthRequest, res) => {
  const { status, notes } = req.body as {
    status: "APPROVED" | "REJECTED";
    notes?: string;
  };
  const kyc = await prisma.kycProfile.update({
    where: { id: req.params.id },
    data: { status, notes, reviewedAt: new Date() },
  });
  await writeAudit({
    actorId: req.user!.sub,
    action: `KYC_${status}`,
    entityType: "KycProfile",
    entityId: kyc.id,
  });
  return res.json(ok(kyc));
});

router.get("/disputes", async (_req, res) => {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { opener: { select: { fullName: true, email: true } } },
  });
  return res.json(ok(disputes));
});

router.patch("/disputes/:id", async (req: AuthRequest, res) => {
  const { status, resolution } = req.body;
  const dispute = await prisma.dispute.update({
    where: { id: req.params.id },
    data: { status, resolution },
  });
  await notify(
    dispute.openerId,
    "Dispute updated",
    resolution || `Status: ${status}`,
    "DISPUTE"
  );
  await writeAudit({
    actorId: req.user!.sub,
    action: "DISPUTE_UPDATE",
    entityType: "Dispute",
    entityId: dispute.id,
  });
  return res.json(ok(dispute));
});

router.get("/audit-logs", async (req, res) => {
  const take = Math.min(Number(req.query.limit) || 50, 100);
  const logs = await prisma.auditLog.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { fullName: true, email: true } } },
  });
  return res.json(ok(logs));
});

router.get("/withdrawals", async (_req, res) => {
  const items = await prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true } } },
  });
  return res.json(ok(items));
});

router.post("/withdrawals/:id/process", async (req: AuthRequest, res) => {
  const { status } = req.body as { status: "COMPLETED" | "FAILED" };
  const item = await prisma.withdrawal.update({
    where: { id: req.params.id },
    data: { status, processedAt: new Date() },
  });
  await writeAudit({
    actorId: req.user!.sub,
    action: "WITHDRAWAL_PROCESS",
    entityType: "Withdrawal",
    entityId: item.id,
    metadata: { status },
  });
  return res.json(ok(item));
});

export default router;
