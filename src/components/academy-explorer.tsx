"use client";

import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  UserRound,
  MapPin,
  Trophy,
  Crosshair,
  Target,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import {
  footLabels,
  matchKinds,
  playerAppearances,
  playerStats,
  positionZone,
  type AcademyPlayer,
  type AcademyTeam,
} from "@/lib/academy";
import styles from "./academy-explorer.module.css";

const cardBrush = localFont({
  src: "../../public/fonts/permanent-marker.ttf",
  display: "swap",
  variable: "--font-card-brush",
});
const cardCondensed = localFont({
  src: [
    { path: "../../public/fonts/barlow-condensed-regular.ttf", weight: "400" },
    { path: "../../public/fonts/barlow-condensed-bold.ttf", weight: "700" },
  ],
  display: "swap",
  variable: "--font-card-condensed",
});

function Portrait({
  player,
  large = false,
}: {
  player: AcademyPlayer;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return player.photo && !player.placeholder && !failed ? (
    <Image
      src={player.photo}
      alt=""
      fill
      sizes={large ? "(max-width: 700px) 240px, 260px" : "64px"}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={styles.portraitFallback}>
      <UserRound aria-hidden="true" size={large ? 68 : 22} />
      {large && <small>Fotoğraf hazırlanıyor</small>}
    </span>
  );
}

const formatNumber = (value: number | null, decimal = false) =>
  value === null
    ? "—"
    : value.toLocaleString("tr-TR", { maximumFractionDigits: decimal ? 2 : 0 });
const profileTabs = ["Genel bakış", "İstatistikler", "Maç geçmişi", "Gelişim"];
const mobilePanels = ["Oyuncu", "Saha", "Kadro"];

function arrowNavigation(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  count: number,
  select: (index: number) => void,
) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? count - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
  select(next);
  (
    event.currentTarget.parentElement?.children[next] as HTMLButtonElement
  )?.focus();
}

