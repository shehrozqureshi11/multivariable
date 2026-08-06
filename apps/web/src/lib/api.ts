const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    next:
      revalidate === false
        ? { revalidate: 0 }
        : { revalidate: revalidate ?? 30 },
  });
  return res.json();
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
