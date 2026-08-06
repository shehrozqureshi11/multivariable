import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiFetch, Animal, formatPkr, SITE_URL } from "@/lib/api";
import { InvestButton } from "@/components/InvestButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetch<Animal>(`/animals/${slug}`, { revalidate: 45 });
  if (!res.success || !res.data) return { title: "Animal" };
  const a = res.data;
  return {
    title: a.name,
    description:
      a.description ||
      `Invest in ${a.name} (${a.species}) from ${a.farm?.name || "a verified farm"}.`,
    alternates: { canonical: `/animals/${slug}` },
    openGraph: {
      title: a.name,
      images: a.imageUrl ? [{ url: a.imageUrl }] : undefined,
      url: `${SITE_URL}/animals/${slug}`,
    },
  };
}

export default async function AnimalDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await apiFetch<
    Animal & {
      updates?: { id: string; title: string; body: string; createdAt: string }[];
      vaccinations?: { id: string; vaccineName: string; administeredAt: string }[];
    }
  >(`/animals/${slug}`, { revalidate: 45 });
  if (!res.success || !res.data) notFound();
  const animal = res.data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: animal.name,
    description: animal.description,
    image: animal.imageUrl,
    category: animal.species,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: Number(animal.sharePricePkr || animal.pricePkr),
      availability:
        animal.availableShares > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container grid grid-2">
        <div className="card-media" style={{ borderRadius: 18, overflow: "hidden", minHeight: 360 }}>
          {animal.imageUrl ? (
            <Image
              src={animal.imageUrl}
              alt={animal.name}
              width={900}
              height={700}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          ) : null}
        </div>
        <div>
          <p className="eyebrow">{animal.species}</p>
          <h1>{animal.name}</h1>
          <p className="meta">
            {animal.farm?.name} · {animal.farm?.city}
            {animal.breed ? ` · ${animal.breed}` : ""} · {animal.ageMonths} months
          </p>
          <p className="price">{formatPkr(animal.sharePricePkr || animal.pricePkr)} / share</p>
          <p>
            {animal.availableShares} of {animal.totalShares} shares available
            {animal.expectedRoiPercent
              ? ` · Est. ROI ${animal.expectedRoiPercent}%`
              : ""}
          </p>
          <p>{animal.description}</p>
          <InvestButton animalId={animal.id} disabled={animal.availableShares < 1} />
          <div style={{ marginTop: "2rem" }}>
            <h2>Care updates</h2>
            {(animal.updates || []).length ? (
              <ul>
                {animal.updates!.map((u) => (
                  <li key={u.id}>
                    <strong>{u.title}</strong> — {u.body}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta">No updates posted yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
