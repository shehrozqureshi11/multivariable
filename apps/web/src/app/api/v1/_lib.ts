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
