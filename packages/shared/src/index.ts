import { z } from "zod";

export const UserRole = z.enum(["INVESTOR", "FARM_OWNER", "ADMIN"]);
export type UserRole = z.infer<typeof UserRole>;

export const AnimalSpecies = z.enum(["GOAT", "SHEEP", "COW"]);
export type AnimalSpecies = z.infer<typeof AnimalSpecies>;

export const VerificationStatus = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const InvestmentStatus = z.enum([
  "PENDING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
]);
export type InvestmentStatus = z.infer<typeof InvestmentStatus>;

export const PaymentStatus = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(20).optional(),
  role: z.enum(["INVESTOR", "FARM_OWNER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const farmCreateSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  location: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  province: z.string().min(2).max(100),
  capacity: z.number().int().positive().optional(),
});

export const animalCreateSchema = z.object({
  farmId: z.string().cuid(),
  name: z.string().min(1).max(120),
  species: AnimalSpecies,
  breed: z.string().max(100).optional(),
  ageMonths: z.number().int().nonnegative(),
  weightKg: z.number().positive().optional(),
  pricePkr: z.number().positive(),
  sharePricePkr: z.number().positive().optional(),
  totalShares: z.number().int().positive().default(1),
  expectedRoiPercent: z.number().min(0).max(100).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
});

export const investSchema = z.object({
  animalId: z.string().cuid(),
  shares: z.number().int().positive().default(1),
  acceptAgreement: z.literal(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
};

export type ApiError = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function ok<T>(
  data: T,
  meta?: ApiSuccess<T>["meta"]
): ApiSuccess<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function fail(
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return { success: false, error: { code, message, details } };
}
