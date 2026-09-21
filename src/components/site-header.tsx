"use client";

import { mediaUrl } from "@/lib/media";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
const links = [
  ["/", "Ana Sayfa"],
  ["/kulubumuz", "Kulübümüz"],
  ["/takimlar", "Takımlar"],
  ["/haberler", "Haberler"],
  ["/maclar", "Maçlar"],
  ["/iletisim", "İletişim"],
];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const pageRegions = Array.from(
      document.querySelectorAll<HTMLElement>("main, .site-footer"),
    );
    const previousInert = pageRegions.map((region) => region.inert);
    pageRegions.forEach((region) => {
      region.inert = true;
    });
    const desktop = window.matchMedia("(min-width: 1001px)");
    function handleResize() {
      if (desktop.matches) setOpen(false);
    }
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
            ".site-header a, .site-header button",
          ),
        ).filter((item) => item.getClientRects().length > 0);
        const current = items.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        if (e.shiftKey && current <= 0) {
          e.preventDefault();
          items.at(-1)?.focus();
        } else if (
          !e.shiftKey &&
          (current === items.length - 1 || current < 0)
        ) {
          e.preventDefault();
          items[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
      desktop.removeEventListener("change", handleResize);
      pageRegions.forEach((region, index) => {
        region.inert = previousInert[index];
      });
    };
  }, [open]);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link
          href="/"
          className="brand"
          aria-label="Fethiye Alfa Spor ana sayfa"
          onClick={() => setOpen(false)}
        >
          <Image
            src={mediaUrl("/media/logo.webp")}
            alt=""
            width={40}
            height={60}
            preload
          />
          <span>
            ALFA SPOR<small>FETHİYE · 2024</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Ana menü">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/iletisim#basvuru"
          className="button button-small nav-cta"
          onClick={() => setOpen(false)}
        >
          Başvuru Yap <ArrowUpRight size={15} />
        </Link>
        <ThemeToggle />
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobil menü">
          {links.map(([href, label], i) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight size={22} />
            </Link>
          ))}
          <Link
            className="button"
            href="/iletisim#basvuru"
            onClick={() => setOpen(false)}
          >
            Başvuru Yap <ArrowUpRight size={20} />
          </Link>
        </nav>
      )}
    </header>
  );
}
