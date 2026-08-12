import Image from "next/image";
import Link from "next/link";
import { Animal, formatPkr } from "@/lib/api";

function AnimalImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={640}
      height={480}
      sizes="(max-width: 900px) 100vw, 33vw"
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
}

export function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <article className="animal-card fade-in">
      <Link href={`/animals/${animal.slug}`}>
        <div className="card-media">
          {animal.imageUrl ? (
            <AnimalImage src={animal.imageUrl} alt={animal.name} />
          ) : null}
        </div>
        <div className="card-body">
          <div className="card-top">
            <p className="eyebrow">{animal.species}</p>
            {animal.expectedRoiPercent ? (
              <span className="badge badge-green">
                Est. ROI {animal.expectedRoiPercent}%
              </span>
            ) : null}
          </div>
          <h3 style={{ margin: 0 }}>{animal.name}</h3>
          <p className="meta">
            {animal.farm.name} · {animal.farm.city}
          </p>
          <p className="price">
            {formatPkr(animal.sharePricePkr || animal.pricePkr)}{" "}
            <span className="price-unit">/ share</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
