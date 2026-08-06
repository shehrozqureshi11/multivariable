import type { Metadata } from "next";
import { AnimalCard } from "@/components/AnimalCard";
import { apiFetch, Animal } from "@/lib/api";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse verified goats, sheep, and cows available for investment on HerdShare.",
  alternates: { canonical: "/marketplace" },
};

export const revalidate = 30;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>;
}) {
  const sp = await searchParams;
  const qs = sp.species ? `?species=${sp.species}&limit=24` : "?limit=24";
  const res = await apiFetch<Animal[]>(`/animals${qs}`, { revalidate: 30 });
  const animals = res.success ? res.data || [] : [];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <h1>Marketplace</h1>
            <p>Choose a species or browse all verified listings.</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["", "GOAT", "SHEEP", "COW"].map((s) => (
              <a
                key={s || "all"}
                className="btn btn-secondary"
                href={s ? `/marketplace?species=${s}` : "/marketplace"}
              >
                {s || "All"}
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-3">
          {animals.map((a) => (
            <AnimalCard key={a.id} animal={a} />
          ))}
        </div>
        {!animals.length ? (
          <p className="meta">No listings yet. Connect the API and seed the database.</p>
        ) : null}
      </div>
    </section>
  );
}
