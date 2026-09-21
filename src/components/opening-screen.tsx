"use client";

import { useEffect, useRef } from "react";
import "./opening-screen.css";

const artwork = "/media/club/ChatGPT Image 21 Eyl 2026 23_47_05.png";

export function OpeningScreen() {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const content = document.getElementById("site-content");
    const previousOverflow = document.documentElement.style.overflow;
    const previousInert = content?.inert ?? false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let opening = false;
    let finishTimer: ReturnType<typeof setTimeout>;
    document.documentElement.style.overflow = "hidden";
    if (content) content.inert = true;

    const restore = () => {
      document.documentElement.style.overflow = previousOverflow;
      if (content) content.inert = previousInert;
    };
    const finish = () => {
      screen.hidden = true;
      restore();
    };
    const reveal = () => {
      if (cancelled || opening) return;
      opening = true;
      screen.dataset.state = "opening";
      finishTimer = setTimeout(finish, reducedMotion ? 180 : 1150);
    };

    const image = new window.Image();
    const imageReady = new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = window.matchMedia("(min-width: 768px) and (orientation: landscape)").matches
        ? "/media/club/opening-desktop-wide.png"
        : artwork;
    });
    let onLoad: () => void = () => {};
    const pageReady = new Promise<void>((resolve) => {
      onLoad = resolve;
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", onLoad, { once: true });
    });
    let minimumTimer: ReturnType<typeof setTimeout>;
    const minimumDisplay = new Promise<void>((resolve) => {
      minimumTimer = setTimeout(resolve, reducedMotion ? 0 : 1800);
    });
    // A failed or stalled resource must never trap visitors behind the intro.
    const safetyTimer = setTimeout(reveal, 8000);
    void Promise.all([imageReady, pageReady, minimumDisplay]).then(reveal);

    return () => {
      cancelled = true;
      clearTimeout(minimumTimer);
      clearTimeout(safetyTimer);
      clearTimeout(finishTimer);
      window.removeEventListener("load", onLoad);
      image.onload = null;
      image.onerror = null;
      restore();
    };
  }, []);

  return (
    <div ref={screenRef} className="opening-screen" role="status" aria-label="Alfa Spor yükleniyor">
      {(["top", "bottom"] as const).map((half) => (
        <div key={half} className={`opening-panel opening-panel--${half}`} aria-hidden="true">
          <div className="opening-scene">
            <div className="opening-artwork">
              {/* Only the annulus rotates; the original logo and lettering stay still. */}
              <div className="opening-ring" />
            </div>
          </div>
        </div>
      ))}
      <noscript><style>{`.opening-screen { display: none !important; }`}</style></noscript>
    </div>
  );
}
