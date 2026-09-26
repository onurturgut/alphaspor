"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type HeroVideoAssets = {
  desktop: string;
  mobile: string;
  poster: string;
  mobilePoster: string;
};

export function HeroVideo({
  desktop,
  mobile,
  poster,
  mobilePoster,
}: HeroVideoAssets) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 700px)").matches;
    element.poster = small ? mobilePoster : poster;
    element.src = small ? mobile : desktop;
    const update = () => {
      if (motion.matches) element.pause();
      else
        void element.play().catch(() => {
          /* Poster and play button remain available. */
        });
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [desktop, mobile, poster, mobilePoster]);

  return (
    <>
      <div
        className="hero-video-backdrop"
        style={
          {
            "--hero-poster": `url("${poster}")`,
            "--hero-mobile-poster": `url("${mobilePoster}")`,
          } as CSSProperties
        }
      >
        <video
          ref={video}
          className="hero-video-element"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onError={() => {
            setFailed(true);
          }}
          style={failed ? { visibility: "hidden" } : undefined}
        />
      </div>
    </>
  );
}
