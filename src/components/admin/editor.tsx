"use client";
import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { schemas, slugify, type Section } from "@/lib/admin/schema";
import { Field, MediaField, type FieldProps } from "./fields";
import { coachLicense } from "@/lib/coach-license";
import { PlayerProfileFields } from "./player-profile-fields";
import { MatchFields } from "./match-fields";
import { SettingsWorkspace } from "./settings-workspace";
import { CompetitionFields } from "./competition-fields";
import type { Competition, Opponent, Match } from "@/lib/matches";
import type { AcademyPlayer } from "@/lib/academy";
import { playerStats, playerAppearances } from "@/lib/academy";
import { withMatchAppearances } from "@/lib/matches";
type Data = z.infer<typeof schemas.competitions> &
  z.infer<typeof schemas.opponents> &
  z.infer<typeof schemas.news> &
  z.infer<typeof schemas.teams> &
  z.infer<typeof schemas.matches> &
  z.infer<typeof schemas.staff> &
  z.infer<typeof schemas.settings>;
export type Draft = Partial<Data> & { _id?: string; _rev?: number };
export type TeamOption = {
  slug: string;
  name: string;
  season: string;
  players: AcademyPlayer[];
};

export function Editor({
  section,
  initial,
  teams,
  competitions,
  opponents,
  matches,
  onClose,
  onSaved,
  onDirty,
  dirty,
}: {
  section: Section;
  initial: Draft;
  teams: TeamOption[];
  competitions: Competition[];
  opponents: Opponent[];
  matches: Match[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDirty: () => void;
  dirty: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(() =>
    section === "staff"
      ? { ...initial, license: coachLicense(initial) }
      : initial,
  );
  const [saving, setSaving] = useState(false),
    [uploads, setUploads] = useState(0),
    [error, setError] = useState("");
  const [tab, setTab] = useState("home");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");
  const [homeSection, setHomeSection] = useState("hero");
  const [selectedPage, setSelectedPage] = useState("club");
  const [customSlug, setCustomSlug] = useState(false);
  const set = (key: keyof Draft, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
    onDirty();
  };
  const update = (changes: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...changes }));
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
      const parsed = schemas[section].safeParse(draft);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.slice(0, 4)
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" · "));
      }
      const response = await fetch(`/api/admin/data/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft._id ?? null,
          version: draft._rev ?? null,
          data: parsed.data,
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
  const computedPlayers =
    section === "teams"
      ? withMatchAppearances(
          [{ slug: draft.slug ?? "", players }],
          matches.filter(
            (m) =>
              !m.competitionId ||
              competitions.some(
                (c) => c._id === m.competitionId && c.published,
              ),
          ),
        )[0].players
      : [];
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
              options: [
                ...new Set([
                  draft.category || "Kulüp",
                  "Kulüp",
                  "Duyuru",
                  "Ana sayfa",
                  "İletişim",
                  "Haberler",
                  "Maçlar",
                  "Teknik ekip",
                  ...teams.map((t) => t.name),
                ]),
              ].map((value) => ({ value, label: value })),
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
              {field("name", "Takım adı", {
                required: true,
                onChange: (name) => update({ name, ...(!draft._id && !customSlug ? { slug: slugify(name) } : {}) }),
              })}
              {field("slug", "URL kodu (slug)", {
                required: true,
                disabled: !!draft._id,
                onChange: (value) => { setCustomSlug(!!value); set("slug", value || slugify(draft.name ?? "")); },
                hint: `Takım adından otomatik oluşur. Adres: /takimlar/${slugify(draft.slug || "u-15")}. Kaydederken küçük harfe çevrilir; sonrasında değiştirilemez.`,
              })}
              {field("season", "Sezon", { required: true, hint: "2026/2027" })}
              {field("order", "Sıralama", { type: "number" })}
              {draft._id && (
                <>
                  {image("photo", "Takım fotoğrafı")}
                  {field("photoAlt", "Fotoğraf açıklaması")}
                </>
              )}
            </div>
            <div className="admin-section-heading">
              <h3>
                Oyuncular <span>{players.length}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  const id = crypto.randomUUID();
                  setSelectedPlayer(id);
                  set("players", [
                    ...players,
                    {
                      id,
                      name: "",
                      position: "",
                      photo: "",
                      placeholder: false,
                    },
                  ]);
                }}
              >
                + Oyuncu ekle
              </button>
            </div>
            {!players.length && (
              <p className="admin-empty">Bu takımda henüz oyuncu yok.</p>
            )}
            <div className="admin-roster-picker">
              <Field
                label="Oyuncu ara"
                value={playerQuery}
                onChange={setPlayerQuery}
              />
              <Field
                label="Düzenlenecek oyuncu"
                value={selectedPlayer || players[0]?.id || ""}
                onChange={setSelectedPlayer}
                options={players
                  .filter(
                    (p) =>
                      p.id === (selectedPlayer || players[0]?.id) ||
                      p.name
                        .toLocaleLowerCase("tr")
                        .includes(playerQuery.toLocaleLowerCase("tr")),
                  )
                  .map((p) => ({
                    value: p.id,
                    label:
                      (p.shirtNumber ? "#" + p.shirtNumber + " · " : "") +
                      (p.name || "Yeni oyuncu") +
                      " · " +
                      (p.position || "Mevki seçilmedi"),
                  }))}
              />
            </div>
            {players.map(
              (player, index) =>
                player.id === (selectedPlayer || players[0]?.id) && (
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
                          ) {
                            setSelectedPlayer("");
                            set(
                              "players",
                              players.filter((_, i) => i !== index),
                            );
                          }
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
                        options={[
                          ...new Set([
                            player.position,
                            "Kaleci",
                            "Stoper",
                            "Sağ bek",
                            "Sol bek",
                            "Orta saha",
                            "Sağ kanat",
                            "Sol kanat",
                            "Forvet",
                          ]),
                        ].map((value) => ({
                          value,
                          label: value || "Mevki seçin",
                        }))}
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
                    <PlayerProfileFields
                      player={player}
                      season={draft.season ?? ""}
                      onChange={(updated) =>
                        set(
                          "players",
                          players.map((p, i) => (i === index ? updated : p)),
                        )
                      }
                    />
                    {computedPlayers[index] && (
                      <p className="admin-stats-hint">
                        {(() => {
                          const stats = playerStats(
                            playerAppearances(
                              computedPlayers[index],
                              draft.season ?? "",
                            ),
                          );
                          return `Yayımlanan maç kayıtları dahil: ${stats.matches ?? "—"} maç · ${stats.goals ?? "—"} gol · ${stats.assists ?? "—"} asist · ${stats.minutes ?? "—"} dakika. Otomatik kayıtları Maçlar bölümünden düzenleyin; aynı maçı ayrıca elle eklemeyin.`;
                        })()}
                      </p>
                    )}
                  </div>
                ),
            )}
          </>
        )}
        {section === "matches" && (
          <MatchFields
            draft={draft}
            update={update}
            teams={teams}
            competitions={competitions}
            opponents={opponents}
            matches={matches}
          />
        )}
        {section === "opponents" && (
          <div className="admin-form-grid">
            {field("name", "Rakip takım adı", { required: true })}
            <div className="wide">
              <h3>Yaş grupları</h3>
              <p className="admin-help">
                Rakibin mücadele ettiği takımları seçin.
              </p>
              <div className="admin-roster-grid">
                {teams.map((t) => (
                  <label className="admin-check" key={t.slug}>
                    <input
                      type="checkbox"
                      checked={draft.teamSlugs?.includes(t.slug) ?? false}
                      onChange={(e) =>
                        set(
                          "teamSlugs",
                          e.target.checked
                            ? [...(draft.teamSlugs ?? []), t.slug]
                            : draft.teamSlugs?.filter(
                                (slug) => slug !== t.slug,
                              ),
                        )
                      }
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {section === "competitions" && (
          <CompetitionFields
            draft={draft}
            update={update}
            teams={teams}
            opponents={opponents}
            onGenerated={onSaved}
            canGenerate={JSON.stringify(draft) === JSON.stringify(initial)}
          />
        )}
        {section === "staff" && (
          <div className="admin-form-grid">
            {field("name", "Ad soyad", { required: true })}
            {field("license", "Antrenörlük lisansı (ör. UEFA A)")}
            {field("role", "Görev", { required: true })}
            {image("photo", "Ekip üyesi fotoğrafı")}
            {field("bio", "Biyografi", { multiline: true })}
            {field("order", "Sıralama", { type: "number" })}
          </div>
        )}
        {section === "settings" && (
          <>
            <SettingsWorkspace
              draft={draft}
              tab={tab}
              onTab={setTab}
              page={selectedPage}
              onPage={setSelectedPage}
            >
              {tab === "home" && (
                <div className="admin-form-grid">
                  <Field
                    label="Ana sayfa bölümü"
                    value={homeSection}
                    onChange={setHomeSection}
                    options={Object.entries({
                      hero: "Karşılama",
                      about: "Kulüp",
                      teams: "Takımlar",
                      news: "Haberler",
                      staff: "Teknik ekip",
                      join: "Katılım",
                      results: "Maç sonuçları",
                    }).map(([value, label]) => ({ value, label }))}
                  />
                  {draft.home &&
                    Object.entries(draft.home)
                      .filter(([key]) =>
                        (
                          ({
                            hero: [
                              "eyebrow",
                              "title",
                              "titleAccent",
                              "description",
                              "primaryLabel",
                              "primaryHref",
                              "secondaryLabel",
                              "secondaryHref",
                            ],
                            about: ["aboutTitle", "aboutSubtitle"],
                            teams: ["teamsTitle"],
                            news: ["newsTitle"],
                            staff: ["staffTitle"],
                            join: [
                              "joinTitle",
                              "joinSubtitle",
                              "joinDescription",
                            ],
                            results: ["resultsSeason"],
                          })[homeSection] ?? []
                        ).includes(key),
                      )
                      .map(([key, value]) => (
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
                  <div className="wide" hidden={homeSection !== "about"}>
                    <h3>Eğitim yaklaşımı</h3>
                    {draft.values?.map((value, index) => (
                      <div
                        className="admin-subcard admin-form-grid"
                        key={index}
                      >
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
                Object.entries(draft.pages)
                  .filter(([key]) => key === selectedPage)
                  .map(([key, page]) => (
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
                  {(
                    ["desktop", "mobile", "poster", "mobilePoster"] as const
                  ).map((key) => (
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
                  ))}
                </div>
              )}
            </SettingsWorkspace>
          </>
        )}
      </fieldset>
      <div className="admin-savebar">
        {error && <p className="admin-alert error" role="alert">{error}</p>}
        <p role="status" className={dirty ? "admin-unsaved" : ""}>
          {uploads
            ? "Dosyanın yüklenmesi bekleniyor…"
            : saving
              ? "Değişiklikler kaydediliyor…"
              : dirty
                ? "Kaydedilmemiş değişiklikleriniz var."
                : "Değişiklik yaptığınızda buradan kaydedin."}
        </p>
        <button className="admin-primary" disabled={saving || uploads > 0}>
          {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </button>
      </div>
    </form>
  );
}
