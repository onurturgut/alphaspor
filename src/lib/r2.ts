import "server-only";
import { randomUUID } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

export function getR2Client() {
  if (!client) {
    const accountId = required("R2_ACCOUNT_ID");
    if (!/^[a-f0-9]{32}$/i.test(accountId)) {
      throw new Error(
        "R2_ACCOUNT_ID geçerli bir Cloudflare hesap kimliği olmalı.",
      );
    }
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
      },
      maxAttempts: 3,
      // R2 uploads do not require the optional Expect: 100-continue handshake.
      // Sending the body directly avoids stalled uploads on some network paths.
      expectContinueHeader: false,
      requestHandler: {
        connectionTimeout: 10000,
        requestTimeout: 120000,
        throwOnRequestTimeout: true,
      },
    });
  }
  return client;
}

function objectLocation(key: string) {
  if (
    !key ||
    key.startsWith("/") ||
    key.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error("Geçersiz R2 dosya anahtarı.");
  }
  return { Bucket: required("R2_BUCKET_NAME"), Key: key };
}

export async function checkR2Connection() {
  await getR2Client().send(
    new HeadBucketCommand({ Bucket: required("R2_BUCKET_NAME") }),
  );
}

/** Server-side only. Authorize the caller before invoking from an API/action. */
export async function uploadR2Image(body: Uint8Array, contentType: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const extension = extensions[contentType];
  if (!extension) throw new Error("JPEG, PNG, WebP veya AVIF görseli gerekli.");
  if (!body.byteLength || body.byteLength > 10 * 1024 * 1024) {
    throw new Error("Görsel boyutu 1 bayt ile 10 MB arasında olmalı.");
  }
  const key = `media/${randomUUID()}.${extension}`;
  await getR2Client().send(
    new PutObjectCommand({
      ...objectLocation(key),
      Body: body,
      ContentType: contentType,
    }),
  );
  return { key };
}

export async function getR2DownloadUrl(key: string, expiresIn = 300) {
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 3600) {
    throw new Error("İndirme bağlantısı süresi 1–3600 saniye arasında olmalı.");
  }
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand(objectLocation(key)),
    { expiresIn },
  );
}

export function getR2PublicUrl(key: string) {
  objectLocation(key);
  const base = new URL(required("R2_PUBLIC_URL"));
  if (
    base.protocol !== "https:" ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new Error(
      "R2_PUBLIC_URL sorgu veya kimlik bilgisi içermeyen bir HTTPS adresi olmalı.",
    );
  }
  return `${base.href.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function deleteR2Object(key: string) {
  await getR2Client().send(new DeleteObjectCommand(objectLocation(key)));
}
