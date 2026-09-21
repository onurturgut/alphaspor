"use client";
import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { schemas, type Section } from "@/lib/admin/schema";
import { Field, MediaField, type FieldProps } from "./fields";
type Data = z.infer<typeof schemas.news> &
  z.infer<typeof schemas.teams> &
  z.infer<typeof schemas.matches> &
  z.infer<typeof schemas.staff> &
  z.infer<typeof schemas.settings>;
export type Draft = Partial<Data> & { _id?: string; _rev?: number };
export type TeamOption = { slug: string; name: string; season: string };

export function Editor({
  section,
  initial,
  teams,
  onClose,
  onSaved,
  onDirty,
}: {
  section: Section;
  initial: Draft;
  teams: TeamOption[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDirty: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false),
    [uploads, setUploads] = useState(0),
    [error, setError] = useState("");
  const [tab, setTab] = useState("home");
  const set = (key: keyof Draft, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
    onDirty();
  };
  const uploadBusy = (busy: boolean) =>
    setUploads((n) => Math.max(0, n + (busy ? 1 : -1)));
  function field(
    key: keyof Draft,
    label: string,
    options: Partial<FieldProps> = {},
  ) {
    return (
      <Field
        key={key}
        label={label}
        value={draft[key] as string | number | null}
        onChange={(value) =>
          set(
            key,
            options.type === "number"
              ? value === ""
                ? null
                : Number(value)
              : ["time", "venue", "note"].includes(key) && !value
                ? null
                : value,
          )
        }
        {...options}
      />
    );
  }
  function image(key: "image" | "photo", label: string) {
    return (
      <MediaField
        label={label}
        value={draft[key] ?? ""}
        onChange={(url) => set(key, url)}
        onBusy={uploadBusy}
      />
    );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (uploads || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/data/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft._id ?? null,
          version: draft._rev ?? null,
          data: draft,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await onSaved();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }
  const players = draft.players ?? [];
  const homeLabels: Record<string, string> = {
    eyebrow: "Üst etiket",
    title: "Ana başlık",
    titleAccent: "Başlık ikinci satır",
    description: "Hero açıklaması",
    primaryLabel: "Birinci buton",
    primaryHref: "Birinci buton bağlantısı",
    secondaryLabel: "İkinci buton",
    secondaryHref: "İkinci buton bağlantısı",
    aboutTitle: "Kulüp bölüm başlığı",
    aboutSubtitle: "Kulüp alt başlığı",
    teamsTitle: "Takımlar bölüm başlığı",
    newsTitle: "Haberler bölüm başlığı",
    staffTitle: "Teknik ekip bölüm başlığı",
    joinTitle: "Katılım başlığı",
    joinSubtitle: "Katılım alt başlığı",
    joinDescription: "Katılım açıklaması",
    resultsSeason: "Ana sayfa sonuç sezonu",
  };
  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="admin-editor-heading">
        <div>
          <p className="admin-kicker">
            {draft._id ? "İÇERİĞİ DÜZENLE" : "YENİ KAYIT"}
          </p>
          <h2>
            {section === "settings"
              ? "Sayfa ayarları"
              : draft.title ||
                draft.name ||
                (section === "matches" ? "Maç bilgileri" : "Yeni içerik")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving || uploads > 0}
        >
          ← Listeye dön
        </button>
      </div>
      <fieldset disabled={saving}>
        {section === "news" && (
          <div className="admin-form-grid">
            {field("title", "Haber başlığı", { required: true })}
            {field("category", "Kategori", {
              required: true,
              hint: "Örn. U11, Kulüp, Duyuru",
            })}
            {field("subtitle", "Kısa açıklama", { multiline: true })}
            {image("image", "Haber görseli")}
            {field("body", "Haber metni", {
              multiline: true,
              required: true,
              hint: "Paragrafları boş satırla ayırabilirsiniz.",
            })}
            {field("order", "Sıralama", {
              type: "number",
              hint: "Küçük sayılar önce gösterilir.",
            })}
            <label className="admin-check">
              <input
                type="checkbox"
                checked={draft.published !== false}
                onChange={(e) => set("published", e.target.checked)}
              />
              Sitede yayımla <small>Kapalıysa yalnızca panelde görünür.</small>
            </label>
          </div>
        )}
        {section === "teams" && (
          <>
            <div className="admin-form-grid">
              {field("name", "Takım adı", { required: true })}
              {field("slug", "URL kodu", {
                required: true,
                disabled: !!draft._id,
                hint: "Örn. u16 — oluşturduktan sonra değiştirilemez.",
              })}
              {field("season", "Sezon", { required: true, hint: "2026/2027" })}
              {field("order", "Sıralama", { type: "number" })}
              {image("photo", "Takım fotoğrafı")}
              {field("photoAlt", "Fotoğraf açıklaması")}
            </div>
            <div className="admin-section-heading">
              <h3>
                Oyuncular <span>{players.length}</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  set("players", [
                    ...players,
                    {
                      id: crypto.randomUUID(),
                      name: "",
                      position: "",
                      photo: "",
                      placeholder: false,
                    },
                  ])
                }
              >
                + Oyuncu ekle
              </button>
            </div>
            {!players.length && (
              <p className="admin-empty">Bu takımda henüz oyuncu yok.</p>
            )}
            {players.map((player, index) => (
              <div className="admin-subcard" key={player.id}>
                <div className="admin-section-heading">
                  <strong>
                    {index + 1}. {player.name || "Yeni oyuncu"}
                  </strong>
                  <button
                    type="button"
                    className="admin-danger-text"
                    onClick={() => {
                      if (
                        confirm(
                          "Oyuncuyu kadrodan kaldırmak istiyor musunuz? Kaydettiğinizde uygulanır.",
                        )
                      )
                        set(
                          "players",
                          players.filter((_, i) => i !== index),
                        );
                    }}
                  >
                    Kaldır
                  </button>
                </div>
                <div className="admin-form-grid">
                  <Field
                    label="Ad soyad"
                    value={player.name}
                    required
                    onChange={(name) =>
                      set(
                        "players",
                        players.map((p, i) =>
                          i === index ? { ...p, name } : p,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Mevki"
                    value={player.position}
                    required
                    onChange={(position) =>
                      set(
                        "players",
                        players.map((p, i) =>
                          i === index ? { ...p, position } : p,
                        ),
                      )
                    }
                  />
                  <MediaField
                    label="Oyuncu fotoğrafı"
                    value={player.photo}
                    onBusy={uploadBusy}
                    onChange={(photo) =>
                      set(
                        "players",
                        players.map((p, i) =>
                          i === index ? { ...p, photo } : p,
                        ),
                      )
                    }
                  />
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={player.placeholder}
                      onChange={(e) =>
                        set(
                          "players",
                          players.map((p, i) =>
                            i === index
                              ? { ...p, placeholder: e.target.checked }
                              : p,
                          ),
                        )
                      }
                    />
                    Temsili fotoğraf
                  </label>
                </div>
              </div>
            ))}
          </>
        )}
        {section === "matches" && (
          <div className="admin-form-grid">
            {field("teamSlug", "Takım", {
              required: true,
              options: [
                { value: "", label: "Takım seçin" },
                ...teams.map((t) => ({ value: t.slug, label: t.name })),
              ],
            })}
            {field("league", "Lig / yaş grubu", { required: true })}
            {field("season", "Sezon", { required: true, hint: "2026/2027" })}
            {field("week", "Hafta", { type: "number", required: true })}
            {field("date", "Tarih", { type: "date", required: true })}
            {field("time", "Saat", { type: "time" })}
            {field("homeTeam", "Ev sahibi", { required: true })}
            {field("awayTeam", "Deplasman", { required: true })}
            {field("status", "Maç durumu", {
              options: [
                { value: "unreported", label: "Skor açıklanmadı / oynanacak" },
                { value: "played", label: "Oynandı" },
                { value: "awarded", label: "Hükmen" },
                { value: "withdrawn", label: "Çekilme / iptal" },
              ],
            })}
            {field("homeScore", "Ev sahibi skoru", { type: "number" })}
            {field("awayScore", "Deplasman skoru", { type: "number" })}
            {field("venue", "Saha")}
            {field("note", "Maç notu", { multiline: true })}
          </div>
        )}
        {section === "staff" && (
          <div className="admin-form-grid">
            {field("name", "Ad soyad", { required: true })}
            {field("role", "Görev", { required: true })}
            {image("photo", "Ekip üyesi fotoğrafı")}
            {field("bio", "Biyografi", { multiline: true })}
            {field("order", "Sıralama", { type: "number" })}
          </div>
        )}
        {section === "settings" && (
          <>
            <nav className="admin-tabs" aria-label="Ayar bölümleri">
              {Object.entries({
                home: "Ana sayfa",
                pages: "Sayfa başlıkları",
                about: "Kulüp yazısı",
                contact: "İletişim",
                gallery: "Galeri",
                heroVideo: "Hero videosu",
              }).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-current={tab === key ? "page" : undefined}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === "home" && (
              <div className="admin-form-grid">
                {draft.home &&
                  Object.entries(draft.home).map(([key, value]) => (
                    <Field
                      key={key}
                      label={homeLabels[key] ?? key}
                      value={value}
                      multiline={key.toLowerCase().includes("description")}
                      onChange={(value) =>
                        set("home", { ...draft.home, [key]: value })
                      }
                    />
                  ))}
                <div className="wide">
                  <h3>Eğitim yaklaşımı</h3>
                  {draft.values?.map((value, index) => (
                    <div className="admin-subcard admin-form-grid" key={index}>
                      <Field
                        label="Başlık"
                        value={value.title}
                        onChange={(title) =>
                          set(
                            "values",
                            draft.values?.map((v, i) =>
                              i === index ? { ...v, title } : v,
                            ),
                          )
                        }
                      />
                      <Field
                        label="Açıklama"
                        value={value.text}
                        onChange={(text) =>
                          set(
                            "values",
                            draft.values?.map((v, i) =>
                              i === index ? { ...v, text } : v,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "pages" &&
              draft.pages &&
              Object.entries(draft.pages).map(([key, page]) => (
                <div className="admin-subcard" key={key}>
                  <h3>
                    {
                      {
                        club: "Kulübümüz",
                        teams: "Takımlar",
                        news: "Haberler",
                        matches: "Maçlar",
                        contact: "İletişim",
                      }[key]
                    }
                  </h3>
                  <div className="admin-form-grid">
                    {Object.entries(page).map(([field, value]) => (
                      <Field
                        key={field}
                        label={
                          {
                            title: "Başlık",
                            eyebrow: "Üst etiket",
                            description: "Açıklama",
                          }[field] ?? field
                        }
                        value={value}
                        multiline={field === "description"}
                        onChange={(value) =>
                          set("pages", {
                            ...draft.pages,
                            [key]: { ...page, [field]: value },
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            {tab === "about" &&
              field("about", "Hakkımızda / kulüp yazısı", {
                multiline: true,
                required: true,
              })}
            {tab === "contact" && (
              <div className="admin-form-grid">
                {draft.contact &&
                  Object.entries(draft.contact).map(([key, value]) => (
                    <Field
                      key={key}
                      label={
                        {
                          email: "E-posta",
                          phone: "Telefon",
                          address: "Adres",
                          hours: "Çalışma saatleri",
                          instagram: "Instagram bağlantısı",
                        }[key] ?? key
                      }
                      type={key === "email" ? "email" : "text"}
                      value={value}
                      onChange={(value) =>
                        set("contact", { ...draft.contact, [key]: value })
                      }
                    />
                  ))}
              </div>
            )}
            {tab === "gallery" && (
              <>
                <div className="admin-section-heading">
                  <h3>Kulüp galerisi</h3>
                  <button
                    type="button"
                    onClick={() =>
                      set("gallery", [
                        ...(draft.gallery ?? []),
                        {
                          id: crypto.randomUUID(),
                          src: "",
                          alt: "",
                          width: 1200,
                          height: 800,
                        },
                      ])
                    }
                  >
                    + Görsel ekle
                  </button>
                </div>
                {draft.gallery?.map((item, index) => (
                  <div className="admin-subcard" key={item.id}>
                    <div className="admin-section-heading">
                      <strong>Görsel {index + 1}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "Görseli galeriden kaldırmak istiyor musunuz?",
                            )
                          )
                            set(
                              "gallery",
                              draft.gallery?.filter((_, i) => i !== index),
                            );
                        }}
                      >
                        Kaldır
                      </button>
                    </div>
                    <MediaField
                      label="Galeri görseli"
                      value={item.src}
                      onBusy={uploadBusy}
                      onChange={(src, size) =>
                        set(
                          "gallery",
                          draft.gallery?.map((v, i) =>
                            i === index ? { ...v, src, ...(size ?? {}) } : v,
                          ),
                        )
                      }
                    />
                    <Field
                      label="Görsel açıklaması"
                      value={item.alt}
                      required
                      onChange={(alt) =>
                        set(
                          "gallery",
                          draft.gallery?.map((v, i) =>
                            i === index ? { ...v, alt } : v,
                          ),
                        )
                      }
                    />
                    <div className="admin-inline">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const items = [...(draft.gallery ?? [])];
                          [items[index - 1], items[index]] = [
                            items[index],
                            items[index - 1],
                          ];
                          set("gallery", items);
                        }}
                      >
                        ↑ Yukarı
                      </button>
                      <button
                        type="button"
                        disabled={index === (draft.gallery?.length ?? 0) - 1}
                        onClick={() => {
                          const items = [...(draft.gallery ?? [])];
                          [items[index + 1], items[index]] = [
                            items[index],
                            items[index + 1],
                          ];
                          set("gallery", items);
                        }}
                      >
                        ↓ Aşağı
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {tab === "heroVideo" && (
              <div className="admin-form-grid">
                {(["desktop", "mobile", "poster", "mobilePoster"] as const).map(
                  (key) => (
                    <MediaField
                      key={key}
                      label={
                        {
                          desktop: "Masaüstü videosu",
                          mobile: "Mobil video",
                          poster: "Masaüstü kapak",
                          mobilePoster: "Mobil kapak",
                        }[key]
                      }
                      value={draft.heroVideo?.[key] ?? ""}
                      video={key === "desktop" || key === "mobile"}
                      onBusy={uploadBusy}
                      onChange={(url) =>
                        set("heroVideo", {
                          desktop: "",
                          mobile: "",
                          poster: "",
                          mobilePoster: "",
                          ...draft.heroVideo,
                          [key]: url,
                        })
                      }
                    />
                  ),
                )}
              </div>
            )}
          </>
        )}
      </fieldset>
      {error && (
        <p className="admin-alert error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-savebar">
        <p>
          {uploads
            ? "Dosyanın yüklenmesi bekleniyor…"
            : "Kaydettiğiniz değişiklikler sitede hemen görünür."}
        </p>
        <button className="admin-primary" disabled={saving || uploads > 0}>
          {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </button>
      </div>
    </form>
  );
}
