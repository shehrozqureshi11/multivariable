import { Router } from "express";
import crypto from "crypto";
import { investSchema, ok, fail } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import { cacheDel } from "../lib/redis";
import { notify, writeAudit } from "../lib/helpers";
import { authenticate, requireRoles, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

const AGREEMENT_TEMPLATE = `HerdShare Digital Livestock Investment Agreement v1.0
Parties agree to transparent profit sharing subject to livestock risk.
Platform facilitates; farm owner manages care; investor funds shares.
Local regulatory and Shariah review recommended before production use.`;

router.get(
  "/mine",
  authenticate,
  requireRoles("INVESTOR"),
  async (req: AuthRequest, res) => {
    const investments = await prisma.investment.findMany({
      where: { investorId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      include: {
        animal: {
          include: { farm: { select: { name: true, slug: true, city: true } } },
        },
        payment: true,
        agreement: true,
        distributions: true,
      },
    });
    return res.json(ok(investments));
  }
);

router.post(
  "/",
  authenticate,
  requireRoles("INVESTOR"),
  validateBody(investSchema),
  async (req: AuthRequest, res) => {
    const { animalId, shares } = req.body;
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
      include: { farm: true },
    });
    if (!animal || animal.farm.status !== "APPROVED") {
      return res.status(404).json(fail("NOT_FOUND", "Animal not available"));
    }
    if (animal.availableShares < shares) {
      return res
        .status(400)
        .json(fail("INSUFFICIENT_SHARES", "Not enough shares available"));
    }
    const sharePrice = Number(animal.sharePricePkr || animal.pricePkr);
    const amountPkr = sharePrice * shares;

    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.create({
        data: {
          investorId: req.user!.sub,
          animalId,
          shares,
          amountPkr,
          status: "PENDING",
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId: req.user!.sub,
          investmentId: investment.id,
          amountPkr,
          method: "MOCK",
          status: "COMPLETED",
          providerRef: `MOCK-${crypto.randomBytes(6).toString("hex")}`,
          metadata: { provider: "mock", simulated: true },
        },
      });

      const contentHash = crypto
        .createHash("sha256")
        .update(AGREEMENT_TEMPLATE + investment.id)
        .digest("hex");

      await tx.agreement.create({
        data: {
          investmentId: investment.id,
          userId: req.user!.sub,
          contentHash,
        },
      });

      let wallet = await tx.wallet.findUnique({ where: { userId: req.user!.sub } });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: req.user!.sub, balancePkr: 0 },
        });
      }
      // Mock payment credits then debits for ledger clarity if balance low: allow overdraft via mock top-up
      const bal = Number(wallet.balancePkr);
      if (bal < amountPkr) {
        const topped = bal + amountPkr;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balancePkr: topped },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "DEPOSIT",
            amountPkr,
            balanceAfter: topped,
            reference: payment.id,
            note: "Mock auto top-up for investment",
          },
        });
        wallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
      }

      const newBal = Number(wallet.balancePkr) - amountPkr;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balancePkr: newBal },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "INVESTMENT",
          amountPkr: -amountPkr,
          balanceAfter: newBal,
          reference: investment.id,
          note: `Invested in ${animal.name}`,
        },
      });

      const availableShares = animal.availableShares - shares;
      const status =
        availableShares === 0
          ? "FULLY_FUNDED"
          : availableShares < animal.totalShares
            ? "PARTIALLY_FUNDED"
            : "LISTED";

      await tx.animal.update({
        where: { id: animal.id },
        data: { availableShares, status },
      });

      const active = await tx.investment.update({
        where: { id: investment.id },
        data: { status: "ACTIVE", startedAt: new Date() },
        include: { animal: true, payment: true, agreement: true },
      });

      return active;
    });

    await notify(
      req.user!.sub,
      "Investment confirmed",
      `You invested PKR ${amountPkr.toLocaleString()} in ${animal.name}.`,
      "INVESTMENT",
      `/dashboard/investor`
    );
    await notify(
      animal.farm.ownerId,
      "New investment",
      `${shares} share(s) funded on ${animal.name}.`,
      "INVESTMENT"
    );
    await writeAudit({
      actorId: req.user!.sub,
      action: "INVESTMENT_CREATE",
      entityType: "Investment",
      entityId: result.id,
      metadata: { amountPkr, shares },
      ip: req.ip,
    });
    await cacheDel("animals:*");
    await cacheDel(`animal:${animal.slug}`);
    return res.status(201).json(ok(result));
  }
);

router.get("/agreement/template", (_req, res) => {
  return res.json(
    ok({
      version: "1.0",
      content: AGREEMENT_TEMPLATE,
      hash: crypto.createHash("sha256").update(AGREEMENT_TEMPLATE).digest("hex"),
    })
  );
});

export default router;