export function AcademyExplorer({
  teams,
  initialTeam,
}: {
  teams: AcademyTeam[];
  initialTeam?: string;
}) {
  const team =
    teams.find((item) => item.slug === initialTeam) ??
    teams.find((item) => item.players.length) ??
    teams[0];
  const id = useId();
  const playerTabRef = useRef<HTMLButtonElement>(null);
  const [selectedId, setSelectedId] = useState(
    team?.players.find((p) => !p.placeholder)?.id ?? team?.players[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [season, setSeason] = useState(team?.season ?? "");
  const [kind, setKind] = useState("all");
  const [tab, setTab] = useState(0);
  const [mobile, setMobile] = useState(0);
  if (!team)
    return (
      <div className={styles.empty}>
        <h1>Takımlarımız hazırlanıyor.</h1>
        <Link href="/iletisim">Bize ulaşın</Link>
      </div>
    );
  const player =
    team.players.find((p) => p.id === selectedId) ?? team.players[0];
  const seasons = [
    ...new Set([
      team.season,
      ...team.players.flatMap((p) =>
        (p.appearances ?? []).map((row) => row.season),
      ),
    ]),
  ]
    .sort()
    .reverse();
  const filtered = team.players.filter(
    (p) =>
      `${p.name} ${p.position}`
        .toLocaleLowerCase("tr-TR")
        .includes(query.toLocaleLowerCase("tr-TR").trim()) &&
      (zoneFilter === "all" || positionZone(p.position).key === zoneFilter),
  );
  const rows = player ? playerAppearances(player, season, kind) : [];
  const stats = playerStats(rows);
  const zone = positionZone(player?.position ?? "");
  const nameParts = player?.name.trim().split(/\s+/) ?? [];
  const surname = nameParts.length > 1 ? nameParts.at(-1) : "";
  const givenName = (surname ? nameParts.slice(0, -1) : nameParts).join(" ");

  function choose(next: AcademyPlayer) {
    setSelectedId(next.id);
    setMobile(0);
    if (window.matchMedia("(max-width: 700px)").matches)
      playerTabRef.current?.focus();
  }
  function move(direction: number) {
    const index = team.players.findIndex((p) => p.id === player.id);
    choose(
      team.players[
        (index + direction + team.players.length) % team.players.length
      ],
    );
  }

  return (
    <div className={styles.academy}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>FETHİYE ALFA SPOR / AKADEMİ</p>
          <h1>
            Aynı arma. <span>Farklı hikâyeler.</span>
          </h1>
          <p>
            Her antrenman yeni bir adım, her takım arkadaşı yeni bir güç.
            Birlikte öğreniyor, emek veriyor ve kendi hikâyemizi yazıyoruz.
            Takımını keşfet, bu yolculuğun bir parçası ol.
          </p>
        </div>
        <Link href="/iletisim#basvuru" className={styles.joinLink}>
          Bu takımda sen de ol <ArrowUpRight size={18} />
        </Link>
      </header>

      <div className={styles.toolbar}>
        <nav aria-label="Yaş grubu seçimi" className={styles.teamTabs}>
          {teams.map((item) => (
            <Link
              key={item.slug}
              href={`/takimlar/${item.slug}`}
              aria-current={item.slug === team.slug ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <label className={styles.season}>
          <CalendarDays size={16} aria-hidden="true" />
          <span>Sezon</span>
          <select
            aria-label="İstatistik sezonu"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            {seasons.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      {!player ? (
        <section className={styles.empty}>
          <Users size={36} />
          <h2>{team.name} kadrosu hazırlanıyor.</h2>
          <p>
            Yeni sezon oyuncularımız yakında burada. Akademimiz hakkında bilgi
            almak için bize ulaşın.
          </p>
          <Link className="button" href="/iletisim#basvuru">
            Aramıza katıl <ArrowUpRight size={18} />
          </Link>
        </section>
      ) : (
        <>
          <div className={styles.context}>
            <span>
              <Users size={16} /> {team.name} TAKIMI{" "}
              <b>{team.players.length} oyuncu</b>
            </span>
            <span>Birlikte öğrenir, birlikte gelişiriz.</span>
          </div>
          <div
            className={styles.mobileTabs}
            role="tablist"
            aria-label="Takım görünümü"
          >
            {mobilePanels.map((label, index) => (
              <button
                key={label}
                ref={index === 0 ? playerTabRef : undefined}
                role="tab"
                id={`${id}-mobile-${index}`}
                aria-selected={mobile === index}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={mobile === index ? 0 : -1}
                onClick={() => setMobile(index)}
                onKeyDown={(e) => arrowNavigation(e, index, 3, setMobile)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            <section
              id={`${id}-panel-1`}
              className={`${styles.pitchPanel} ${mobile !== 1 ? styles.mobileHidden : ""}`}
              aria-label="Sahadaki yeri"
            >
              <div className={styles.panelHeading}>
                <span>
                  <Crosshair size={16} /> SAHADAKİ YERİ
                </span>
                <small>{team.name}</small>
              </div>
              <div className={styles.pitch}>
                <Image
                  src="/media/academy/cinematic-pitch.webp"
                  alt="Gece projektörlerle aydınlatılmış perspektifli futbol sahası"
                  width={1000}
                  height={1500}
                  sizes="(max-width: 700px) 95vw, 40vw"
                  preload
                />
                <div className={styles.pitchTitle}>
                  <span>ALFA SPOR AKADEMİ</span>
                  <strong>Oyun burada başlar.</strong>
                </div>
                {zone.key !== "unknown" && (
                  <div
                    className={styles.marker}
                    style={{ top: `${zone.top}%` }}
                  >
                    <div className={styles.markerPortrait}>
                      <Portrait key={player.id} player={player} />
                    </div>
                    <span>{player.name}</span>
                    <small>{player.position}</small>
                  </div>
                )}
                <div className={styles.pitchCaption}>
                  <MapPin size={17} />
                  <div>
                    <strong>{zone.label}</strong>
                    <span>Seçili oyuncunun genel mevki bölgesi</span>
                  </div>
                </div>
              </div>
              <div className={styles.pitchFooter}>
                <p>Yeteneğinle başla. Emeğinle geliş. Takımınla güçlen.</p>
                <span>
                  Yerleşim maç dizilişini değil, genel mevkiyi gösterir.
                </span>
              </div>
            </section>

            <section
              id={`${id}-panel-0`}
              className={`${styles.profilePanel} ${mobile !== 0 ? styles.mobileHidden : ""}`}
              aria-label="Oyuncu profili"
            >
              <div className={styles.panelHeading}>
                <span>
                  <UserRound size={16} /> OYUNCU KARTI
                </span>
                <div className={styles.playerArrows}>
                  <button
                    aria-label="Önceki oyuncu"
                    onClick={() => move(-1)}
                    disabled={team.players.length < 2}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    aria-label="Sonraki oyuncu"
                    onClick={() => move(1)}
                    disabled={team.players.length < 2}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
              <div className={styles.cardStage}>
                <div
                  className={`${styles.collectible} ${cardBrush.variable} ${cardCondensed.variable}`}
                  aria-label={`${player.name} oyuncu kartı`}
                >
                  <Image
                    className={styles.cardFrame}
                    src="/media/academy/wolf-card-frame-final.webp"
                    alt=""
                    fill
                    sizes="(max-width: 700px) 90vw, 360px"
                  />
                  <div className={styles.cardMeta}>
                    <strong aria-label={`Forma numarası: ${player.shirtNumber ?? "belirtilmemiş"}`}>
                      {player.shirtNumber ?? "—"}
                    </strong>
                    <span>{zone.short} · {team.name}</span>
                  </div>
                  <div className={styles.cardPortrait}>
                    <Portrait key={player.id} player={player} large />
                  </div>
                  <div className={styles.cardIdentity}>
                    <h2 aria-label={player.name}>
                      <span
                        className={styles.cardGivenName}
                        style={{ fontSize: `${Math.min(17, 110 / Math.max(givenName.length, 1))}cqw` }}
                      >
                        {givenName.toLocaleUpperCase("tr-TR")}
                      </span>
                      {surname && <span className={styles.cardSurname}>{surname.toLocaleUpperCase("tr-TR")}</span>}
                    </h2>
                  </div>
                  <dl className={styles.cardStats}>
                    {[
                      ["MAÇ", stats.matches],
                      ["GOL", stats.goals],
                      ["ASİST", stats.assists],
                      ["DK", stats.minutes],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <dt>{label}</dt>
                        <dd>{formatNumber(value as number | null)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className={styles.cardTagline}>BİR OYUNCU. BİR HİKÂYE.</p>
              </div>
              <p className={styles.statsScope}>
                {season} ·{" "}
                {kind === "all"
                  ? "Tüm maçlar"
                  : matchKinds[kind as keyof typeof matchKinds]}{" "}
                · Kayıtlı oyuncu verileri
              </p>
              <div
                className={styles.profileTabs}
                role="tablist"
                aria-label="Oyuncu bilgileri"
              >
                {profileTabs.map((label, index) => (
                  <button
                    key={label}
                    role="tab"
                    id={`${id}-tab-${index}`}
                    aria-selected={tab === index}
                    aria-controls={`${id}-detail`}
                    tabIndex={tab === index ? 0 : -1}
                    onClick={() => setTab(index)}
                    onKeyDown={(e) => arrowNavigation(e, index, 4, setTab)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                id={`${id}-detail`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${tab}`}
                className={styles.details}
                tabIndex={0}
              >
                {tab === 0 && (
                  <>
                    <div className={styles.playerHeading} aria-live="polite">
                      <h3>{player.name}</h3>
                      <span>
                        {team.name} · {player.position}
                      </span>
                    </div>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Forma numarası</dt>
                        <dd>{player.shirtNumber ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Tercih ettiği ayak</dt>
                        <dd>{footLabels[player.foot ?? ""]}</dd>
                      </div>
                      <div>
                        <dt>Takımı</dt>
                        <dd>{team.name}</dd>
                      </div>
                      <div>
                        <dt>Sezon</dt>
                        <dd>{season}</dd>
                      </div>
                    </dl>
                    <p className={styles.dataNote}>
                      {rows.length
                        ? `${rows.length} kayıtlı maç üzerinden gösteriliyor. Eksik bilgiler “—” ile belirtilir.`
                        : "Bu sezonun bireysel maç istatistikleri henüz eklenmedi."}
                    </p>
                  </>
                )}
                {(tab === 1 || tab === 2) && (
                  <label className={styles.kindFilter}>
                    Maç türü
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      <option value="all">Tüm maçlar</option>
                      {Object.entries(matchKinds).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {tab === 1 && (
                  <>
                    <div className={styles.metrics}>
                      {[
                        ["Maç", stats.matches],
                        ["Gol", stats.goals],
                        ["Asist", stats.assists],
                        ["Gol katkısı", stats.contributions],
                        ["Dakika", stats.minutes],
                        ["İlk 11", stats.starts],
                        ["Gol / maç", stats.goalsPerMatch],
                        ["Asist / maç", stats.assistsPerMatch],
                        ...(zone.key === "goalkeeper"
                          ? [
                              ["Kurtarış", stats.saves],
                              ["Gol yemediği maç", stats.cleanSheets],
                            ]
                          : []),
                      ].map(([label, value]) => (
                        <div key={label as string}>
                          <span>{label}</span>
                          <strong>
                            {formatNumber(
                              value as number | null,
                              String(label).includes("/"),
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <p className={styles.dataNote}>
                      {season} · {rows.length} kayıtlı maç. “—” veri
                      girilmediğini, “0” kayıtlı sıfır değerini belirtir.
                    </p>
                  </>
                )}
                {tab === 2 &&
                  (rows.length ? (
                    <ol className={styles.matchHistory}>
                      {rows.map((row) => (
                        <li key={row.id}>
                          <div>
                            <strong>{row.opponent}</strong>
                            <span>
                              {new Date(
                                `${row.date}T12:00:00`,
                              ).toLocaleDateString("tr-TR")}{" "}
                              · {matchKinds[row.kind]}
                            </span>
                          </div>
                          <p>
                            <b>{formatNumber(row.goals)}</b> gol{" "}
                            <b>{formatNumber(row.assists)}</b> asist
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className={styles.detailEmpty}>
                      <CalendarDays size={25} />
                      <h3>Maç hikâyesi henüz başlamadı.</h3>
                      <p>
                        Bu sezon ve maç türü için bireysel kayıt bulunmuyor.
                      </p>
                    </div>
                  ))}
                {tab === 3 && (
                  <div className={styles.growth}>
                    <div>
                      <Target size={19} />
                      <h3>Bu dönemki hedefim</h3>
                      <p>
                        {player.goal ||
                          "Oyuncumuzun gelişim hedefi yakında burada."}
                      </p>
                    </div>
                    <div>
                      <Sparkles size={19} />
                      <h3>Güçlü yanım</h3>
                      <p>
                        {player.strength ||
                          "Antrenörümüzün paylaşacağı gelişim notu henüz eklenmedi."}
                      </p>
                    </div>
                    <p className={styles.dataNote}>
                      Her oyuncunun gelişim hızı kendine özgüdür. Birlikte
                      öğreniyor, adım adım ilerliyoruz.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section
              id={`${id}-panel-2`}
              className={`${styles.rosterPanel} ${mobile !== 2 ? styles.mobileHidden : ""}`}
              aria-label="Kadromuz"
            >
              <div className={styles.panelHeading}>
                <span>
                  <Users size={16} /> KADROMUZ
                </span>
                <small>{team.players.length}</small>
              </div>
              <div className={styles.rosterFilters}>
                <label className={styles.search}>
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label="Oyuncu adı veya mevki ara"
                    placeholder="Oyuncu ara…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Mevkiye göre filtrele"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                >
                  <option value="all">Tüm mevkiler</option>
                  <option value="goalkeeper">Kaleci</option>
                  <option value="defence">Defans</option>
                  <option value="midfield">Orta saha</option>
                  <option value="attack">Forvet</option>
                  <option value="unknown">Diğer</option>
                </select>
              </div>
              <div className={styles.rosterList}>
                {filtered.length ? (
                  filtered.map((candidate) => (
                    <button
                      key={candidate.id}
                      className={styles.rosterPlayer}
                      aria-pressed={candidate.id === player.id}
                      onClick={() => choose(candidate)}
                    >
                      <span className={styles.rosterPortrait}>
                        <Portrait key={candidate.id} player={candidate} />
                      </span>
                      <span className={styles.rosterName}>
                        <strong>{candidate.name}</strong>
                        <small>{candidate.position}</small>
                      </span>
                      <span className={styles.rosterNumber}>
                        {candidate.shirtNumber !== undefined &&
                        candidate.shirtNumber !== null ? (
                          String(candidate.shirtNumber).padStart(2, "0")
                        ) : (
                          <ArrowUpRight size={15} />
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className={styles.detailEmpty}>
                    <Search size={24} />
                    <p>Aramanıza uygun oyuncu bulunamadı.</p>
                    <button
                      className={styles.reset}
                      onClick={() => {
                        setQuery("");
                        setZoneFilter("all");
                      }}
                    >
                      Filtreleri temizle
                    </button>
                  </div>
                )}
              </div>
              <p className={styles.rosterHint}>
                Her oyuncunun katkısı, takımın gücü. Bir oyuncu seç,
                hikâyesini keşfet.
              </p>
            </section>
          </div>
        </>
      )}
      <footer className={styles.bottom}>
        <div>
          <Trophy size={22} />
          <div>
            <h2>Aynı arma için, birlikte sahaya.</h2>
            <p>{team.name} takımının maç programını ve sonuçlarını takip et.</p>
          </div>
        </div>
        <Link href={`/maclar?takim=${team.slug}`}>
          Maç merkezine git <ArrowRight size={18} />
        </Link>
      </footer>
    </div>
  );
}
