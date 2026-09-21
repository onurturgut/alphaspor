"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Trophy,
  Users,
  Settings,
  Shield,
  LogOut,
  ArrowUpRight,
  Search,
  Plus,
} from "lucide-react";
import { sectionNames, type Section } from "@/lib/admin/schema";
import { Editor, type Draft, type TeamOption } from "./editor";
type View = Section | "overview" | "account";
const sections = Object.keys(sectionNames) as Section[];
const icons = {
  overview: LayoutDashboard,
  news: Newspaper,
  matches: Trophy,
  teams: Users,
  staff: Users,
  settings: Settings,
  account: Shield,
};
export function AdminPanel({ email, initialData }: { email: string; initialData: Partial<Record<Section, Draft[]>> }) {
  const router = useRouter();
  const [view, setView] = useState<View>("overview"),
    [data, setData] = useState<Partial<Record<Section, Draft[]>>>(initialData);
  const [editing, setEditing] = useState<Draft | null>(null),
    [dirty, setDirty] = useState(false),
    [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        sections.map(async (section) => {
          const response = await fetch(`/api/admin/data/${section}`, {
            cache: "no-store",
          });
          if (response.status === 401) {
            router.replace("/admin/giris"); router.refresh();
            throw new Error("Oturum sona erdi.");
          }
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          return [section, result.records] as const;
        }),
      );
      setData(Object.fromEntries(entries));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function leave() {
    return (
      !dirty ||
      confirm("Kaydedilmemiş değişiklikleriniz var. Çıkmak istiyor musunuz?")
    );
  }
  function changeView(next: View) {
    if (!leave()) return;
    setView(next);
    setEditing(null);
    setDirty(false);
    setQuery("");
    setPage(1);
    setMessage("");
    setError("");
  }
  const teams = (data.teams ?? []).map((t) => ({
    slug: t.slug!,
    name: t.name!,
    season: t.season!,
  })) satisfies TeamOption[];
  async function logout() {
    if (!leave()) return;
    const r = await fetch("/api/admin/logout", { method: "POST" });
    if (r.ok) { router.replace("/admin/giris"); router.refresh(); }
    else setError("Çıkış yapılamadı.");
  }
  function newRecord() {
    const base = {
      order:
        view === "news"
          ? Math.min(0, ...(data.news ?? []).map((r) => r.order ?? 0)) - 1
          : (data[view as Section]?.length ?? 0),
    };
    const defaults: Record<string, Draft> = {
      news: {
        ...base,
        title: "",
        category: "Kulüp",
        subtitle: "",
        body: "",
        image: "",
        published: false,
      },
      teams: {
        ...base,
        slug: "",
        name: "",
        season: "2026/2027",
        photo: "",
        photoAlt: "",
        players: [],
      },
      matches: {
        ...base,
        teamSlug: teams[0]?.slug ?? "",
        league: teams[0]?.name ?? "",
        season: teams[0]?.season ?? "2026/2027",
        week: 1,
        date: new Date().toISOString().slice(0, 10),
        time: null,
        homeTeam: "FETHİYE ALFA SPOR",
        awayTeam: "",
        homeScore: null,
        awayScore: null,
        status: "unreported",
        venue: null,
        note: null,
      },
      staff: { ...base, name: "", role: "", bio: "", photo: "" },
    };
    setEditing(defaults[view]);
    setDirty(false);
    setMessage("");
  }
  async function remove(record: Draft) {
    if (
      !confirm(
        `“${record.title || record.name || record.homeTeam || "Kayıt"}” silinsin mi? Siteden kaldırılacak.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/data/${view}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record._id, version: record._rev ?? null }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      await load();
      setMessage("Kayıt kaldırıldı.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Silinemedi.");
    } finally {
      setBusy(false);
    }
  }
  const records = (data[view as Section] ?? []).filter((r) =>
    `${r.title ?? ""} ${r.name ?? ""} ${r.category ?? ""} ${r.homeTeam ?? ""} ${r.awayTeam ?? ""} ${r.season ?? ""} ${r.date ?? ""}`
      .toLocaleLowerCase("tr")
      .includes(query.toLocaleLowerCase("tr")),
  );
  const shown = records.slice((page - 1) * 15, page * 15);
  const titles: Record<View, string> = {
    ...sectionNames,
    overview: "Genel bakış",
    account: "Hesabım",
  };
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          ALFA <span>YÖNETİM</span>
        </Link>
        <p className="admin-kicker">KULÜP PANELİ</p>
        <nav aria-label="Yönetim menüsü">
          {(
            [
              "overview",
              "news",
              "matches",
              "teams",
              "staff",
              "settings",
              "account",
            ] as View[]
          ).map((key) => {
            const Icon = icons[key];
            return (
              <button
                key={key}
                aria-current={view === key ? "page" : undefined}
                onClick={() => changeView(key)}
              >
                <Icon size={18} />
                {titles[key]}
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>{email}</span>
          <button onClick={() => void logout()}>
            <LogOut size={17} />
            Çıkış yap
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">FETHİYE ALFA SPOR</p>
            <h1>{titles[view]}</h1>
          </div>
          <Link href="/" target="_blank" className="admin-site-link">
            Siteyi görüntüle <ArrowUpRight size={17} />
          </Link>
        </header>
        {message && (
          <p className="admin-alert success" role="status">
            {message}
          </p>
        )}
        {error && (
          <div className="admin-alert error" role="alert">
            {error} <button onClick={() => void load()}>Yeniden dene</button>
          </div>
        )}
        {loading ? (
          <div className="admin-empty" role="status">
            İçerikler yükleniyor…
          </div>
        ) : (
          <>
            {view === "overview" && (
              <>
                <div className="admin-welcome">
                  <p className="admin-kicker">HER ŞEY BİR ARADA</p>
                  <h2>Kulübün hikâyesini güncel tutun.</h2>
                  <p>
                    Haber yayımlayın, maç sonuçlarını girin ve kadroları
                    düzenleyin.
                  </p>
                  <button
                    className="admin-primary"
                    onClick={() => {
                      changeView("news");
                    }}
                  >
                    Haberleri yönet <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="admin-stats">
                  {(["news", "teams", "matches", "staff"] as Section[]).map(
                    (key) => (
                      <button key={key} onClick={() => changeView(key)}>
                        <span>{sectionNames[key]}</span>
                        <strong>{data[key]?.length ?? 0}</strong>
                        <small>Düzenle →</small>
                      </button>
                    ),
                  )}
                </div>
                <div className="admin-overview-grid">
                  <div className="admin-card">
                    <h3>Hızlı erişim</h3>
                    <button onClick={() => changeView("settings")}>
                      Ana sayfa, galeri ve iletişim bilgileri →
                    </button>
                    <button onClick={() => changeView("teams")}>
                      Oyuncu ekle veya kadro düzenle →
                    </button>
                    <button onClick={() => changeView("matches")}>
                      Maç sonucu gir →
                    </button>
                  </div>
                  <div className="admin-card">
                    <h3>Yayın durumu</h3>
                    <p>
                      {data.news?.filter((n) => n.published !== false).length ??
                        0}{" "}
                      haber yayında
                    </p>
                    <p>
                      {data.news?.filter((n) => n.published === false).length ??
                        0}{" "}
                      haber taslakta
                    </p>
                    <p>
                      {data.teams?.reduce(
                        (n, t) => n + (t.players?.length ?? 0),
                        0,
                      ) ?? 0}{" "}
                      oyuncu kaydı
                    </p>
                  </div>
                </div>
              </>
            )}
            {view === "account" && (
              <form
                className="admin-card admin-account"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  if (form.get("password") !== form.get("confirm")) {
                    setError("Yeni şifreler eşleşmiyor.");
                    return;
                  }
                  setBusy(true);
                  try {
                    const r = await fetch("/api/admin/password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        current: form.get("current"),
                        password: form.get("password"),
                      }),
                    });
                    const result = await r.json();
                    if (!r.ok) throw new Error(result.error);
                    router.replace("/admin/giris"); router.refresh();
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Şifre değiştirilemedi.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h2>Şifrenizi değiştirin</h2>
                <p>{email}</p>
                <label>
                  Mevcut şifre
                  <input
                    type="password"
                    name="current"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label>
                  Yeni şifre
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={200}
                    required
                  />
                </label>
                <label>
                  Yeni şifre tekrar
                  <input
                    type="password"
                    name="confirm"
                    autoComplete="new-password"
                    minLength={12}
                    required
                  />
                </label>
                <p className="admin-help">
                  En az 12 karakter. Şifre değiştikten sonra yeniden giriş
                  yapın.
                </p>
                <button className="admin-primary" disabled={busy}>
                  {busy ? "Kaydediliyor…" : "Şifreyi değiştir"}
                </button>
              </form>
            )}
            {sections.includes(view as Section) &&
              (editing || view === "settings" ? (
                <Editor
                  key={`${view}:${editing?._id ?? "new"}`}
                  section={view as Section}
                  initial={editing ?? data.settings?.[0] ?? {}}
                  teams={teams}
                  onDirty={() => setDirty(true)}
                  onClose={() => {
                    if (leave()) {
                      setEditing(null);
                      setDirty(false);
                      if (view === "settings") setView("overview");
                    }
                  }}
                  onSaved={async () => {
                    setEditing(null);
                    setDirty(false);
                    await load();
                    setMessage("Değişiklikler kaydedildi.");
                  }}
                />
              ) : (
                <div className="admin-card admin-list">
                  <div className="admin-list-toolbar">
                    <div className="admin-search">
                      <Search size={17} />
                      <input
                        aria-label="Kayıtlarda ara"
                        placeholder="İçeriklerde ara…"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                    <button className="admin-primary" onClick={newRecord}>
                      <Plus size={17} />
                      {view === "news"
                        ? "Haber yaz"
                        : view === "teams"
                          ? "Takım ekle"
                          : view === "matches"
                            ? "Maç ekle"
                            : "Ekip üyesi ekle"}
                    </button>
                  </div>
                  <div className="admin-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>İçerik</th>
                          <th>Bilgi</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr key={r._id}>
                            <td>
                              <strong>
                                {r.title ||
                                  r.name ||
                                  `${r.homeTeam} — ${r.awayTeam}`}
                              </strong>
                              <small>
                                {view === "matches"
                                  ? `${r.date} · ${r.league} · ${r.week}. hafta`
                                  : r.subtitle || r.role || r.season}
                              </small>
                            </td>
                            <td>
                              {view === "news" ? (
                                <span
                                  className={`admin-badge ${r.published === false ? "draft" : ""}`}
                                >
                                  {r.published === false ? "Taslak" : "Yayında"}
                                </span>
                              ) : view === "teams" ? (
                                `${r.players?.length ?? 0} oyuncu`
                              ) : view === "matches" ? (
                                `${r.homeScore ?? "–"} : ${r.awayScore ?? "–"}`
                              ) : (
                                "Aktif"
                              )}
                            </td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  onClick={() => {
                                    setEditing(r);
                                    setDirty(false);
                                    setMessage("");
                                  }}
                                >
                                  Düzenle
                                </button>
                                <button
                                  className="admin-danger-text"
                                  disabled={busy}
                                  onClick={() => void remove(r)}
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!records.length && (
                    <p className="admin-empty">
                      Kayıt bulunamadı. Yeni bir içerik ekleyebilirsiniz.
                    </p>
                  )}
                  <div className="admin-pagination">
                    <span>{records.length} kayıt</span>
                    <div>
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Önceki
                      </button>
                      <span>
                        {page} / {Math.max(1, Math.ceil(records.length / 15))}
                      </span>
                      <button
                        disabled={page * 15 >= records.length}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </main>
    </div>
  );
}
