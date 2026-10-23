import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse, type Font, type PathCommand } from "opentype.js";
import sharp, { type OverlayOptions } from "sharp";
import { AdminError, fail, requireAdmin } from "@/lib/admin/auth";
import {
  playerAppearances,
  playerStats,
  positionZone,
  type AcademyPlayer,
} from "@/lib/academy";
import { getDb } from "@/lib/mongodb";
import { withMatchAppearances, type Match } from "@/lib/matches";
import { resolvePlayerImage } from "@/lib/player-card-art";

export const runtime = "nodejs";

const WIDTH = 800;
const HEIGHT = 1200;
const TEMPLATE = "/media/academy/player-card-template-v2.webp";
const STAT_CENTERS = [162, 322, 478, 638];
const NAME_MAX_WIDTH = 600;
let bionFontPromise: Promise<Font> | null = null;

function formatStat(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("tr-TR").format(value);
}

function safeFilename(name: string) {
  const normalized = name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "oyuncu";
}

function playerIdentity(name: string) {
  return name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]/g, "");
}

function splitPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts.pop()! : "";
  return { givenName: parts.join(" ") || name, surname };
}

async function localAsset(url: string) {
  if (!url.startsWith("/media/") || url.includes("..")) return null;
  const publicRoot = path.join(process.cwd(), "public");
  const resolved = path.resolve(publicRoot, url.slice(1));
  if (!resolved.startsWith(publicRoot + path.sep)) return null;
  try {
    return await readFile(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function loadBionFont() {
  bionFontPromise ??= readFile(
    path.join(process.cwd(), "public/fonts/bion-bold.ttf"),
  ).then((font) => {
    const fontBuffer = font.buffer.slice(
      font.byteOffset,
      font.byteOffset + font.byteLength,
    );
    return parse(fontBuffer);
  });
  return bionFontPromise;
}

function textWidth(
  font: Font,
  text: string,
  fontSize: number,
  letterSpacing = 0,
) {
  const glyphs = font.stringToGlyphs(text);
  const scale = fontSize / font.unitsPerEm;

  return glyphs.reduce((width, glyph, index) => {
    const nextGlyph = glyphs[index + 1];
    return (
      width +
      (glyph.advanceWidth ?? font.unitsPerEm) * scale +
      (nextGlyph
        ? font.getKerningValue(glyph, nextGlyph) * scale + letterSpacing
        : 0)
    );
  }, 0);
}

function fitFontSize(
  font: Font,
  text: string,
  preferredSize: number,
  maxWidth: number,
) {
  const width = textWidth(font, text, preferredSize);
  return width > maxWidth ? preferredSize * (maxWidth / width) : preferredSize;
}

function pathNumber(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function pathCommandData(command: PathCommand) {
  switch (command.type) {
    case "M":
    case "L":
      return `${command.type} ${pathNumber(command.x)} ${pathNumber(command.y)}`;
    case "Q":
      return `Q ${pathNumber(command.x1)} ${pathNumber(command.y1)} ${pathNumber(command.x)} ${pathNumber(command.y)}`;
    case "C":
      return `C ${pathNumber(command.x1)} ${pathNumber(command.y1)} ${pathNumber(command.x2)} ${pathNumber(command.y2)} ${pathNumber(command.x)} ${pathNumber(command.y)}`;
    case "Z":
      return "Z";
  }
}

function textPath(
  font: Font,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  options: {
    className?: string;
    letterSpacing?: number;
    attributes?: string;
  } = {},
) {
  const glyphs = font.stringToGlyphs(text);
  const scale = fontSize / font.unitsPerEm;
  const letterSpacing = options.letterSpacing ?? 0;
  const width = textWidth(font, text, fontSize, letterSpacing);

  let cursor = -width / 2;
  const pathData: string[] = [];
  for (let index = 0; index < glyphs.length; index += 1) {
    const glyph = glyphs[index];
    const glyphPath = glyph.getPath(cursor, 0, fontSize);
    pathData.push(glyphPath.commands.map(pathCommandData).join(" "));
    cursor += (glyph.advanceWidth ?? font.unitsPerEm) * scale;
    if (index < glyphs.length - 1) {
      cursor += font.getKerningValue(glyph, glyphs[index + 1]) * scale;
      cursor += letterSpacing;
    }
  }

  const className = options.className ? ` class="${options.className}"` : "";
  const attributes = options.attributes ? ` ${options.attributes}` : "";
  return `<path${className} d="${pathData.join(" ")}" transform="translate(${x} ${y}) skewX(-10)"${attributes}/>`;
}

function dynamicCardText(player: AcademyPlayer, values: string[], font: Font) {
  const { givenName, surname } = splitPlayerName(player.name);
  const upperGiven = givenName.toLocaleUpperCase("tr-TR");
  const upperSurname = surname.toLocaleUpperCase("tr-TR");
  const preferredGivenSize =
    upperGiven.length > 17 ? 42 : upperGiven.length > 12 ? 49 : 55;
  const preferredSurnameSize =
    upperSurname.length > 14 ? 50 : upperSurname.length > 10 ? 58 : 66;
  const givenSize = fitFontSize(
    font,
    upperGiven,
    preferredGivenSize,
    NAME_MAX_WIDTH,
  );
  const surnameSize = fitFontSize(
    font,
    upperSurname,
    preferredSurnameSize,
    NAME_MAX_WIDTH,
  );
  const zone = positionZone(player.position);
  const labels = ["MAÇ", "GOL", "ASİST", "DK"];

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .card{fill:#fff}
          .muted{fill:#e1e4e6}
        </style>
        <filter id="shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".95"/></filter>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#aeb7be"/>
          <stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#777f86"/>
        </linearGradient>
      </defs>
      <g class="card" filter="url(#shadow)">
        ${textPath(font, String(player.shirtNumber ?? "—"), 122, 438, 122, { attributes: 'fill="url(#metal)" stroke="#080b0e" stroke-width="7" paint-order="stroke fill"' })}
        ${textPath(font, zone.label.toLocaleUpperCase("tr-TR"), 122, 478, 25, { className: "muted" })}
        ${textPath(font, "AKADEMİ", 122, 507, 18, { className: "muted", letterSpacing: 2 })}
        ${textPath(font, upperGiven, 400, 814, givenSize)}
        ${upperSurname ? textPath(font, upperSurname, 400, 875, surnameSize) : ""}
        ${labels.map((label, index) => textPath(font, label, STAT_CENTERS[index] - 4, 944, 25, { className: "muted", letterSpacing: 1.1 })).join("")}
        ${values.map((value, index) => textPath(font, value, STAT_CENTERS[index] - 7, 1007, 52)).join("")}
      </g>
    </svg>`);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/admin/")) await requireAdmin();
    const teamSlug = url.searchParams.get("team") ?? "";
    const playerId = url.searchParams.get("player") ?? "";
    if (
      !/^[a-z0-9-]{1,100}$/.test(teamSlug) ||
      !/^[\w-]{1,100}$/.test(playerId)
    )
      throw new AdminError("Geçersiz takım veya oyuncu.");

    const db = await getDb();
    const [teams, matches, competitions] = await Promise.all([
      db
        .collection<{
          name: string;
          slug: string;
          season: string;
          players: AcademyPlayer[];
        }>("teams")
        .find({ _deleted: { $ne: true } })
        .toArray(),
      db
        .collection<Match>("matches")
        .find({ published: { $ne: false }, _deleted: { $ne: true } })
        .toArray(),
      db
        .collection<{ _id: string; published?: boolean }>("competitions")
        .find({ published: { $ne: false }, _deleted: { $ne: true } })
        .toArray(),
    ]);
    const team = teams.find((item) => item.slug === teamSlug);
    if (!team) throw new AdminError("Takım bulunamadı.", 404);

    const allowedCompetitions = new Set(
      competitions.map((competition) => competition._id),
    );
    const mergedTeams = withMatchAppearances(
      teams,
      matches.filter(
        (match) =>
          !match.competitionId || allowedCompetitions.has(match.competitionId),
      ),
    );
    const mergedTeam = mergedTeams.find((item) => item.slug === teamSlug)!;
    const player = mergedTeam.players.find((item) => item.id === playerId);
    if (!player) throw new AdminError("Oyuncu bulunamadı.", 404);

    const identity = playerIdentity(player.name);
    const pooledAppearances = mergedTeams
      .flatMap((candidateTeam) => candidateTeam.players)
      .filter((candidate) => playerIdentity(candidate.name) === identity)
      .flatMap((candidate) => playerAppearances(candidate, team.season));
    const uniqueAppearances = [
      ...new Map(
        pooledAppearances.map((appearance) => [appearance.id, appearance]),
      ).values(),
    ];
    const stats = playerStats(uniqueAppearances);
    const values = [
      stats.matches,
      stats.goals,
      stats.assists,
      stats.minutes,
    ].map(formatStat);

    const [cardBase, font] = await Promise.all([
      localAsset(TEMPLATE),
      loadBionFont(),
    ]);
    if (!cardBase)
      throw new AdminError("Standart kart şablonu bulunamadı.", 500);

    const composites: OverlayOptions[] = [];
    const cutoutUrl = resolvePlayerImage({
      name: player.name,
      teamSlug: team.slug,
      photo: player.photo,
      placeholder: player.placeholder,
      usage: "card",
    });
    const cutoutAsset = cutoutUrl ? await localAsset(cutoutUrl) : null;
    if (cutoutAsset) {
      const portrait = await sharp(cutoutAsset)
        .rotate()
        .resize(620, 760, {
          fit: "contain",
          position: "bottom",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      composites.push({ input: portrait, left: 90, top: 115, blend: "over" });
    }
    composites.push({
      input: dynamicCardText(player, values, font),
      left: 0,
      top: 0,
      blend: "over",
    });

    const output = await sharp(cardBase)
      .resize(WIDTH, HEIGHT, { fit: "fill" })
      .composite(composites)
      .webp({ quality: 94, alphaQuality: 100 })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": `attachment; filename="${safeFilename(player.name)}-oyuncu-karti.webp"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
