import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import {
  AdminError,
  type AdminUser,
  checkOrigin,
  endSession,
  fail,
  readJson,
  requireAdmin,
} from "@/lib/admin/auth";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const admin = await requireAdmin();
    const input = z
      .object({
        current: z.string().min(1).max(200),
        password: z.string().min(12).max(200),
      })
      .safeParse(await readJson(request));
    if (!input.success)
      throw new AdminError("Yeni şifre en az 12 karakter olmalı.");
    const db = await getDb();
    const user = await db
      .collection<AdminUser>("adminUsers")
      .findOne({ _id: admin.id });
    if (!user || !(await verifyPassword(input.data.current, user.passwordHash)))
      throw new AdminError("Mevcut şifre hatalı.");
    await db
      .collection<AdminUser>("adminUsers")
      .updateOne(
        { _id: user._id, passwordHash: user.passwordHash },
        { $set: { passwordHash: await hashPassword(input.data.password) } },
      );
    await db.collection("adminSessions").deleteMany({ userId: user._id });
    await endSession();
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
