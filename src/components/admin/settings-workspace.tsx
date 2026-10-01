"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Draft } from "./editor";
import { Field } from "./fields";

const sections = {
  home: "Ana sayfa",
  pages: "Diğer sayfalar",
  about: "Kulüp yazısı",
  contact: "İletişim bilgileri",
  gallery: "Galeri",
  heroVideo: "Video ve kapaklar",
};
const pages = {
  club: "Kulübümüz",
  teams: "Takımlar",
  news: "Haberler",
  matches: "Maçlar",
  contact: "İletişim",
};
export function SettingsWorkspace({
  draft,
  tab,
  onTab,
  page,
  onPage,
  children,
}: {
  draft: Draft;
  tab: string;
  onTab: (v: string) => void;
  page: string;
  onPage: (v: string) => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [device, setDevice] = useState("mobile");
  const [preview, setPreview] = useState<{
    source: string;
    draft: Draft;
    target: string;
    retry: number;
  } | null>(null);
  const [status, setStatus] = useState("Önizleme hazırlanıyor…");
  const [retry, setRetry] = useState(0);
  const target =
    tab === "pages"
      ? page
      : tab === "contact"
        ? "contact"
        : ["about", "gallery"].includes(tab)
          ? "club"
          : "home";
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("Önizleme güncelleniyor…");
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: draft }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!controller.signal.aborted) {
          setPreview({
            source: `/onizleme?page=${target}&revision=${result.id}`,
            draft,
            target,
            retry,
          });
          setStatus("Taslak önizlemesi · Henüz yayımlanmadı");
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setStatus(e instanceof Error ? e.message : "Önizleme yüklenemedi.");
      }
    }, 800);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [draft, target, retry]);
  const current =
    preview?.draft === draft &&
    preview.target === target &&
    preview.retry === retry;
  return (
    <div
      className={`admin-settings-workspace ${collapsed ? "is-collapsed" : ""}`}
    >
      <aside className="admin-settings-navigation">
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "Yönetim alanını daralt"}
        </button>
        {!collapsed && (
          <>
            <p className="admin-kicker">01 · SAYFA SEÇİMİ</p>
            <div
              className="admin-settings-sections"
              role="group"
              aria-label="Yönetim alanı"
            >
              {Object.entries(sections).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={tab === value}
                  onClick={() => onTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "pages" && (
              <Field
                label="Sayfa"
                value={page}
                onChange={onPage}
                options={Object.entries(pages).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            )}
            <p className="admin-help">
              Bir bölüm seçin, içeriği düzenleyin ve görünümü kontrol edin.
            </p>
          </>
        )}
      </aside>
      <section className="admin-settings-content">
        <p className="admin-kicker">02 · İÇERİĞİ DÜZENLE</p>
        {children}
      </section>
      <section className="admin-settings-preview">
        <p className="admin-kicker">03 · CANLI ÖNİZLEME</p>
        <div className="admin-preview-toolbar">
          {["mobile", "desktop"].map((d) => (
            <button
              type="button"
              key={d}
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
            >
              {d === "mobile" ? "Mobil" : "Masaüstü"}
            </button>
          ))}
          <button type="button" onClick={() => setRetry((n) => n + 1)}>
            Yenile
          </button>
        </div>
        <p className="admin-help" role="status">
          {!current && preview
            ? `Gösterilen önizleme önceki taslağa ait. ${status}`
            : status}
        </p>
        <div className={`admin-preview-viewport ${device}`}>
          {preview && (
            <iframe
              title={
                current
                  ? "Sitenin taslak önizlemesi"
                  : "Önceki taslağın önizlemesi"
              }
              src={preview.source}
            />
          )}
        </div>
      </section>
    </div>
  );
}
