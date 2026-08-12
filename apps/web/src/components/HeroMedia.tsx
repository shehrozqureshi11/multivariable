"use client";

import { useEffect, useRef, useState } from "react";

/** Livestock-only hero frames (goats, cows, sheep, farms) */
const SLIDES = [
  { src: "/images/farms/green-pastures.jpg", label: "Verified farms" },
  { src: "/images/animals/goat-6.jpg", label: "Goats" },
  { src: "/images/animals/cow-6.jpg", label: "Cows" },
  { src: "/images/farms/indus-valley.jpg", label: "Pasture life" },
  { src: "/images/animals/sheep-1.jpg", label: "Sheep" },
  { src: "/images/animals/goat-2.jpg", label: "Herd care" },
  { src: "/images/animals/cow-1.jpg", label: "Dairy stock" },
  { src: "/images/animals/goat-3.jpg", label: "Daily updates" },
];

const VIDEO_CANDIDATES = [
  "/videos/livestock-hero.mp4",
  "/videos/livestock-hero.webm",
];

/**
 * Cinematic hero: plays a local livestock video when present,
 * otherwise a Ken Burns image reel (video-like motion).
 * Drop an MP4/WebM at public/videos/livestock-hero.mp4 to enable video.
 */
export function HeroMedia() {
  const [index, setIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const src of VIDEO_CANDIDATES) {
        try {
          const res = await fetch(src, { method: "HEAD" });
          if (res.ok && !cancelled) {
            setVideoSrc(src);
            return;
          }
        } catch {
          /* try next */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (videoReady) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4800);
    return () => clearInterval(id);
  }, [videoReady]);

  return (
    <div className="hero-media">
      <div className="hero-frame">
        {videoSrc ? (
          <video
            ref={videoRef}
            className={`hero-video${videoReady ? " is-ready" : ""}`}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={SLIDES[0].src}
            aria-label="Livestock farm video"
            onCanPlay={() => {
              setVideoReady(true);
              void videoRef.current?.play().catch(() => undefined);
            }}
            onError={() => {
              setVideoSrc(null);
              setVideoReady(false);
            }}
          />
        ) : null}

        <div
          className={`hero-slideshow${videoReady ? "" : " is-visible"}`}
          aria-hidden={videoReady}
          aria-label={videoReady ? undefined : "Animated livestock gallery"}
        >
          {SLIDES.map((slide, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.label}
              className={`hero-slide${i === index ? " is-active" : ""}`}
            />
          ))}
        </div>

        <div className="hero-mist" aria-hidden />
        <div className="hero-grain" aria-hidden />
        <div className="hero-shine" aria-hidden />
      </div>

      <div className="hero-overlay" />

      {!videoReady ? (
        <>
          <div className="hero-caption" aria-live="polite">
            {SLIDES[index].label}
          </div>
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                className={`hero-dot${i === index ? " is-active" : ""}`}
                aria-label={slide.label}
                aria-selected={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="hero-caption hero-caption-live">Live farm reel</div>
      )}
    </div>
  );
}
