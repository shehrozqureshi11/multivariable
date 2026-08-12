const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL
    ? "https://herdshareapi-production.up.railway.app/api/v1"
    : "http://localhost:4000/api/v1");
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL
    ? "https://multivariable-api-git-main-sheriii.vercel.app"
    : "http://localhost:3000");
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HerdShare";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  meta?: { page?: number; limit?: number; total?: number };
  error?: { code: string; message: string };
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string; revalidate?: number | false } = {}
): Promise<ApiResponse<T>> {
  const { token, revalidate, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isServer = typeof window === "undefined";
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: revalidate === false ? "no-store" : undefined,
      ...(isServer && revalidate !== false
        ? { next: { revalidate: revalidate ?? 30 } }
        : {}),
    });
    if (!res.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: `API returned ${res.status}`,
        },
      };
    }
    return res.json();
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Unable to reach API" },
    };
  }
}

export function formatPkr(value: number | string) {
  const n = Number(value);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

export type Animal = {
  id: string;
  name: string;
  slug: string;
  species: "GOAT" | "SHEEP" | "COW";
  breed?: string | null;
  ageMonths: number;
  weightKg?: number | null;
  pricePkr: string | number;
  sharePricePkr?: string | number | null;
  totalShares: number;
  availableShares: number;
  expectedRoiPercent?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  status: string;
  farm: {
    id: string;
    name: string;
    slug: string;
    city: string;
    province?: string;
  };
};

export type Farm = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location: string;
  city: string;
  province: string;
  imageUrl?: string | null;
  status: string;
  owner?: { fullName: string };
  _count?: { animals: number; reviews: number };
  animals?: Animal[];
};
