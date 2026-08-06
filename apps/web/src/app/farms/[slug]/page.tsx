import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalCard } from "@/components/AnimalCard";
import { apiFetch, Animal, Farm, SITE_URL } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetch<Farm>(`/farms/${slug}`, { revalidate: 60 });
  if (!res.success || !res.data) return { title: "Farm" };
  const farm = res.data;
  return {
    title: farm.name,
    description: farm.description || `${farm.name} in ${farm.city}, ${farm.province}`,
    alternates: { canonical: `/farms/${slug}` },
    openGraph: {
      title: farm.name,
      description: farm.description || undefined,
      images: farm.imageUrl ? [{ url: farm.imageUrl }] : undefined,
      url: `${SITE_URL}/farms/${slug}`,
    },
  };
}

export default async function FarmDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await apiFetch<Farm & { animals: Animal[] }>(`/farms/${slug}`, {
    revalidate: 60,
  });
  if (!res.success || !res.data) notFound();
  const farm = res.data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: farm.name,
    description: farm.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: farm.city,
      addressRegion: farm.province,
      addressCountry: "PK",
    },
    image: farm.imageUrl,
  };

  return (
    <section className="section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
          <div className="card-media" style={{ borderRadius: "18px", overflow: "hidden" }}>
            {farm.imageUrl ? (
              <Image
                src={farm.imageUrl}
                alt={farm.name}
                width={900}
                height={600}
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            ) : null}
          </div>
          <div>
            <p className="eyebrow">Verified farm</p>
            <h1>{farm.name}</h1>
            <p className="meta">
              {farm.location} · {farm.city}, {farm.province}
            </p>
            <p>{farm.description}</p>
            <Link href="/marketplace" className="btn btn-primary">
              Browse animals
            </Link>
          </div>
        </div>
        <h2>Available livestock</h2>
        <div className="grid grid-3">
          {(farm.animals || []).map((a) => (
            <AnimalCard key={a.id} animal={{ ...a, farm: { id: farm.id, name: farm.name, slug: farm.slug, city: farm.city, province: farm.province } }} />
          ))}
        </div>
      </div>
    </section>
  );
}
