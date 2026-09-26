"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { FiMessageCircle } from "react-icons/fi";
import styles from "./quick-support.module.css";

export function QuickSupport({ instagram }: { instagram: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  let instagramUrl: string | undefined;
  try {
    const url = new URL(instagram);
    if (url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname)) instagramUrl = url.href;
  } catch {
    // Keep contact available when no Instagram profile is configured.
  }

  return (
    <div className={styles.support} ref={root}>
      <button
        className={styles.trigger}
        ref={trigger}
        type="button"
        aria-label={open ? "İletişim seçeneklerini kapat" : "İletişim seçeneklerini aç"}
        aria-expanded={open}
        aria-controls="quick-support-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <Image src="/media/support-wolf-transparent.png" alt="" width={88} height={88} sizes="(max-width: 600px) 72px, 88px" />
      </button>
      <nav id="quick-support-panel" className={styles.bubbles} hidden={!open} aria-label="İletişim seçenekleri">
        <Link className={styles.bubble} href="/iletisim" onClick={() => setOpen(false)}>
          <FiMessageCircle size={20} aria-hidden="true" />
          <span>Bizimle iletişime geç</span>
        </Link>
        {instagramUrl && (
          <a className={styles.bubble} href={instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} aria-label="Instagram hesabımızı ziyaret et (yeni sekmede açılır)">
            <FaInstagram size={20} aria-hidden="true" />
            <span>Instagram hesabımızı ziyaret et</span>
          </a>
        )}
      </nav>
    </div>
  );
}
