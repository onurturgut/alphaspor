import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { AdminError, fail, requireAdmin } from "@/lib/admin/auth";
import { playerAppearances, playerStats, positionZone, type AcademyPlayer } from "@/lib/academy";
import { getDb } from "@/lib/mongodb";
import { withMatchAppearances, type Match } from "@/lib/matches";
import { playerCardArt, playerCardKey, playerPortraitArt } from "@/lib/player-card-art";
import { getR2Client } from "@/lib/r2";

export const runtime = "nodejs";

const WIDTH = 800;
const HEIGHT = 1200;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]!);
}

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

async function localAsset(url: string) {
  if (!url.startsWith("/media/") || url.includes("..")) return null;
  const publicRoot = path.join(process.cwd(), "public");
  const resolved = path.resolve(publicRoot, url.slice(1));
  if (!resolved.startsWith(publicRoot + path.sep)) return null;
  return readFile(resolved);
}

async function playerPhoto(url: string) {
  const local = await localAsset(url);
  if (local) return local;

  const r2Match = url.match(/^\/api\/media\/(media\/admin\/[a-f0-9-]{36}\.(?:webp|jpg|png|avif))$/);
  if (r2Match) {
    const object = await getR2Client().send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Match[1],
    }));
    if (!object.Body) return null;
    return Buffer.from(await object.Body.transformToByteArray());
  }

  if (!url.startsWith("https://")) return null;
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return null;
  const size = Number(response.headers.get("content-length") ?? 0);
  if (size > 10 * 1024 * 1024) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  return bytes.byteLength <= 10 * 1024 * 1024 ? bytes : null;
}

async function fontCss() {
  const font = await readFile(path.join(process.cwd(), "public/fonts/barlow-condensed-bold.ttf"));
  return `@font-face{font-family:Card;src:url(data:font/ttf;base64,${font.toString("base64")})}`;
}

