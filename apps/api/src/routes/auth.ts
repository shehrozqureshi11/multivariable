import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { loginSchema, ok, fail, registerSchema } from "@herdshare/shared";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/auth";
import { writeAudit } from "../lib/helpers";
import { validateBody } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", validateBody(registerSchema), async (req, res) => {
  const { email, password, fullName, phone, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json(fail("EMAIL_TAKEN", "Email already registered"));
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      role,
      wallet: { create: { balancePkr: 0 } },
      kyc: { create: {} },
    },
  });
  await writeAudit({
    actorId: user.id,
    action: "USER_REGISTER",
    entityType: "User",
    entityId: user.id,
    ip: req.ip,
  });
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return res.status(201).json(
    ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    })
  );
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json(fail("INVALID_CREDENTIALS", "Invalid email or password"));
  }
  if (!user.isActive) {
    return res.status(403).json(fail("ACCOUNT_DISABLED", "Account is disabled"));
  }
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await writeAudit({
    actorId: user.id,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user.id,
    ip: req.ip,
  });
  return res.json(
    ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    })
  );
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json(fail("VALIDATION_ERROR", "refreshToken required"));
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json(fail("UNAUTHORIZED", "Refresh token invalid"));
    }
    const accessToken = signAccessToken({
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
    });
    return res.json(ok({ accessToken }));
  } catch {
    return res.status(401).json(fail("UNAUTHORIZED", "Refresh token invalid"));
  }
});

router.post("/logout", authenticate, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return res.json(ok({ loggedOut: true }));
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
      kyc: true,
      wallet: true,
      farm: { select: { id: true, name: true, slug: true, status: true } },
    },
  });
  if (!user) return res.status(404).json(fail("NOT_FOUND", "User not found"));
  return res.json(ok(user));
});

/** OTP stub — generates code, stores hash briefly in audit, returns in non-prod */
router.post("/otp/request", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone) return res.status(400).json(fail("VALIDATION_ERROR", "phone required"));
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await writeAudit({
    action: "OTP_REQUEST",
    entityType: "Otp",
    metadata: { phone, codeHash: crypto.createHash("sha256").update(code).digest("hex") },
  });
  return res.json(
    ok({
      sent: true,
      ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}),
    })
  );
});

export default router;
