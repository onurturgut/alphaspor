"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trophy,
} from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  archiveSeason,
  formatMatchDate,
  hasScore,
  isAlfa,
  matchOutcome,
  selectMatches,
  type Match,
} from "@/lib/matches";
import type { MatchSource } from "@/lib/content";
import "./utility.css";
import "./matches.css";

type MatchTab = "fixtures" | "results";

type MatchCenterProps = {
  teamOptions: { slug: string; name: string; season: string }[];
  matches: Match[];
  matchSources: MatchSource[];
  initialTeam?: string;
  initialSeason?: string;
  initialTab?: MatchTab;
};

type MatchFilters = {
  teamValue: string;
  season: string;
  tab: MatchTab;
};

const pageSize = 12;
const outcomeLabels = {
  win: "Galibiyet",
  draw: "Beraberlik",
  loss: "Mağlubiyet",
};

function MatchRow({ match }: { match: Match }) {
  const outcome = matchOutcome(match);
  const status =
    match.status === "awarded"
      ? "Hükmen"
      : match.status === "withdrawn"
        ? "Rakip ligden çıkarıldı"
        : hasScore(match)
          ? "Maç sona erdi"
          : "Sonuç açıklanmadı";
  return (
    <li className="match-row" data-match-id={match.id}>
      <div className="match-row__date">
        <span className="match-row__league">
          {match.league} <span>· {match.week}. hafta</span>
        </span>
        <time dateTime={match.date}>{formatMatchDate(match.date)}</time>
        <span>{match.time ?? "Saat belirtilmedi"}</span>
      </div>
      <div className="match-row__game">
        <div
          className={`match-row__team match-row__team--home ${isAlfa(match.homeTeam) ? "match-row__team--alfa" : ""}`}
        >
          <span className="match-row__side">EV SAHİBİ</span>
          <span>{match.homeTeam}</span>
        </div>
        <div className="match-row__score-wrap">
          <span
            className="match-row__score"
            aria-label={
              hasScore(match)
                ? `Skor ${match.homeScore} - ${match.awayScore}`
                : "Skor belirtilmedi"
            }
          >
            {hasScore(match) ? (
              <>
                {match.homeScore}
                <span>:</span>
                {match.awayScore}
              </>
            ) : (
              <span>—</span>
            )}
          </span>
          <span
            className={`match-row__status ${match.status === "awarded" ? "match-row__status--awarded" : ""}`}
          >
            {status}
          </span>
        </div>
        <div
          className={`match-row__team ${isAlfa(match.awayTeam) ? "match-row__team--alfa" : ""}`}
        >
          <span className="match-row__side">DEPLASMAN</span>
          <span>{match.awayTeam}</span>
        </div>
      </div>
      <div className="match-row__details">
        {outcome && (
          <span className={`match-row__outcome match-row__outcome--${outcome}`}>
            {outcomeLabels[outcome]}
          </span>
        )}
        <span className="match-row__venue">
          <MapPin size={13} aria-hidden="true" />
          {match.venue ?? "Saha belirtilmedi"}
        </span>
      </div>
      {match.note && <p className="match-row__note">{match.note}</p>}
    </li>
  );
}

