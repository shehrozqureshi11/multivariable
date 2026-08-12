import type { Metadata } from "next";
import { AnimalCard } from "@/components/AnimalCard";
import { getMarketplaceAnimals } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse verified goats, sheep, and cows available for investment on HerdShare.",
  alternates: { canonical: "/marketplace" },
};

export const revalidate = 30;

const FILTERS = [
  { value: "", label: "All" },
  { value: "GOAT", label: "Goats" },
  { value: "SHEEP", label: "Sheep" },
  { value: "COW", label: "Cows" },
] as const;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>;
}) {
  const sp = await searchParams;
  const active = (sp.species || "").toUpperCase();
  const { animals } = await getMarketplaceAnimals({
    species: active || undefined,
    limit: 24,
  });

  return (
    <section className="section" style={{ paddingTop: "1.5rem" }}>
      <div className="container">
        <div className="page-banner fade-up">
          <p className="eyebrow">Invest with clarity</p>
          <h1>Marketplace</h1>
          <p className="meta" style={{ maxWidth: "42ch", marginTop: "0.5rem" }}>
            Verified goats, sheep, and cows from approved farms — priced in PKR
            with share ownership you can track.
          </p>
        </div>
        <div className="section-head" style={{ marginTop: "1.75rem" }}>
          <div>
            <p className="meta" style={{ margin: 0 }}>
              {animals.length
                ? `${animals.length} listing${animals.length === 1 ? "" : "s"}`
                : "No listings yet"}
            </p>
          </div>
          <div className="filter-chips">
            {FILTERS.map((f) => {
              const isActive = active === f.value;
              return (
                <a
                  key={f.label}
                  className={`filter-chip${isActive ? " is-active" : ""}`}
                  href={f.value ? `/marketplace?species=${f.value}` : "/marketplace"}
                >
                  {f.label}
                </a>
              );
            })}
          </div>
        </div>
        <div className="grid grid-3">
          {animals.map((a, i) => (
            <div key={a.id} className={`fade-up delay-${Math.min(i % 4, 3)}`}>
              <AnimalCard animal={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
