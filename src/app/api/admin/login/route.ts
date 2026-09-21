import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/admin/password";
import {
  AdminError,
  type AdminUser,
  checkOrigin,
  createSession,
  endSession,
  fail,
  readJson,
  tokenHash,
} from "@/lib/admin/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = z
      .object({
        email: z.string().trim().toLowerCase().email().max(254),
        password: z.string().min(1).max(200),
      })
      .safeParse(await readJson(request));
    if (!input.success)
      throw new AdminError("E-posta ve şifrenizi kontrol edin.");
    const db = await getDb();
    const now = Date.now();
    for (const [key, limit] of [
      [`account:${tokenHash(input.data.email)}`, 10],
      ["global", 150],
    ] as const) {
      const _id = `${key}:${Math.floor(now / 900000)}`;
      const attempt = await db
        .collection<{ _id: string; count: number; expiresAt: Date }>(
          "adminLoginAttempts",
        )
        .findOneAndUpdate(
          { _id },
          {
            $inc: { count: 1 },
            $setOnInsert: { expiresAt: new Date(now + 1800000) },
          },
          { upsert: true, returnDocument: "after" },
        );
      if (!attempt || attempt.count > limit)
        throw new AdminError(
          "Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.",
          429,
        );
    }
    const user = await db
      .collection<AdminUser>("adminUsers")
      .findOne({ email: input.data.email, active: true });
    const dummy = `${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(
      input.data.password,
      user?.passwordHash ?? dummy,
    );
    if (!user || !valid)
      throw new AdminError("E-posta veya şifre hatalı.", 401);
    await endSession();
    await createSession(user._id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
