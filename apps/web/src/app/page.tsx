import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { HeroMedia } from "@/components/HeroMedia";
import { getMarketplaceAnimals } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const { animals } = await getMarketplaceAnimals({ limit: 6 });

  return (
    <>
      <section className="hero">
        <HeroMedia />
        <div className="container hero-content">
          <p className="eyebrow hero-eyebrow">{SITE_NAME}</p>
          <h1>
            Invest in livestock
            <span className="hero-line">you can track.</span>
          </h1>
          <p>
            Fund verified goats, sheep, and cows. Share profits with transparent
            farm care updates and digital agreements.
          </p>
          <div className="hero-actions">
            <Link href="/marketplace" className="btn btn-accent">
              Browse livestock
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost">
              How it works
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>Verified</strong>
              <span>Farms only</span>
            </div>
            <div>
              <strong>PKR</strong>
              <span>Share pricing</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Care updates</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section steps-section">
        <div className="container">
          <div className="section-head center">
            <div>
              <p className="eyebrow">Simple path</p>
              <h2>From signup to share ownership</h2>
            </div>
          </div>
          <div className="steps">
            <article className="step fade-up">
              <span className="step-num">01</span>
              <h3>Create account</h3>
              <p>Register as investor or farm owner in minutes.</p>
            </article>
            <article className="step fade-up delay-1">
              <span className="step-num">02</span>
              <h3>Pick livestock</h3>
              <p>Browse goats, sheep, and cows from verified farms.</p>
            </article>
            <article className="step fade-up delay-2">
              <span className="step-num">03</span>
              <h3>Fund & track</h3>
              <p>Accept the agreement, invest a share, follow care updates.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h2>Live on the marketplace</h2>
              <p>Verified animals from approved farms across Punjab and beyond.</p>
            </div>
            <Link href="/marketplace" className="btn btn-secondary">
              View all
            </Link>
          </div>
          <div className="grid grid-3">
            {animals.map((a, i) => (
              <div key={a.id} className={`fade-up delay-${Math.min(i, 3)}`}>
                <AnimalCard animal={a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section trust-section">
        <div className="container trust">
          <div className="trust-copy fade-up">
            <p className="eyebrow">Why HerdShare</p>
            <h2>Built for trust, not hype.</h2>
            <p className="meta">
              HerdShare connects investors with verified farm owners. KYC, farm
              checks, digital contracts, and audit logs keep every share
              accountable.
            </p>
            <Link href="/register" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
              Get started
            </Link>
          </div>
          <div className="trust-list">
            <div className="trust-item fade-up">
              <strong>Verified farms</strong>
              <p className="meta">Admin review before listings go live.</p>
            </div>
            <div className="trust-item fade-up delay-1">
              <strong>Digital agreements</strong>
              <p className="meta">Accept terms before funding any share.</p>
            </div>
            <div className="trust-item fade-up delay-2">
              <strong>Care tracking</strong>
              <p className="meta">Weight updates, vaccinations, and farm notes.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
