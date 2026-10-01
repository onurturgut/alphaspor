"use client";

import { useEffect, useRef } from "react";
import "./opening-screen.css";

const artwork = "/media/club/opening-mobile.webp";

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
      finishTimer = setTimeout(finish, reducedMotion ? 0 : 450);
    };

    const image = new window.Image();
    const imageReady = new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = window.matchMedia("(min-width: 768px) and (orientation: landscape)").matches
        ? "/media/club/opening-desktop-wide.webp"
        : artwork;
    });
    // Unrelated page resources must not hold the intro open after hydration.
    const safetyTimer = setTimeout(reveal, 1200);
    if (reducedMotion) finish();
    else void imageReady.then(reveal);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      clearTimeout(finishTimer);
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
