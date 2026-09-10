"use client";

import Image from "next/image";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  List,
  MapPin,
  ScanLine,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import "./roster.css";

export type RosterPlayer = {
  id: string;
  name: string;
  position: string;
  photo: string;
  placeholder: boolean;
};

type RosterExplorerProps = {
  players: RosterPlayer[];
  teamName: string;
};

type PitchZone = "goalkeeper" | "defence" | "midfield" | "attack" | "unknown";

const zones: Record<PitchZone, { top: string; label: string }> = {
  goalkeeper: { top: "85%", label: "Kaleci" },
  defence: { top: "67%", label: "Defans" },
  midfield: { top: "47%", label: "Orta saha" },
  attack: { top: "23%", label: "Forvet" },
  unknown: { top: "47%", label: "Mevki belirtilmemiş" },
};

function getZone(position: string): PitchZone {
  const normalized = position.toLocaleLowerCase("tr-TR");
  if (normalized.includes("kaleci")) return "goalkeeper";
  if (
    normalized.includes("defans") ||
    normalized.includes("bek") ||
    normalized.includes("stoper")
  )
    return "defence";
  if (normalized.includes("orta")) return "midfield";
  if (
    normalized.includes("forvet") ||
    normalized.includes("santrfor") ||
    normalized.includes("kanat")
  )
    return "attack";
  return "unknown";
}