function finishedCardOverlay(values: string[], css: string) {
  const labels = ["MAÇ", "GOL", "ASİST", "DK"];
  const centers = [128, 310, 490, 672];
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${css}
          .stat-label,.stat-value{font-family:Card,Arial,sans-serif;font-weight:700;fill:#fff}
          .stat-label{font-size:27px;letter-spacing:1.5px;fill:#e4e4e4}
          .stat-value{font-size:54px}
        </style>
        <linearGradient id="clean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050708" stop-opacity="0"/>
          <stop offset=".16" stop-color="#050708" stop-opacity="1"/>
          <stop offset=".84" stop-color="#050708" stop-opacity="1"/>
          <stop offset="1" stop-color="#050708" stop-opacity="0"/>
        </linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".95"/></filter>
      </defs>
      <rect x="70" y="895" width="660" height="135" fill="url(#clean)"/>
      <g text-anchor="middle" filter="url(#shadow)">
        ${labels.map((label, index) => `<text class="stat-label" x="${centers[index]}" y="938">${label}</text>`).join("")}
        ${values.map((value, index) => `<text class="stat-value" x="${centers[index]}" y="1002">${escapeXml(value)}</text>`).join("")}
      </g>
    </svg>`);
}

function standardCardText(player: AcademyPlayer, teamName: string, values: string[], css: string) {
  const parts = player.name.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts.pop()! : "";
  const givenName = parts.join(" ") || player.name;
  const labels = ["MAÇ", "GOL", "ASİST", "DK"];
  const centers = [145, 315, 485, 655];
  const zone = positionZone(player.position);
  const nameSize = player.name.length > 20 ? 54 : player.name.length > 15 ? 64 : 76;
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>${css}.card{font-family:Card,Arial,sans-serif;fill:#fff}.muted{fill:#dedede}</style>
        <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".95"/></filter>
        <linearGradient id="portraitFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#050708" stop-opacity=".98"/></linearGradient>
      </defs>
      <rect x="100" y="665" width="600" height="205" fill="url(#portraitFade)"/>
      <g class="card" text-anchor="middle" filter="url(#shadow)">
        <text x="400" y="790" font-size="${nameSize}" font-weight="700">${escapeXml(givenName.toLocaleUpperCase("tr-TR"))}</text>
        ${surname ? `<text x="400" y="858" font-size="70" font-weight="700">${escapeXml(surname.toLocaleUpperCase("tr-TR"))}</text>` : ""}
        ${labels.map((label, index) => `<text class="muted" x="${centers[index]}" y="930" font-size="31" font-weight="700" letter-spacing="2">${label}</text>`).join("")}
        ${values.map((value, index) => `<text x="${centers[index]}" y="982" font-size="54" font-weight="700">${escapeXml(value)}</text>`).join("")}
      </g>
      <g class="card" filter="url(#shadow)">
        <text x="105" y="430" font-size="150" font-weight="700">${escapeXml(String(player.shirtNumber ?? "—"))}</text>
        <text x="110" y="480" font-size="36" font-weight="700">${escapeXml(zone.label.toLocaleUpperCase("tr-TR"))}</text>
        <text x="110" y="518" font-size="24" class="muted">${escapeXml(teamName.toLocaleUpperCase("tr-TR"))}</text>
      </g>
    </svg>`);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/admin/")) await requireAdmin();
    const teamSlug = url.searchParams.get("team") ?? "";
    const playerId = url.searchParams.get("player") ?? "";
    if (!/^[a-z0-9-]{1,100}$/.test(teamSlug) || !/^[\w-]{1,100}$/.test(playerId))
      throw new AdminError("Geçersiz takım veya oyuncu.");

    const db = await getDb();
    const [team, matches, competitions] = await Promise.all([
      db.collection<{ name: string; slug: string; season: string; players: AcademyPlayer[] }>("teams").findOne({ slug: teamSlug, _deleted: { $ne: true } }),
      db.collection<Match>("matches").find({ teamSlug, published: { $ne: false }, _deleted: { $ne: true } }).toArray(),
      db.collection<{ _id: string; published?: boolean }>("competitions").find({ published: { $ne: false }, _deleted: { $ne: true } }).toArray(),
    ]);
    if (!team) throw new AdminError("Takım bulunamadı.", 404);
    const allowedCompetitions = new Set(competitions.map((competition) => competition._id));
    const mergedTeam = withMatchAppearances([team], matches.filter((match) => !match.competitionId || allowedCompetitions.has(match.competitionId)))[0];
    const player = mergedTeam.players.find((item) => item.id === playerId);
    if (!player) throw new AdminError("Oyuncu bulunamadı.", 404);

    const stats = playerStats(playerAppearances(player, team.season));
    const values = [stats.matches, stats.goals, stats.assists, stats.minutes].map(formatStat);
    const css = await fontCss();
    const art = playerCardArt(player.name, team.slug);
    let image: Sharp;

    if (art) {
      const base = await localAsset(art);
      if (!base) throw new AdminError("Oyuncu kartı bulunamadı.", 404);
      image = sharp(base).resize(WIDTH, HEIGHT, { fit: "fill" }).composite([
        { input: finishedCardOverlay(values, css), top: 0, left: 0 },
      ]);
    } else {
      const template = await localAsset("/media/academy/player-card-template.webp");
      if (!template) throw new AdminError("Standart kart şablonu bulunamadı.", 500);
      const composites: OverlayOptions[] = [];
      const preparedPortrait = playerPortraitArt(player.name);
      const portraitAsset = preparedPortrait ? await localAsset(preparedPortrait) : null;
      const uploadedPhoto = !portraitAsset && player.photo && !player.placeholder
        ? await playerPhoto(player.photo)
        : null;
      const portraitSource = portraitAsset ?? uploadedPhoto;
      if (portraitSource) {
        const portrait = await sharp(portraitSource)
          .rotate()
          .resize(620, 760, {
            fit: portraitAsset ? "contain" : "cover",
            position: portraitAsset ? "bottom" : "top",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();
        composites.push({ input: portrait, left: 90, top: 115, blend: "over" });
      }
      composites.push({ input: standardCardText(player, team.name, values, css), top: 0, left: 0 });
      image = sharp(template).resize(WIDTH, HEIGHT, { fit: "fill" }).composite(composites);
    }

    const output = await image.webp({ quality: 94 }).toBuffer();
    const filename = `${playerCardKey(player.name, team.slug) ?? safeFilename(player.name)}-oyuncu-karti.webp`;
    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
