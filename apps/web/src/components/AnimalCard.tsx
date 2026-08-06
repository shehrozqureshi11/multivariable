import Image from "next/image";
import Link from "next/link";
import { Animal, formatPkr } from "@/lib/api";

export function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <article className="animal-card fade-in">
      <Link href={`/animals/${animal.slug}`}>
        <div className="card-media">
          {animal.imageUrl ? (
            <Image
              src={animal.imageUrl}
              alt={animal.name}
              width={640}
              height={480}
              sizes="(max-width: 900px) 100vw, 33vw"
            />
          ) : null}
        </div>
        <div className="card-body">
          <p className="eyebrow">{animal.species}</p>
          <h3 style={{ margin: 0 }}>{animal.name}</h3>
          <p className="meta">
            {animal.farm.name} · {animal.farm.city}
          </p>
          <p className="price">{formatPkr(animal.sharePricePkr || animal.pricePkr)} / share</p>
          {animal.expectedRoiPercent ? (
            <span className="badge badge-green">Est. ROI {animal.expectedRoiPercent}%</span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
