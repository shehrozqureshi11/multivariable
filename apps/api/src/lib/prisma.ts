import { PrismaClient } from "@prisma/client";

// Allow the API to boot without DATABASE_URL (demo catalog fallback).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://demo:demo@127.0.0.1:5432/demo?schema=public";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function dbAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
