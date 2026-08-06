import { MetadataRoute } from "next";
import { apiFetch, Animal, Farm, SITE_URL } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/marketplace", "/farms", "/how-it-works", "/terms", "/privacy"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const [animalsRes, farmsRes] = await Promise.all([
    apiFetch<Animal[]>("/animals?limit=50", { revalidate: 300 }),
    apiFetch<Farm[]>("/farms?limit=50", { revalidate: 300 }),
  ]);

  const animals = (animalsRes.data || []).map((a) => ({
    url: `${SITE_URL}/animals/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const farms = (farmsRes.data || []).map((f) => ({
    url: `${SITE_URL}/farms/${f.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...animals, ...farms];
}
