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
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");

  function source(element: HTMLVideoElement) {
    if (!element.getAttribute("src")) {
      element.src = window.matchMedia("(max-width: 700px)").matches ? mobile : desktop;
    }
  }

  async function toggle() {
    const element = video.current;
    if (!element) return;
    if (!element.paused) {
      element.pause();
      return;
    }
    setNotice("");
    if (element.error) element.load();
    source(element);
    try {
      await element.play();
    } catch {
      setNotice(element.error
        ? "Video yüklenemedi. Yeniden deneyebilirsiniz."
        : "Video başlatılamadı. Yeniden deneyebilirsiniz.");
    }
  }

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 700px)").matches;
    element.poster = small ? mobilePoster : poster;
    let disposed = false;
    const update = () => {
      if (motion.matches) element.pause();
      else {
        if (!element.getAttribute("src")) element.src = small ? mobile : desktop;
        void element.play().catch(() => {
          if (!disposed) setNotice("Videoyu oynat düğmesiyle başlatabilirsiniz.");
        });
      }
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      disposed = true;
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
          onPlaying={() => {
            setPlaying(true);
            setFailed(false);
            setNotice("");
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setFailed(true);
            setNotice("Video yüklenemedi. Yeniden deneyebilirsiniz.");
          }}
          style={failed ? { visibility: "hidden" } : undefined}
        />
      </div>
      <div className="hero-video-controls">
        <p className="hero-video-notice" role="status">{notice}</p>
        <button type="button" className="hero-video-toggle" onClick={() => void toggle()}>
          {playing ? "Videoyu duraklat" : failed ? "Videoyu yeniden dene" : "Videoyu oynat"}
        </button>
      </div>
    </>
  );
}
