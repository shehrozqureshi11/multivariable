import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { HeroMedia } from "@/components/HeroMedia";
import { apiFetch, Animal, SITE_NAME } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const res = await apiFetch<Animal[]>("/animals?limit=9", { revalidate: 60 });
  const animals = res.success ? res.data || [] : [];

  return (
    <>
      <section className="hero">
        <HeroMedia />
        <div className="container hero-content">
          <p className="eyebrow" style={{ color: "#f0d6c4" }}>
            {SITE_NAME}
          </p>
          <h1>Invest in livestock you can track.</h1>
          <p>
            Fund verified goats, sheep, and cows. Share profits with transparent
            farm care updates and digital agreements.
          </p>
          <div className="hero-actions">
            <Link href="/marketplace" className="btn btn-accent">
              Browse livestock
            </Link>
            <Link
              href="/how-it-works"
              className="btn btn-secondary"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.45)" }}
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Live on the marketplace</h2>
              <p>Verified animals from approved farms across Punjab and beyond.</p>
            </div>
            <Link href="/marketplace" className="btn btn-secondary">
              View all
            </Link>
          </div>
          <div className="grid grid-3">
            {animals.map((a) => (
              <AnimalCard key={a.id} animal={a} />
            ))}
            {!animals.length ? (
              <p className="meta">
                Marketplace data will appear once the API and database are connected.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container trust">
          <div>
            <h2>Built for trust, not hype.</h2>
            <p className="meta">
              HerdShare connects investors with verified farm owners. KYC, farm
              checks, digital contracts, and audit logs keep every share
              accountable.
            </p>
          </div>
          <div className="trust-list">
            <div className="trust-item">
              <strong>Verified farms</strong>
              <p className="meta">Admin review before listings go live.</p>
            </div>
            <div className="trust-item">
              <strong>Digital agreements</strong>
              <p className="meta">Accept terms before funding any share.</p>
            </div>
            <div className="trust-item">
              <strong>Care tracking</strong>
              <p className="meta">Weight updates, vaccinations, and farm notes.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
