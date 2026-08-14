import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_ANIMALS, DEMO_FARMS, getDemoAnimal, getDemoFarm } from "@/lib/demo-catalog";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function listAnimals(searchParams: URLSearchParams) {
  const species = (searchParams.get("species") || "").toUpperCase();
  const limit = Math.min(Number(searchParams.get("limit") || 24), 50);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  let rows = [...DEMO_ANIMALS];
  if (species) rows = rows.filter((a) => a.species === species);
  const total = rows.length;
  const start = (page - 1) * limit;
  return ok(rows.slice(start, start + limit), { page, limit, total });
}

export function animalBySlug(slug: string) {
  const animal = getDemoAnimal(slug);
  if (!animal) return fail("NOT_FOUND", "Animal not found", 404);
  return ok({ ...animal, updates: [], vaccinations: [] });
}

export function listFarms(searchParams: URLSearchParams) {
  const limit = Math.min(Number(searchParams.get("limit") || 24), 50);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const total = DEMO_FARMS.length;
  const start = (page - 1) * limit;
  return ok(DEMO_FARMS.slice(start, start + limit), { page, limit, total });
}

export function farmBySlug(slug: string) {
  const farm = getDemoFarm(slug);
  if (!farm) return fail("NOT_FOUND", "Farm not found", 404);
  return ok(farm);
}

/** Demo accounts (password always Password123!) */
export const DEMO_USERS = [
  {
    id: "demo-admin",
    email: "admin@herdshare.pk",
    fullName: "Platform Admin",
    role: "ADMIN",
    password: "Password123!",
  },
  {
    id: "demo-investor",
    email: "investor@herdshare.pk",
    fullName: "Ayesha Khan",
    role: "INVESTOR",
    password: "Password123!",
  },
  {
    id: "demo-farm",
    email: "farm@herdshare.pk",
    fullName: "Imran Malik",
    role: "FARM_OWNER",
    password: "Password123!",
  },
] as const;

export function issueDemoTokens(user: (typeof DEMO_USERS)[number]) {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
  };
  const accessToken = `demo.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.token`;
  const refreshToken = `demo-refresh.${user.id}.${Date.now()}`;
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Demo portfolio lives in a browser cookie so the simulated wallet and
 * investments survive navigation without a database behind the API routes.
 */
const PORTFOLIO_COOKIE = "hs_demo_portfolio";
const STARTING_BALANCE_PKR = 500000;
const STARTING_BALANCE_AT = "2026-01-01T00:00:00.000Z";

export type DemoInvestment = {
  id: string;
  animalSlug: string;
  shares: number;
  amountPkr: number;
  createdAt: string;
};

export type DemoDeposit = {
  id: string;
  amountPkr: number;
  createdAt: string;
};

export type DemoPortfolio = {
  deposits: DemoDeposit[];
  investments: DemoInvestment[];
};

const EMPTY_PORTFOLIO: DemoPortfolio = { deposits: [], investments: [] };

export async function readPortfolio(): Promise<DemoPortfolio> {
  try {
    const raw = (await cookies()).get(PORTFOLIO_COOKIE)?.value;
    if (!raw) return EMPTY_PORTFOLIO;
    const parsed = JSON.parse(raw) as Partial<DemoPortfolio>;
    return {
      deposits: Array.isArray(parsed.deposits) ? parsed.deposits : [],
      investments: Array.isArray(parsed.investments) ? parsed.investments : [],
    };
  } catch {
    return EMPTY_PORTFOLIO;
  }
}

export function okWithPortfolio<T>(data: T, portfolio: DemoPortfolio) {
  const res = ok(data);
  res.cookies.set(PORTFOLIO_COOKIE, JSON.stringify(portfolio), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export function walletFromPortfolio(portfolio: DemoPortfolio) {
  const deposited = portfolio.deposits.reduce((sum, d) => sum + d.amountPkr, 0);
  const invested = portfolio.investments.reduce((sum, i) => sum + i.amountPkr, 0);
  const txns = [
    {
      id: "demo-txn-opening",
      type: "DEPOSIT",
      amountPkr: STARTING_BALANCE_PKR,
      note: "Demo starting balance",
      createdAt: STARTING_BALANCE_AT,
    },
    ...portfolio.deposits.map((d) => ({
      id: d.id,
      type: "DEPOSIT",
      amountPkr: d.amountPkr,
      note: "Mock deposit",
      createdAt: d.createdAt,
    })),
    ...portfolio.investments.map((i) => ({
      id: `txn-${i.id}`,
      type: "INVESTMENT",
      amountPkr: i.amountPkr,
      note: `${i.shares} share(s) — ${getDemoAnimal(i.animalSlug)?.name || i.animalSlug}`,
      createdAt: i.createdAt,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    balancePkr: STARTING_BALANCE_PKR + deposited - invested,
    txns,
  };
}

export function hydrateInvestments(portfolio: DemoPortfolio) {
  return portfolio.investments
    .map((i) => {
      const animal = getDemoAnimal(i.animalSlug);
      return {
        id: i.id,
        shares: i.shares,
        amountPkr: i.amountPkr,
        status: "ACTIVE",
        createdAt: i.createdAt,
        animal: {
          name: animal?.name || i.animalSlug,
          slug: i.animalSlug,
          farm: { name: animal?.farm.name || "Demo farm" },
        },
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sharesHeld(portfolio: DemoPortfolio, animalSlug: string) {
  return portfolio.investments
    .filter((i) => i.animalSlug === animalSlug)
    .reduce((sum, i) => sum + i.shares, 0);
}

export function parseDemoToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token.startsWith("demo.")) return null;
  try {
    const part = token.split(".")[1];
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as {
      sub: string;
      role: string;
      email: string;
      fullName?: string;
    };
  } catch {
    return null;
  }
}
