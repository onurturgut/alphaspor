/**
 * Rebuild the application content from the read-only SITE123 archive.
 * Run from the project root: node scripts/prepare-content.mjs
 * No third-party parser is required. Original text stays in arsiv/.
 * --fetch-missing-media downloads any article images omitted by the old archive.
 */
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archive = path.join(root, "arsiv");
const dataDirectory = path.join(root, "src", "data");
const mediaDirectory = path.join(root, "public", "media");

async function readJson(filename) {
  const buffer = await readFile(path.join(archive, filename));
  const encoding =
    buffer[0] === 0xff && buffer[1] === 0xfe ? "utf16le" : "utf8";
  return JSON.parse(buffer.toString(encoding).replace(/^\uFEFF/, ""));
}

const [students, inventory, source, originalContact] = await Promise.all([
  readJson("ogrenciler.json"),
  readJson("gorsel-envanteri.json"),
  readJson("site-export.json"),
  readJson("iletisim.json"),
]);
await Promise.all([
  mkdir(dataDirectory, { recursive: true }),
  mkdir(mediaDirectory, { recursive: true }),
]);

// The archived HTML is a small, regular SITE123 fragment. This parser builds a
// tree so nested divs do not accidentally truncate article bodies or categories.
const entities = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  Uuml: "Ü",
  uuml: "ü",
  Ouml: "Ö",
  ouml: "ö",
  Ccedil: "Ç",
  ccedil: "ç",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
};
function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key) => {
    if (key[0] === "#") {
      const point =
        key[1].toLowerCase() === "x"
          ? parseInt(key.slice(2), 16)
          : Number(key.slice(1));
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return entities[key] ?? entity;
  });
}
function parseHtml(html) {
  const document = { tag: "document", attrs: {}, children: [] };
  const stack = [document];
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? []) {
    if (token.startsWith("<!")) continue;
    if (token.startsWith("</")) {
      const tag = token
        .slice(2)
        .match(/^[\w-]+/)?.[0]
        .toLowerCase();
      for (let index = stack.length - 1; index > 0; index--) {
        if (stack[index].tag === tag) {
          stack.length = index;
          break;
        }
      }
    } else if (token.startsWith("<")) {
      const tag = token
        .slice(1)
        .match(/^[\w-]+/)?.[0]
        .toLowerCase();
      if (!tag) continue;
      const attrs = {};
      const attributes = token.slice(tag.length + 1, -1);
      for (const match of attributes.matchAll(
        /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
      )) {
        attrs[match[1]] = decode(match[2] ?? match[3] ?? match[4] ?? "");
      }
      const node = { tag, attrs, children: [] };
      stack.at(-1).children.push(node);
      if (
        !/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(
          tag,
        ) &&
        !token.endsWith("/>")
      )
        stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  return document;
}
function findAll(node, predicate) {
  if (typeof node === "string") return [];
  return [
    ...(predicate(node) ? [node] : []),
    ...node.children.flatMap((child) => findAll(child, predicate)),
  ];
}
const hasClass = (node, className) =>
  (node.attrs.class ?? "").split(/\s+/).includes(className);
function plainText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.tag === "br") return "\n";
  return node.children.map(plainText).join("");
}
const clean = (value) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const byUrl = new Map(
  inventory.map((item) => [item.url.replace(/"$/, ""), item]),
);
const byFile = new Map(inventory.map((item) => [item.file, item]));
const copiedHashes = new Map();
const remoteMediaFile = path.join(dataDirectory, "media-sources.json");
let remoteMedia = {};
try {
  remoteMedia = JSON.parse(await readFile(remoteMediaFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
async function copyMedia(item) {
  if (!item) return null;
  const bytes = await readFile(path.join(archive, item.file));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (copiedHashes.has(hash)) return copiedHashes.get(hash);
  // Some source files have a .png URL but actually contain JPEG bytes.
  const extension =
    bytes[0] === 0xff && bytes[1] === 0xd8
      ? ".jpg"
      : bytes[0] === 0x89 && bytes[1] === 0x50
        ? ".png"
        : path.extname(item.file);
  const filename = hash.slice(0, 20) + extension;
  await copyFile(
    path.join(archive, item.file),
    path.join(mediaDirectory, filename),
  );
  const publicPath = "/media/" + filename;
  copiedHashes.set(hash, publicPath);
  return publicPath;
}
async function resolveImage(url) {
  if (!url) return null;
  if (byUrl.has(url)) return copyMedia(byUrl.get(url));
  if (remoteMedia[url]) {
    try {
      await readFile(path.join(root, "public", remoteMedia[url]));
      return remoteMedia[url];
    } catch (error) {
      if (
        error.code !== "ENOENT" ||
        !process.argv.includes("--fetch-missing-media")
      )
        throw error;
    }
  }
  if (!process.argv.includes("--fetch-missing-media")) return null;
  if (!/^https:\/\/files\.cdn-files-a\.com\/uploads\/11959673\//.test(url))
    throw new Error(`Unexpected image host: ${url}`);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Image download failed (${response.status}): ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const extension =
    bytes[0] === 0xff && bytes[1] === 0xd8
      ? ".jpg"
      : bytes[0] === 0x89 && bytes[1] === 0x50
        ? ".png"
        : null;
  if (!extension) throw new Error(`Unexpected image format: ${url}`);
  const publicPath = "/media/" + hash.slice(0, 20) + extension;
  await writeFile(path.join(root, "public", publicPath), bytes);
  remoteMedia[url] = publicPath;
  return publicPath;
}

const teamNames = ["U9", "U10", "U11", "U12", "U13", "U14/U15"];
const teamPage = await readFile(
  path.join(archive, "sayfalar", "04-ekiplerimiz.html"),
  "utf8",
);
const teamPhotos = new Map(
  [
    ...teamPage.matchAll(/aria-label="(U\d+) ALFA[^"\n]*" data-bg="([^"]+)"/g),
  ].map((match) => [match[1], match[2]]),
);
const teams = [];
for (const name of teamNames) {
  const slug = name.toLowerCase().replaceAll("/", "-");
  const photoTeam = name === "U14/U15" ? "U14" : name;
  const photo = await resolveImage(teamPhotos.get(photoTeam));
  if (!photo)
    throw new Error(
      `Missing team photo for ${name}; run with --fetch-missing-media`,
    );
  const players = [];
  for (const student of students.filter(
    (student) => student.team.trim() === name,
  )) {
    const photo = await copyMedia(byFile.get(student.photoFile));
    if (!photo) throw new Error(`Missing archived photo for ${student.name}`);
    players.push({
      id: `${slug}-${student.sourceId}`,
      name: student.name,
      position: student.position,
      photo,
      placeholder: Boolean(student.sourceUsesGenericImage),
    });
  }
  teams.push({
    slug,
    name,
    season: "2026/2027",
    photo,
    photoAlt: `${photoTeam} Alfa Spor takım fotoğrafı, 2025/2026`,
    playerCount: players.length,
    players,
  });
}

const newsById = new Map();
const categorySources = [];
for (const filename of (await readdir(path.join(archive, "kategoriler")))
  .filter((name) => name.endsWith(".json"))
  .sort()) {
  const categorySource = await readJson(path.join("kategoriler", filename));
  categorySources.push({
    category: filename.replace(/\.json$/, ""),
    sourceUrl: categorySource.sourceUrl,
    text: categorySource.text,
  });
  const document = parseHtml(categorySource.html);
  for (const block of findAll(document, (node) =>
    hasClass(node, "testimonials-category-block"),
  )) {
    const category = block.attrs["data-categories-filter"].toUpperCase();
    for (const box of findAll(
      block,
      (node) => hasClass(node, "box") && Boolean(node.attrs["data-unique-id"]),
    )) {
      const id = box.attrs["data-unique-id"];
      const title = clean(
        plainText(findAll(box, (node) => node.tag === "h4")[0]),
      );
      const subtitle = clean(
        plainText(
          findAll(box, (node) => hasClass(node, "section_small_text"))[0],
        ),
      );
      const body = findAll(box, (node) => node.tag === "p")
        .map((node) => clean(plainText(node)))
        .filter(Boolean)
        .join("\n\n");
      const imageUrl = findAll(box, (node) => Boolean(node.attrs["data-bg"]))[0]
        ?.attrs["data-bg"];
      if (!title || !body) throw new Error(`News ${id} missing title/body`);
      const existing = newsById.get(id);
      if (existing) {
        if (existing.title !== title || existing.body !== body)
          throw new Error(`Conflicting versions of news ${id}`);
        continue;
      }
      const image = await resolveImage(imageUrl);
      newsById.set(id, {
        id,
        title,
        category,
        subtitle,
        body,
        ...(image ? { image } : {}),
      });
    }
  }
}

const aboutPage = source.pages.find((page) =>
  decodeURIComponent(page.url).endsWith("/hakkında"),
);
const staffPage = source.pages.find((page) =>
  page.url.endsWith("/teknik-ekip"),
);
const staffLines = staffPage.sections[0].text
  .split("\n")
  .map(clean)
  .filter(
    (line) =>
      line && line !== "..." && line !== "Teknik Ekip" && line !== "All",
  );
const staff = [];
for (let index = 0; index < staffLines.length; index += 2)
  staff.push({ name: staffLines[index], role: staffLines[index + 1] });
const content = {
  teams,
  news: [...newsById.values()],
  staff,
  contact: {
    email: originalContact.links.find((link) => link.href.startsWith("mailto:"))
      .text,
    phone: "+90 538 766 24 31",
    address: "Fethiye, Muğla, Türkiye, 48100",
    hours: "Hafta içi: 09:00–20:00 · Hafta sonu: 09:00–20:00",
    instagram: originalContact.links.find((link) =>
      link.href.includes("instagram.com"),
    ).href,
  },
  about: aboutPage.sections.map((section) => section.text).join("\n\n"),
};
await writeFile(
  path.join(dataDirectory, "content.json"),
  JSON.stringify(content, null, 2) + "\n",
  "utf8",
);
await writeFile(
  remoteMediaFile,
  JSON.stringify(remoteMedia, null, 2) + "\n",
  "utf8",
);
await writeFile(
  path.join(dataDirectory, "source-pages.json"),
  JSON.stringify(
    {
      capturedAt: source.capturedAt,
      source: source.source,
      pages: source.pages.map((page) => ({
        title: page.title,
        url: page.url,
        text: page.text,
        sections: page.sections.map(({ id, title, text }) => ({
          id,
          title,
          text,
        })),
      })),
      categories: categorySources,
      originalContact,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(
  JSON.stringify(
    {
      teams: teams.map(({ name, playerCount }) => ({ name, playerCount })),
      totalPlayers: teams.reduce((total, team) => total + team.playerCount, 0),
      placeholderPlayers: teams
        .flatMap((team) => team.players)
        .filter((player) => player.placeholder).length,
      news: content.news.length,
      newsCategories: [
        ...new Set(content.news.map((article) => article.category)),
      ],
      staff: staff.length,
      copiedMedia: copiedHashes.size,
    },
    null,
    2,
  ),
);
