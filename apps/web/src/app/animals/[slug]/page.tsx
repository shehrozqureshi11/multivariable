import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatPkr, SITE_URL } from "@/lib/api";
import { getAnimalBySlug } from "@/lib/catalog";
import { InvestButton } from "@/components/InvestButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { animal: a } = await getAnimalBySlug(slug);
  if (!a) return { title: "Animal" };
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
  const { animal } = await getAnimalBySlug(slug);
  if (!animal) notFound();

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
        <div
          className="card-media"
          style={{ borderRadius: 18, overflow: "hidden", minHeight: 360 }}
        >
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
          <p className="price">
            {formatPkr(animal.sharePricePkr || animal.pricePkr)} / share
          </p>
          <p className="price-note">
            Price depends on the live livestock market rate at the time of sale.
          </p>
          <p>
            {animal.availableShares} of {animal.totalShares} shares available
            {animal.expectedRoiPercent
              ? ` · Est. ROI ${animal.expectedRoiPercent}%`
              : ""}
          </p>
          <p>{animal.description}</p>
          <InvestButton
            animalId={animal.id}
            animalSlug={animal.slug}
            animalType={animal.species}
            farmName={animal.farm?.name || "the farm"}
            disabled={animal.availableShares < 1}
          />
          {animal.id.startsWith("demo-") ? (
            <p className="meta" style={{ marginTop: "0.75rem" }}>
              Demo listing — discussion requests are simulated and saved to your
              browser until the live database is connected.
            </p>
          ) : null}
          <div style={{ marginTop: "2rem" }}>
            <h2>Care updates</h2>
            <p className="meta">No updates posted yet.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
