"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  CalendarDays,
  UserRound,
  Activity,
} from "lucide-react";
import { sectionNames, type Section } from "@/lib/admin/schema";
import { Editor, type Draft, type TeamOption } from "./editor";
import { UserManagement } from "./user-management";
import type { Competition, Opponent, Match } from "@/lib/matches";
type View = Section | "overview" | "account";
const sections = Object.keys(sectionNames) as Section[];
const icons = {
  overview: LayoutDashboard,
  news: Newspaper,
  matches: Trophy,
  competitions: Trophy,
  opponents: Shield,
  teams: Users,
  staff: Users,
  settings: Settings,
  account: Shield,
};
export function AdminPanel({
  email,
  role,
  initialData,
}: {
  email: string;
  role: "admin" | "editor";
  initialData: Partial<Record<Section, Draft[]>>;
}) {
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
  const [opponentTeam, setOpponentTeam] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [matchFilters, setMatchFilters] = useState({
    team: "",
    season: "",
    competition: "",
    week: "",
    status: "",
    published: "",
    from: "",
    to: "",
  });
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
            router.replace("/admin/giris");
            router.refresh();
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
    if (next === view) {
      setMenuOpen(false);
      return;
    }
    if (!leave()) return;
    setMenuOpen(false);
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
    players: t.players ?? [],
  })) satisfies TeamOption[];
  async function logout() {
    if (!leave()) return;
    const r = await fetch("/api/admin/logout", { method: "POST" });
    if (r.ok) {
      router.replace("/admin/giris");
      router.refresh();
    } else setError("Çıkış yapılamadı.");
  }
  function newRecord(target: Section = view as Section) {
    if (!leave()) return;
    const base = {
      order:
        target === "news"
          ? Math.min(0, ...(data.news ?? []).map((r) => r.order ?? 0)) - 1
          : (data[target]?.length ?? 0),
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
        kind: "official",
        published: false,
        report: null,
        venue: null,
        note: null,
      },
      opponents: {
        ...base,
        name: "",
        teamSlugs:
          opponentTeam && opponentTeam !== "unassigned" ? [opponentTeam] : [],
      },
      competitions: {
        ...base,
        name: "",
        teamSlug: teams[0]?.slug ?? "",
        season: teams[0]?.season ?? "2026/2027",
        kind: "official",
        clubName: "FETHİYE ALFA SPOR",
        opponentIds: [],
        duration: 90,
        starterCount: 11,
        allowReentry: false,
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        published: false,
      },
      staff: { ...base, name: "", role: "", bio: "", photo: "" },
    };
    setView(target);
    setMenuOpen(false);
    setEditing(defaults[target]);
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
  const records = (data[view as Section] ?? []).filter(
    (r) =>
      (view !== "opponents" ||
        !opponentTeam ||
        (opponentTeam === "unassigned"
          ? !r.teamSlugs?.length
          : r.teamSlugs?.includes(opponentTeam))) &&
      (view !== "matches" ||
        ((!matchFilters.team || r.teamSlug === matchFilters.team) &&
          (!matchFilters.season || r.season === matchFilters.season) &&
          (!matchFilters.competition ||
            r.competitionId === matchFilters.competition) &&
          (!matchFilters.week || String(r.week ?? "") === matchFilters.week) &&
          (!matchFilters.status || r.status === matchFilters.status) &&
          (!matchFilters.published ||
            (r.published !== false) === (matchFilters.published === "yes")) &&
          (!matchFilters.from || (r.date ?? "") >= matchFilters.from) &&
          (!matchFilters.to || (r.date ?? "") <= matchFilters.to))) &&
      `${r.title ?? ""} ${r.name ?? ""} ${r.category ?? ""} ${r.homeTeam ?? ""} ${r.awayTeam ?? ""} ${r.season ?? ""} ${r.date ?? ""} ${r.league ?? ""} ${r.teamSlug ?? ""}`
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")),
  );
  const shown = records.slice((page - 1) * 15, page * 15);
  const matchGroups = shown.reduce<
    { key: string; label: string; records: Draft[] }[]
  >((groups, record) => {
    const isLeagueMatch = (record.kind ?? "official") === "official";
    const key = isLeagueMatch ? `week-${record.week ?? 0}` : "other";
    const label = isLeagueMatch
      ? `${record.week ?? "—"}. Hafta`
      : "Diğer karşılaşmalar";
    const group = groups.find((item) => item.key === key);
    if (group) group.records.push(record);
    else groups.push({ key, label, records: [record] });
    return groups;
  }, []);
  async function publishPage() {
    const drafts = shown.filter((m) => m.published === false);
    if (
      !drafts.length ||
      !confirm(`Bu sayfadaki ${drafts.length} taslak maç yayımlansın mı?`)
    )
      return;
    setBusy(true);
    setError("");
    let completed = 0,
      failure = "";
    try {
      for (const record of drafts) {
        const response = await fetch("/api/admin/data/matches", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: record._id,
            version: record._rev ?? null,
            data: { ...record, published: true },
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        completed++;
      }
    } catch (error) {
      failure =
        error instanceof Error ? error.message : "Yayınlama tamamlanamadı.";
    }
    await load();
    setMessage(`${completed} maç yayımlandı.`);
    setError(failure);
    setBusy(false);
  }
  const titles: Record<View, string> = {
    ...sectionNames,
    overview: "Çalışma masası",
    account: "Hesabım",
  };
  const descriptions: Record<View, string> = {
    overview: "Kulübünüzün günlük işlemlerine buradan başlayın.",
    news: "Haberlerinizi hazırlayın, düzenleyin ve yayımlayın.",
    matches: "Fikstürü takip edin, skorları ve maç kadrolarını güncelleyin.",
    competitions: "Ligleri, sezonları ve puanlama kurallarını yönetin.",
    opponents: "Rakipleri yaş gruplarına göre düzenleyin.",
    teams: "Takım bilgilerini ve oyuncu kadrolarını güncelleyin.",
    staff: "Antrenörleri ve teknik ekip bilgilerini düzenleyin.",
    settings: "Sayfa içeriklerini düzenleyin, kaydetmeden önce önizleyin.",
    account: "Hesabınızı ve erişim ayarlarınızı yönetin.",
  };
  const navigation: { label: string; items: View[] }[] = [
    { label: "ÇALIŞMA ALANI", items: ["overview", "news", "settings"] },
    {
      label: "SPORTİF YÖNETİM",
      items: ["matches", "teams", "competitions", "opponents", "staff"],
    },
    { label: "HESAP", items: ["account"] },
  ];
  const publishedNews =
    data.news?.filter((item) => item.published !== false).length ?? 0;
  const draftNews =
    data.news?.filter((item) => item.published === false).length ?? 0;
  const playerCount =
    data.teams?.reduce(
      (count, team) => count + (team.players?.length ?? 0),
      0,
    ) ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingMatches =
    data.matches?.filter(
      (match) =>
        match.status === "unreported" && (match.date ?? "") >= today,
    ).length ?? 0;
  const selectedMatchCompetition = (data.competitions ?? []).find(
    (competition) => competition._id === matchFilters.competition,
  );
  const showMatchWeekFilter =
    selectedMatchCompetition?.kind === "official" ||
    selectedMatchCompetition?.kind === "tournament";
  const matchWeekOptions = [
    ...new Set(
      (data.matches ?? [])
        .filter(
          (match) => match.competitionId === selectedMatchCompetition?._id,
        )
        .map((match) => Number(match.week))
        .filter((week) => Number.isInteger(week) && week > 0),
    ),
  ].sort((a, b) => a - b);
  return (
    <div
      className={`admin-shell ${menuOpen ? "menu-open" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          href="/admin"
          onClick={(event) => {
            event.preventDefault();
            changeView("overview");
          }}
        >
          <Image
            className="admin-brand-logo"
            src="/media/logo.webp"
            alt=""
            width={30}
            height={40}
          />
          <span className="admin-brand-word">ALFA</span>
          <span className="admin-brand-section">YÖNETİM</span>
        </Link>
        <button
          type="button"
          className="admin-sidebar-toggle"
          aria-label={
            sidebarCollapsed
              ? "Çalışma alanı menüsünü genişlet"
              : "Çalışma alanı menüsünü daralt"
          }
          aria-expanded={!sidebarCollapsed}
          onClick={() => setSidebarCollapsed((value) => !value)}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
        <button
          className="admin-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="admin-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}{" "}
          {menuOpen ? "Menüyü kapat" : "Menü"}
        </button>
        <nav id="admin-navigation" aria-label="Yönetim menüsü">
          {navigation.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p className="admin-nav-label">{group.label}</p>
              {group.items.map((key) => {
                const Icon = icons[key];
                return (
                  <button
                    key={key}
                    title={sidebarCollapsed ? titles[key] : undefined}
                    aria-current={view === key ? "page" : undefined}
                    onClick={() => changeView(key)}
                  >
                    <Icon size={18} />
                    <span>{titles[key]}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>{email}</span>
          <button onClick={() => void logout()}>
            <LogOut size={17} />
            <span>Çıkış yap</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">FETHİYE ALFA SPOR</p>
            <h1>{titles[view]}</h1>
            <p className="admin-page-description">{descriptions[view]}</p>
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
                <div className="admin-commandbar" aria-label="Hızlı işlemler">
                  <button
                    className="admin-primary"
                    onClick={() => newRecord("news")}
                  >
                    <Plus size={16} /> Haber ekle
                  </button>
                  <button onClick={() => newRecord("matches")}>
                    <Plus size={16} /> Maç ekle
                  </button>
                  <button onClick={() => changeView("teams")}>
                    <Users size={16} /> Kadrolar
                  </button>
                  <button onClick={() => changeView("settings")}>
                    <Settings size={16} /> Siteyi düzenle
                  </button>
                </div>
                <div className="admin-metrics" aria-label="Kulüp özeti">
                  <article className="admin-metric-card">
                    <span className="admin-metric-icon">
                      <FileText size={24} />
                    </span>
                    <div>
                      <p>YAYINDAKİ HABERLER</p>
                      <strong>{publishedNews}</strong>
                      <span>Güncel içerikler</span>
                    </div>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-metric-icon">
                      <CalendarDays size={24} />
                    </span>
                    <div>
                      <p>YAKLAŞAN MAÇLAR</p>
                      <strong>{upcomingMatches}</strong>
                      <span>Programdaki karşılaşmalar</span>
                    </div>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-metric-icon">
                      <UserRound size={24} />
                    </span>
                    <div>
                      <p>TOPLAM OYUNCU</p>
                      <strong>{playerCount}</strong>
                      <span>{data.teams?.length ?? 0} takım kadrosu</span>
                    </div>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-metric-icon">
                      <Activity size={24} />
                    </span>
                    <div>
                      <p>BEKLEYEN TASLAKLAR</p>
                      <strong>{draftNews}</strong>
                      <span>Yayınlanmayı bekliyor</span>
                    </div>
                  </article>
                </div>
                <div className="admin-statusline admin-statusline-legacy">
                  <span>
                    <strong>
                      {data.news?.filter((n) => n.published !== false).length ??
                        0}
                    </strong>{" "}
                    haber yayında
                  </span>
                  <span>
                    <strong>
                      {data.news?.filter((n) => n.published === false).length ??
                        0}
                    </strong>{" "}
                    haber taslakta
                  </span>
                  <span>
                    <strong>
                      {data.teams?.reduce(
                        (count, team) => count + (team.players?.length ?? 0),
                        0,
                      ) ?? 0}
                    </strong>{" "}
                    oyuncu
                  </span>
                </div>
                <section className="admin-desk-section">
                  <div className="admin-desk-heading">
                    <h2>İçerik ve kulüp yönetimi</h2>
                    <span>Bölüm seçin, düzenlemeye başlayın</span>
                  </div>
                  <div className="admin-directory">
                    {(
                      [
                        "news",
                        "matches",
                        "teams",
                        "competitions",
                        "opponents",
                        "staff",
                        "settings",
                      ] as Section[]
                    ).map((key) => {
                      const Icon = icons[key];
                      return (
                        <button
                          className="admin-directory-row"
                          key={key}
                          onClick={() => changeView(key)}
                        >
                          <Icon size={19} />
                          <span className="admin-directory-name">
                            {titles[key]}
                          </span>
                          <span className="admin-directory-description">
                            {descriptions[key]}
                          </span>
                          <span className="admin-directory-count">
                            {key === "settings"
                              ? "Site içeriği"
                              : `${data[key]?.length ?? 0} kayıt`}
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section className="admin-desk-section">
                  <div className="admin-desk-heading">
                    <h2>Haberler</h2>
                    <button onClick={() => changeView("news")}>
                      Tüm haberler <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="admin-news-register">
                    {(data.news ?? []).slice(0, 5).map((record) => (
                      <button
                        key={record._id}
                        onClick={() => {
                          changeView("news");
                          setEditing(record);
                        }}
                      >
                        <span className="admin-register-title">
                          {record.title}
                          <small>{record.category}</small>
                        </span>
                        <span
                          className={`admin-register-status ${record.published === false ? "is-draft" : ""}`}
                        >
                          {record.published === false ? "Taslak" : "Yayında"}
                        </span>
                        <span className="admin-register-edit">Düzenle →</span>
                      </button>
                    ))}
                    {!data.news?.length && (
                      <p className="admin-empty">
                        Henüz haber yok. Üstteki Haber ekle düğmesiyle başlayın.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}
            {view === "account" && role === "admin" && (
              <UserManagement onDirtyChange={setDirty} />
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
                    router.replace("/admin/giris");
                    router.refresh();
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
                  competitions={(data.competitions ?? []) as Competition[]}
                  opponents={(data.opponents ?? []) as Opponent[]}
                  matches={
                    (data.matches ?? []).map((m) => ({
                      ...m,
                      id: m._id!,
                    })) as Match[]
                  }
                  onDirty={() => setDirty(true)}
                  dirty={dirty}
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
                    <button
                      className="admin-primary"
                      onClick={() => newRecord()}
                    >
                      <Plus size={17} />
                      {view === "news"
                        ? "Haber yaz"
                        : view === "teams"
                          ? "Takım ekle"
                          : view === "matches"
                            ? "Maç ekle"
                            : view === "opponents"
                              ? "Rakip ekle"
                              : view === "competitions"
                                ? "Organizasyon ekle"
                                : "Ekip üyesi ekle"}
                    </button>
                    {view === "matches" && (
                      <button
                        disabled={
                          busy || !shown.some((m) => m.published === false)
                        }
                        onClick={() => void publishPage()}
                      >
                        {busy
                          ? "Yayımlanıyor…"
                          : "Bu sayfadaki taslakları yayımla"}
                      </button>
                    )}
                  </div>
                  {view === "matches" && (
                    <div className="admin-match-filters">
                      {(
                        [
                          ["team", "Takım", teams.map((t) => [t.slug, t.name])],
                          [
                            "season",
                            "Sezon",
                            [
                              ...new Set(
                                (data.matches ?? []).map((m) => m.season!),
                              ),
                            ]
                              .sort()
                              .reverse()
                              .map((s) => [s, s]),
                          ],
                          [
                            "competition",
                            "Organizasyon",
                            (data.competitions ?? []).map((c) => [
                              c._id!,
                              c.name + " · " + c.season,
                            ]),
                          ],
                          [
                            "status",
                            "Durum",
                            [
                              ["unreported", "Oynanacak"],
                              ["played", "Oynandı"],
                              ["awarded", "Hükmen"],
                              ["withdrawn", "İptal"],
                            ],
                          ],
                          [
                            "published",
                            "Yayın",
                            [
                              ["yes", "Yayında"],
                              ["no", "Taslak"],
                            ],
                          ],
                        ] as [keyof typeof matchFilters, string, string[][]][]
                      ).map(([key, label, options]) => (
                        <label key={key}>
                          {label}
                          <select
                            value={matchFilters[key]}
                            onChange={(e) => {
                              setMatchFilters((f) => ({
                                ...f,
                                [key]: e.target.value,
                                ...(key === "competition" ? { week: "" } : {}),
                              }));
                              setPage(1);
                            }}
                          >
                            <option value="">Tümü</option>
                            {options.map(([value, text]) => (
                              <option key={value} value={value}>
                                {text}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                      {showMatchWeekFilter && (
                        <label>
                          Hafta
                          <select
                            value={matchFilters.week}
                            onChange={(e) => {
                              setMatchFilters((filters) => ({
                                ...filters,
                                week: e.target.value,
                              }));
                              setPage(1);
                            }}
                          >
                            <option value="">Tüm haftalar</option>
                            {matchWeekOptions.map((week) => (
                              <option key={week} value={week}>
                                {week}. Hafta
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {(["from", "to"] as const).map((key) => (
                        <label key={key}>
                          {key === "from" ? "İlk tarih" : "Son tarih"}
                          <input
                            type="date"
                            value={matchFilters[key]}
                            onChange={(e) => {
                              setMatchFilters((f) => ({
                                ...f,
                                [key]: e.target.value,
                              }));
                              setPage(1);
                            }}
                          />
                        </label>
                      ))}
                      <button
                        onClick={() => {
                          setMatchFilters({
                            team: "",
                            season: "",
                            competition: "",
                            week: "",
                            status: "",
                            published: "",
                            from: "",
                            to: "",
                          });
                          setQuery("");
                          setPage(1);
                        }}
                      >
                        Filtreleri temizle
                      </button>
                    </div>
                  )}
                  {view === "opponents" && (
                    <label className="admin-filter-bar">
                      Yaş grubuna göre filtrele
                      <select
                        value={opponentTeam}
                        onChange={(e) => {
                          setOpponentTeam(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="">Tüm yaş grupları</option>
                        <option value="unassigned">Atanmamış</option>
                        {teams.map((t) => (
                          <option key={t.slug} value={t.slug}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {view === "news" ? (
                    <div className="admin-news-grid">
                      {shown.map((r) => (
                        <article className="admin-news-card" key={r._id}>
                          <div className="admin-news-card-visual">
                            <Image
                              src={r.image || "/media/logo.webp"}
                              alt={r.image ? `${r.title ?? "Haber"} görseli` : "Alfa Spor logosu"}
                              fill
                              sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <div className="admin-news-card-body">
                            <div className="admin-news-card-meta">
                              <span>{r.category || "Genel"}</span>
                              <span
                                className={`admin-badge ${r.published === false ? "draft" : ""}`}
                              >
                                {r.published === false ? "Taslak" : "Yayında"}
                              </span>
                            </div>
                            <h3>{r.title || "Başlıksız haber"}</h3>
                            <p>{r.subtitle || r.body || "Henüz açıklama eklenmedi."}</p>
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
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : view === "matches" ? (
                    <div className="admin-match-groups">
                      {matchGroups.map((group) => (
                        <section className="admin-match-week" key={group.key}>
                          <div className="admin-match-week-heading">
                            <h3>{group.label}</h3>
                            <span>{group.records.length} karşılaşma</span>
                          </div>
                          <div className="admin-table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  <th>Karşılaşma</th>
                                  <th>Bilgi</th>
                                  <th>İşlemler</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.records.map((r) => (
                                  <tr key={r._id}>
                                    <td data-label="Karşılaşma">
                                      <strong>{r.homeTeam} — {r.awayTeam}</strong>
                                      <small>{r.date} · {r.league}</small>
                                    </td>
                                    <td data-label="Bilgi">
                                      {r.homeScore ?? "–"} : {r.awayScore ?? "–"} · {r.published === false ? "Taslak" : "Yayında"}
                                    </td>
                                    <td data-label="İşlemler">
                                      <div className="admin-row-actions">
                                        <button onClick={() => { setEditing(r); setDirty(false); setMessage(""); }}>Düzenle</button>
                                        <button className="admin-danger-text" disabled={busy} onClick={() => void remove(r)}>Sil</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
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
                            <td data-label="İçerik">
                              <strong>
                                {r.title ||
                                  r.name ||
                                  `${r.homeTeam} — ${r.awayTeam}`}
                              </strong>
                              <small>
                                {view === "opponents"
                                  ? r.teamSlugs
                                      ?.map(
                                        (slug) =>
                                          teams.find((t) => t.slug === slug)
                                            ?.name ?? slug,
                                      )
                                      .join(" · ") || "Yaş grubu atanmamış"
                                  : r.subtitle || r.role || r.season}
                              </small>
                            </td>
                            <td data-label="Bilgi">
                              {view === "teams" ? (
                                `${r.players?.length ?? 0} oyuncu`
                              ) : (
                                "Aktif"
                              )}
                            </td>
                            <td data-label="İşlemler">
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
                  )}
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