function PlayerPortrait({
  player,
  size = "small",
  alt = "",
}: {
  player: RosterPlayer;
  size?: "small" | "large";
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (player.placeholder || !player.photo || failed) {
    return (
      <span
        className={`roster-photo-fallback roster-photo-fallback--${size}`}
        role={alt ? "img" : undefined}
        aria-label={alt ? `${player.name}: fotoğraf hazırlanıyor` : undefined}
      >
        <UserRound aria-hidden="true" strokeWidth={1.3} />
        {size === "large" && <span>Fotoğraf hazırlanıyor</span>}
      </span>
    );
  }

  return (
    <Image
      src={player.photo}
      alt={alt}
      fill
      sizes={
        size === "large"
          ? "(max-width: 760px) 1px, (max-width: 1100px) 32vw, 380px"
          : "64px"
      }
      className="roster-photo"
      onError={() => setFailed(true)}
    />
  );
}

function Pitch({
  player,
  teamName,
}: {
  player: RosterPlayer;
  teamName: string;
}) {
  const zone = getZone(player.position);
  const { top, label } = zones[zone];

  return (
    <>
      <div className="roster-card-topline">
        <span>
          <ScanLine size={15} aria-hidden="true" /> SAHADAKİ YERİ
        </span>
        <span>{teamName}</span>
      </div>
      <div
        className="roster-pitch-stage"
        role="img"
        aria-label={`${player.name}: ${zone === "unknown" ? "mevki bilgisi henüz yok" : `${label} bölgesi`}. Gösterim genel mevki alanını belirtir.`}
      >
        <div className="roster-pitch" aria-hidden="true">
          <div className="roster-pitch-turf" />
          {zone !== "unknown" && (
            <div className={`roster-pitch-zone roster-pitch-zone--${zone}`} />
          )}
          <svg className="roster-pitch-lines" viewBox="0 0 300 430" fill="none">
            <rect x="12" y="12" width="276" height="406" rx="1" />
            <path d="M12 215h276M65 12v68h170V12M106 12v27h88V12M65 418v-68h170v68M106 418v-27h88v27M127 12V3h46v9M127 418v9h46v-9" />
            <circle cx="150" cy="215" r="37" />
            <circle cx="150" cy="215" r="2" className="roster-pitch-dot" />
            <circle cx="150" cy="61" r="2" className="roster-pitch-dot" />
            <circle cx="150" cy="369" r="2" className="roster-pitch-dot" />
            <path d="M119 80a37 37 0 0 0 62 0M119 350a37 37 0 0 1 62 0M12 23a11 11 0 0 0 11-11M277 12a11 11 0 0 0 11 11M12 407a11 11 0 0 1 11 11M277 418a11 11 0 0 1 11-11" />
          </svg>
          <span className="roster-zone-label roster-zone-label--attack">
            FORVET
          </span>
          <span className="roster-zone-label roster-zone-label--midfield">
            ORTA SAHA
          </span>
          <span className="roster-zone-label roster-zone-label--defence">
            DEFANS
          </span>
          <span className="roster-zone-label roster-zone-label--goalkeeper">
            KALECİ
          </span>
          {zone !== "unknown" && (
            <div
              className="roster-pitch-marker"
              style={{ "--marker-top": top } as CSSProperties}
            >
              <div className="roster-pitch-avatar">
                <PlayerPortrait key={player.id} player={player} />
              </div>
              <span className="roster-pitch-name">{player.name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="roster-pitch-caption">
        <span className="roster-zone-dot" />
        <span>
          {zone === "unknown"
            ? "Mevki bilgisi hazırlanıyor"
            : `${label} bölgesi`}
        </span>
        <MapPin size={15} aria-hidden="true" />
      </div>
      <p className="roster-pitch-note">
        Sahadaki alanlar genel mevkileri gösterir.
      </p>
    </>
  );
}

export function RosterExplorer({ players, teamName }: RosterExplorerProps) {
  const instanceId = useId();
  const [selectedId, setSelectedId] = useState(players[0]?.id ?? "");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<"saha" | "kadro">("saha");
  const pitchTabRef = useRef<HTMLButtonElement>(null);
  const listTabRef = useRef<HTMLButtonElement>(null);

  const selectedPlayer =
    players.find((player) => player.id === selectedId) ?? players[0];
  const player =
    players.find((candidate) => candidate.id === previewId) ?? selectedPlayer;
  const searchTerm = query.trim().toLocaleLowerCase("tr-TR");
  const filteredPlayers = players.filter((candidate) =>
    `${candidate.name} ${candidate.position}`
      .toLocaleLowerCase("tr-TR")
      .includes(searchTerm),
  );

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextTab =
      event.key === "Home"
        ? "saha"
        : event.key === "End"
          ? "kadro"
          : mobileTab === "saha"
            ? "kadro"
            : "saha";
    setMobileTab(nextTab);
    (nextTab === "saha" ? pitchTabRef : listTabRef).current?.focus();
  }

  if (!player || !selectedPlayer) {
    return (
      <div className="roster-empty-team">
        <Users size={32} aria-hidden="true" />
        <h3>{teamName} kadrosu hazırlanıyor.</h3>
        <p>Oyuncularımızı yakında burada tanıyabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="roster-explorer" data-mobile-tab={mobileTab}>
      <div className="roster-intro">
        <p>Bir oyuncu seç. Sahadaki yerini keşfet.</p>
        <span>
          <Users size={15} aria-hidden="true" /> {players.length} oyuncu
        </span>
      </div>

      <div className="roster-mobile-selection">
        <div className="roster-mobile-avatar">
          <PlayerPortrait key={selectedPlayer.id} player={selectedPlayer} />
        </div>
        <div>
          <span className="roster-small-label">
            {teamName} · {selectedPlayer.position}
          </span>
          <p>{selectedPlayer.name}</p>
        </div>
        <Check size={18} aria-hidden="true" />
      </div>

      <div
        className="roster-mobile-tabs"
        role="tablist"
        aria-label="Oyuncu görünümü"
      >
        <button
          ref={pitchTabRef}
          id={`${instanceId}-pitch-tab`}
          type="button"
          role="tab"
          aria-selected={mobileTab === "saha"}
          aria-controls={`${instanceId}-pitch`}
          tabIndex={mobileTab === "saha" ? 0 : -1}
          onClick={() => setMobileTab("saha")}
          onKeyDown={handleTabKeyDown}
        >
          <ScanLine size={17} aria-hidden="true" /> Saha
        </button>
        <button
          ref={listTabRef}
          id={`${instanceId}-list-tab`}
          type="button"
          role="tab"
          aria-selected={mobileTab === "kadro"}
          aria-controls={`${instanceId}-list`}
          tabIndex={mobileTab === "kadro" ? 0 : -1}
          onClick={() => setMobileTab("kadro")}
          onKeyDown={handleTabKeyDown}
        >
          <List size={17} aria-hidden="true" /> Kadro{" "}
          <span>{players.length}</span>
        </button>
      </div>

      <div className="roster-grid">
        <section
          className="roster-pitch-card roster-sticky"
          id={`${instanceId}-pitch`}
          role="tabpanel"
          aria-labelledby={`${instanceId}-pitch-tab`}
          tabIndex={0}
        >
          <Pitch player={player} teamName={teamName} />
          <button
            className="roster-mobile-choose"
            type="button"
            onClick={() => {
              setMobileTab("kadro");
              listTabRef.current?.focus();
            }}
          >
            Kadrodan oyuncu seç <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </section>

        <section
          className="roster-player-card roster-sticky"
          aria-label="Oyuncu fotoğrafı ve bilgileri"
        >
          <div className="roster-player-image">
            <PlayerPortrait
              key={player.id}
              player={player}
              size="large"
              alt={`${player.name}, ${teamName}`}
            />
            <span className="roster-player-team">{teamName}</span>
            <div className="roster-player-image-shade" />
            <div className="roster-player-identity">
              <span className="roster-player-position">{player.position}</span>
              <h3>{player.name}</h3>
            </div>
          </div>
          <div className="roster-player-footnote">
            <span>FETHİYE ALFA SPOR</span>
            <span>
              <span className="roster-status-dot" />{" "}
              {previewId && previewId !== selectedPlayer.id
                ? "Önizleme"
                : "Seçili oyuncu"}
            </span>
          </div>
        </section>

        <section
          className="roster-list-card"
          id={`${instanceId}-list`}
          role="tabpanel"
          aria-labelledby={`${instanceId}-list-tab`}
          tabIndex={0}
          onPointerLeave={() => setPreviewId(null)}
        >
          <div className="roster-card-topline">
            <span>
              <List size={15} aria-hidden="true" /> KADROMUZ
            </span>
            <span>
              {filteredPlayers.length} / {players.length}
            </span>
          </div>
          <label className="roster-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPreviewId(null);
              }}
              placeholder="İsim veya mevki ara"
              aria-label="Oyuncu adı veya mevki ara"
            />
          </label>
          {filteredPlayers.length > 0 ? (
            <ul className="roster-list">
              {filteredPlayers.map((candidate) => {
                const isSelected = candidate.id === selectedPlayer.id;
                const isPreviewed = candidate.id === player.id;

                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      className="roster-player-row"
                      aria-pressed={isSelected}
                      data-preview={isPreviewed}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "touch")
                          setPreviewId(candidate.id);
                      }}
                      onFocus={() => setPreviewId(candidate.id)}
                      onBlur={() => setPreviewId(null)}
                      onClick={() => {
                        setSelectedId(candidate.id);
                        setPreviewId(null);
                      }}
                    >
                      <span className="roster-row-avatar">
                        <PlayerPortrait key={candidate.id} player={candidate} />
                      </span>
                      <span className="roster-row-content">
                        <span className="roster-row-name">
                          {candidate.name}
                        </span>
                        <span className="roster-row-position">
                          {candidate.position}
                        </span>
                      </span>
                      <span className="roster-row-indicator" aria-hidden="true">
                        {isSelected ? (
                          <Check size={15} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="roster-search-empty" role="status">
              <Search size={23} aria-hidden="true" />
              <p>Bu aramada oyuncu bulunamadı.</p>
              <button type="button" onClick={() => setQuery("")}>
                Aramayı temizle
              </button>
            </div>
          )}
          <p className="roster-list-hint">Oyuncuyu seçmek için adına tıkla.</p>
        </section>
      </div>
      <p className="roster-sr-only" role="status">
        Seçili oyuncu: {selectedPlayer.name}, {selectedPlayer.position}.
      </p>
    </div>
  );
}

export default RosterExplorer;
