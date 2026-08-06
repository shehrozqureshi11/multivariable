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
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <h1>Verified farms</h1>
            <p>Only approved farms appear on the public directory.</p>
          </div>
        </div>
        <div className="grid grid-2">
          {farms.map((farm) => (
            <article key={farm.id} className="farm-card fade-in">
              <Link href={`/farms/${farm.slug}`}>
                <div className="card-media">
                  {farm.imageUrl ? (
                    <Image
                      src={farm.imageUrl}
                      alt={farm.name}
                      width={800}
                      height={500}
                      sizes="(max-width: 900px) 100vw, 50vw"
                    />
                  ) : null}
                </div>
                <div className="card-body">
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem" }}>{farm.name}</h2>
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
      </div>
    </section>
  );
}
