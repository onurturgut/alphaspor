"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const storageKey = "alfa-theme";

export function ThemeToggle() {
  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(storageKey);
      } catch {
        /* Storage may be disabled. */
      }
      document.documentElement.dataset.theme =
        saved === "dark" || saved === "light"
          ? saved
          : system.matches
            ? "dark"
            : "light";
    };
    sync();
    system.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      system.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Current-page switching still works. */
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="theme-to-light">
        <Sun size={19} aria-hidden="true" />
        <span className="theme-label">Aydınlık moda geç</span>
      </span>
      <span className="theme-to-dark">
        <Moon size={19} aria-hidden="true" />
        <span className="theme-label">Koyu moda geç</span>
      </span>
    </button>
  );
}
