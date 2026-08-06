"use client";

import { useEffect, useState } from "react";

/** Only goats, cows, and sheep — never horses or dogs */
const SLIDES = [
  "/images/animals/goat-6.jpg",
  "/images/animals/cow-6.jpg",
  "/images/animals/goat-2.jpg",
  "/images/animals/cow-2.jpg",
  "/images/animals/sheep-1.jpg",
  "/images/animals/goat-3.jpg",
  "/images/animals/cow-1.jpg",
  "/images/animals/sheep-2.jpg",
];

export function HeroMedia() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-media">
      <div className="hero-frame">
        <div className="hero-slideshow" aria-label="Animated goats, cows and sheep">
          {SLIDES.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`hero-slide${i === index ? " is-active" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="hero-overlay" />
    </div>
  );
}
