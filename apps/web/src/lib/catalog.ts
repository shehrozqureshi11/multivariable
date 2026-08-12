import { apiFetch, Animal, Farm } from "@/lib/api";
import {
  DEMO_FARMS,
  filterDemoAnimals,
  getDemoAnimal,
  getDemoFarm,
} from "@/lib/demo-catalog";

export async function getMarketplaceAnimals(options?: {
  species?: string;
  limit?: number;
}): Promise<{ animals: Animal[]; fromDemo: boolean }> {
  const species = options?.species?.toUpperCase() || "";
  const limit = options?.limit ?? 24;
  const qs = species
    ? `?species=${encodeURIComponent(species)}&limit=${limit}`
    : `?limit=${limit}`;

  const res = await apiFetch<Animal[]>(`/animals${qs}`, { revalidate: 30 });
  if (res.success && res.data?.length) {
    return { animals: res.data, fromDemo: false };
  }
  return { animals: filterDemoAnimals(species || undefined, limit), fromDemo: true };
}

export async function getAnimalBySlug(slug: string): Promise<{
  animal: Animal | null;
  fromDemo: boolean;
}> {
  const res = await apiFetch<Animal>(`/animals/${slug}`, { revalidate: 45 });
  if (res.success && res.data) {
    return { animal: res.data, fromDemo: false };
  }
  const demo = getDemoAnimal(slug);
  return { animal: demo || null, fromDemo: Boolean(demo) };
}

export async function getVerifiedFarms(limit = 24): Promise<{
  farms: Farm[];
  fromDemo: boolean;
}> {
  const res = await apiFetch<Farm[]>(`/farms?limit=${limit}`, { revalidate: 60 });
  if (res.success && res.data?.length) {
    return { farms: res.data, fromDemo: false };
  }
  return { farms: DEMO_FARMS.slice(0, limit), fromDemo: true };
}

export async function getFarmBySlug(slug: string): Promise<{
  farm: Farm | null;
  fromDemo: boolean;
}> {
  const res = await apiFetch<Farm>(`/farms/${slug}`, { revalidate: 60 });
  if (res.success && res.data) {
    return { farm: res.data, fromDemo: false };
  }
  const demo = getDemoFarm(slug);
  return { farm: demo || null, fromDemo: Boolean(demo) };
}
