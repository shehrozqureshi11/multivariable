import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { apiFetch, Farm } from "@/lib/api";

export const metadata: Metadata = {
  title: "Verified Farms",
  description: "Explore verified livestock farms partnered with HerdShare.",
  alternates: { canonical: "/farms" },
};

export const revalidate = 60;

export default async function FarmsPage() {
  const res = await apiFetch<Farm[]>("/farms?limit=24", { revalidate: 60 });
  const farms = res.success ? res.data || [] : [];

  return (
    <section className="section" style={{ paddingTop: "1.5rem" }}>
      <div className="container">
        <div className="page-banner fade-up">
          <p className="eyebrow">Partners</p>
          <h1>Verified farms</h1>
          <p className="meta" style={{ maxWidth: "42ch", marginTop: "0.5rem" }}>
            Only approved farms appear on the public directory — with listings you
            can invest in and track.
          </p>
        </div>
        <div className="grid grid-2" style={{ marginTop: "2rem" }}>
          {farms.map((farm, i) => (
            <article
              key={farm.id}
              className={`farm-card fade-up delay-${Math.min(i % 4, 3)}`}
            >
              <Link href={`/farms/${farm.slug}`}>
                <div className="card-media">
                  {farm.imageUrl ? (
                    farm.imageUrl.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={farm.imageUrl}
                        alt={farm.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        src={farm.imageUrl}
                        alt={farm.name}
                        width={800}
                        height={500}
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    )
                  ) : null}
                </div>
                <div className="card-body">
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem" }}>
                    {farm.name}
                  </h2>
                  <p className="meta">
                    {farm.city}, {farm.province}
                    {farm._count ? ` · ${farm._count.animals} animals` : ""}
                  </p>
                  <p>{farm.description}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
        {!farms.length ? (
          <p className="meta">No verified farms yet.</p>
        ) : null}
      </div>
    </section>
  );
}
