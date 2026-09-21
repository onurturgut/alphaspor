import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "../mongodb";
export const sessionCookie = "alpha_admin";
export const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export type AdminUser = {
  _id: string;
  email: string;
  passwordHash: string;
  active: boolean;
};
type Session = { _id: string; userId: string; expiresAt: Date };
export class AdminError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function getAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const db = await getDb();
  const session = await db
    .collection<Session>("adminSessions")
    .findOne({ _id: tokenHash(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db
    .collection<AdminUser>("adminUsers")
    .findOne({ _id: session.userId, active: true });
  return user ? { id: user._id, email: user.email } : null;
}
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user)
    throw new AdminError("Oturumunuz sona erdi. Yeniden giriş yapın.", 401);
  return user;
}
export function checkOrigin(request: Request) {
  const value = request.headers.get("origin");
  let valid = false;
  try {
    const origin = new URL(value ?? "");
    // Next may normalize request.url to localhost. Compare the browser's
    // origin to the actual Host header; deployments can pin ADMIN_ORIGIN.
    valid = process.env.ADMIN_ORIGIN
      ? origin.origin === process.env.ADMIN_ORIGIN
      : origin.host === request.headers.get("host") &&
        (origin.protocol === "https:" || origin.protocol === new URL(request.url).protocol);
  } catch { /* Missing or malformed Origin is rejected. */ }
  if (!valid) throw new AdminError("İstek kaynağı doğrulanamadı.", 403);
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await (
    await getDb()
  )
    .collection<Session>("adminSessions")
    .insertOne({ _id: tokenHash(token), userId, expiresAt });
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token)
    await (
      await getDb()
    )
      .collection<Session>("adminSessions")
      .deleteOne({ _id: tokenHash(token) });
  jar.delete(sessionCookie);
}
export async function limitedBody(request: Request, limit = 250000) {
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError("İstek boş.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new AdminError("Dosya/istek boyutu sınırı aşıldı.", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request) {
  try {
    return JSON.parse((await limitedBody(request)).toString("utf8"));
  } catch (error) {
    if (error instanceof AdminError) throw error;
    throw new AdminError("Geçersiz istek.");
  }
}
export function fail(error: unknown) {
  if (error instanceof AdminError)
    return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    { error: "İşlem tamamlanamadı. Biraz sonra tekrar deneyin." },
    { status: 500 },
  );
}