export function MatchCenter({
  teamOptions,
  matches,
  matchSources,
  initialTeam,
  initialSeason,
  initialTab,
}: MatchCenterProps) {
  const teams = [
    { value: "all", label: "Tüm takımlar", slug: "" },
    ...teamOptions.map((t) => ({ value: t.slug, label: t.name, slug: t.slug })),
  ];
  const seasons = [
    ...new Set([
      archiveSeason,
      ...teamOptions.map((t) => t.season),
      ...matches.map((m) => m.season),
    ]),
  ]
    .sort()
    .reverse();
  const id = useId();
  const initial = teams.find(
    (team) =>
      team.value.toLowerCase() === initialTeam?.toLowerCase() ||
      team.slug === initialTeam,
  );
  const [filters, setFilters] = useState<MatchFilters>({
    teamValue: initial?.value ?? "all",
    season:
      initialSeason && seasons.includes(initialSeason)
        ? initialSeason
        : archiveSeason,
    tab: initialTab === "results" ? "results" : "fixtures",
  });
  const { teamValue, season, tab } = filters;
  const [page, setPage] = useState(1);
  const fixturesRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLButtonElement>(null);
  const listHeadingRef = useRef<HTMLDivElement>(null);
  const selectedTeam =
    teams.find((team) => team.value === teamValue) ?? teams[0];
  const teamDescription =
    selectedTeam.value === "all"
      ? "takımlarımızın"
      : `${selectedTeam.label} takımımızın`;
  const allMatches = selectMatches(matches, selectedTeam.slug, season);
  const resultCount = allMatches.filter(hasScore).length;
  const visibleMatches = selectMatches(
    matches,
    selectedTeam.slug,
    season,
    tab === "results",
  );
  const pageCount = Math.max(1, Math.ceil(visibleMatches.length / pageSize));
  const pageMatches = visibleMatches.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const sources = matchSources.filter(
    (source) => !selectedTeam.slug || source.teamSlug === selectedTeam.slug,
  );

  function changePage(nextPage: number) {
    setPage(nextPage);
    listHeadingRef.current?.focus({ preventScroll: true });
    listHeadingRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  }

  function updateFilters(changes: Partial<MatchFilters>) {
    const next = { ...filters, ...changes };
    const team =
      teams.find((item) => item.value === next.teamValue) ?? teams[0];
    const url = new URL(window.location.href);
    if (team.slug) url.searchParams.set("takim", team.slug);
    else url.searchParams.delete("takim");
    url.searchParams.set("sezon", next.season);
    url.searchParams.set(
      "gorunum",
      next.tab === "results" ? "sonuclar" : "fikstur",
    );
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    setFilters(next);
    setPage(1);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "fixtures"
        : event.key === "End"
          ? "results"
          : tab === "fixtures"
            ? "results"
            : "fixtures";
    updateFilters({ tab: next });
    (next === "fixtures" ? fixturesRef : resultsRef).current?.focus();
  }

  return (
    <section className="match-center" aria-label="Maç fikstürü ve sonuçları">
      <div className="match-center__toolbar">
        <div
          className="match-center__tabs"
          role="tablist"
          aria-label="Maç görünümü"
        >
          <button
            ref={fixturesRef}
            id={`${id}-fixtures-tab`}
            type="button"
            role="tab"
            aria-selected={tab === "fixtures"}
            aria-controls={`${id}-fixtures-panel`}
            tabIndex={tab === "fixtures" ? 0 : -1}
            onClick={() => updateFilters({ tab: "fixtures" })}
            onKeyDown={handleTabKey}
          >
            <CalendarDays size={17} aria-hidden="true" /> Fikstür
          </button>
          <button
            ref={resultsRef}
            id={`${id}-results-tab`}
            type="button"
            role="tab"
            aria-selected={tab === "results"}
            aria-controls={`${id}-results-panel`}
            tabIndex={tab === "results" ? 0 : -1}
            onClick={() => updateFilters({ tab: "results" })}
            onKeyDown={handleTabKey}
          >
            <Trophy size={17} aria-hidden="true" /> Sonuçlar
          </button>
        </div>

        <div className="match-center__filters">
          <div className="match-center__filter">
            <label htmlFor={`${id}-team`}>Takım</label>
            <div className="match-center__select-wrap">
              <select
                id={`${id}-team`}
                value={teamValue}
                onChange={(event) =>
                  updateFilters({ teamValue: event.target.value })
                }
              >
                {teams.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
          <div className="match-center__filter">
            <label htmlFor={`${id}-season`}>Sezon</label>
            <div className="match-center__select-wrap">
              <select
                id={`${id}-season`}
                value={season}
                onChange={(event) =>
                  updateFilters({ season: event.target.value })
                }
              >
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {season.replace("/", " / ")}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {(["fixtures", "results"] as const).map((panel) => (
        <div
          key={panel}
          id={`${id}-${panel}-panel`}
          className="match-center__panel"
          role="tabpanel"
          aria-labelledby={`${id}-${panel}-tab`}
          hidden={tab !== panel}
          tabIndex={0}
        >
          {tab === panel &&
            (visibleMatches.length > 0 ? (
              <>
                <div className="match-summary">
                  <div className="match-summary__intro">
                    <span className="micro">
                      {season.replace("/", " / ")} SEZONU
                    </span>
                    <h2>
                      {selectedTeam.value === "all"
                        ? "Sahadaki hikâyemiz."
                        : `${selectedTeam.label} karşılaşmaları.`}
                    </h2>
                    <p>
                      {panel === "fixtures"
                        ? "Sezonun tüm haftaları, tarih sırasıyla."
                        : "Skoru yayımlanan karşılaşmalar, en yeniden eskiye."}
                    </p>
                  </div>
                  <dl className="match-summary__stats">
                    <div>
                      <dt>Karşılaşma</dt>
                      <dd>{allMatches.length}</dd>
                    </div>
                    <div>
                      <dt>Yayımlanan skor</dt>
                      <dd>{resultCount}</dd>
                    </div>
                    <div>
                      <dt>Skoru belirtilmeyen</dt>
                      <dd>{allMatches.length - resultCount}</dd>
                    </div>
                  </dl>
                </div>
                <div
                  className="match-list-heading"
                  ref={listHeadingRef}
                  tabIndex={-1}
                >
                  <span>
                    {selectedTeam.value === "all"
                      ? "TÜM TAKIMLAR"
                      : selectedTeam.label}{" "}
                    · {panel === "results" ? "SONUÇLAR" : "FİKSTÜR"}
                  </span>
                  <span role="status" aria-live="polite">
                    {visibleMatches.length} karşılaşma · Sayfa {page} /{" "}
                    {pageCount}
                  </span>
                </div>
                <ol
                  className="match-list"
                  aria-label={
                    panel === "results" ? "Maç sonuçları" : "Sezon fikstürü"
                  }
                >
                  {pageMatches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </ol>
                {pageCount > 1 && (
                  <nav
                    className="match-pagination"
                    aria-label="Maç listesi sayfaları"
                  >
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => changePage(page - 1)}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      Önceki
                    </button>
                    <span>
                      {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, visibleMatches.length)} /{" "}
                      {visibleMatches.length} maç
                    </span>
                    <button
                      type="button"
                      disabled={page === pageCount}
                      onClick={() => changePage(page + 1)}
                    >
                      Sonraki
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="match-center__empty">
                <div className="match-center__empty-icon" aria-hidden="true">
                  {panel === "fixtures" ? (
                    <CalendarDays size={32} strokeWidth={1.3} />
                  ) : (
                    <Trophy size={32} strokeWidth={1.3} />
                  )}
                </div>
                <span className="match-center__season">
                  {season.replace("/", " / ")} SEZONU
                </span>
                <h3>
                  {panel === "fixtures"
                    ? "Bu sezon için fikstür bulunmuyor."
                    : "Sonuçlar henüz eklenmedi."}
                </h3>
                <p>
                  {panel === "fixtures"
                    ? `${teamDescription.charAt(0).toUpperCase()}${teamDescription.slice(1)} bu sezona ait maç takvimi yayınlandığında burada yer alacak.`
                    : `${teamDescription.charAt(0).toUpperCase()}${teamDescription.slice(1)} bu sezona ait doğrulanmış maç sonuçları burada paylaşılacak.`}
                </p>
                <div className="match-center__actions">
                  <Link
                    href={
                      selectedTeam.slug
                        ? `/takimlar/${selectedTeam.slug}`
                        : "/takimlar"
                    }
                  >
                    {selectedTeam.slug
                      ? "Takımı keşfet"
                      : "Takımlarımızı keşfet"}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link href="/iletisim">
                    Kulübe ulaşın
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      ))}
      {allMatches.length > 0 && (
        <details className="match-sources">
          <summary>
            Fikstür kaynakları ve sezon notu
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <p>
            Bu kayıtlar kulübümüzün yayımladığı fikstür görsellerinden
            aktarılmıştır. Sezon, karşılaşma tarihlerine göre 2025/2026 olarak
            sınıflandırılmıştır. Skoru açıklanmayan maçlar sonuçlara dahil
            edilmez. U14 karşılaşmaları U14 / U15 takım sayfasına bağlıdır.
          </p>
          <div className="match-sources__links">
            {sources.map((source) => (
              <div key={source.league}>
                <span>
                  {source.league} · {source.group} grubu
                </span>
                <a href={source.image} target="_blank" rel="noreferrer">
                  Fikstür görseli
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                <a href={source.page} target="_blank" rel="noreferrer">
                  Kulüp kaynağı
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </details>
      )}
      <div className="match-center__footnote">
        <span aria-hidden="true" />
        {allMatches.length > 0
          ? "Skorlar ev sahibi – deplasman sırasındadır. Galibiyet, beraberlik ve mağlubiyet Alfa Spor açısından gösterilir."
          : "Bu takım ve sezon için yayımlanmış maç kaydı bulunmuyor."}
      </div>
    </section>
  );
}

export default MatchCenter;
