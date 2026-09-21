"use client";

import { mediaUrl } from "@/lib/media";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export function ClubGallery({
  photos,
}: {
  photos: {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || photos.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % photos.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, photos.length]);

  function move(direction: number) {
    setPaused(true);
    setActive((index) => (index + direction + photos.length) % photos.length);
  }

  if (!photos.length) return null;

  return (
    <div
      className="club-gallery"
      role="region"
      aria-label="Kulübümüzden kareler"
      aria-roledescription="galeri"
    >
      <div className="club-gallery-stage">
        {photos.map((photo, index) => (
          <div
            key={photo.src}
            className={`club-gallery-slide${index === active ? " is-active" : ""}`}
            aria-hidden={index !== active}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 480px) 90vw, 420px"
            />
          </div>
        ))}
      </div>
      <div className="club-gallery-controls">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Önceki görsel"
        >
          <ChevronLeft size={20} />
        </button>
        <span aria-live={paused || reducedMotion ? "polite" : "off"}>
          {active + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Sonraki görsel"
        >
          <ChevronRight size={20} />
        </button>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-label={
              paused ? "Slayt gösterisini oynat" : "Slayt gösterisini durdur"
            }
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        )}
      </div>
      <Image
        className="club-gallery-brand"
        src={mediaUrl("/media/club/alfa-wolf.png")}
        alt="ALFA ve kurt amblemi"
        width={400}
        height={133}
        sizes="(max-width: 480px) 85vw, 400px"
      />
    </div>
  );
}
