import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/admin/password";
import { checkOrigin, requireUserManager, readJson, fail, AdminError, type AdminUser } from "@/lib/admin/auth";
const schema = z.object({ id: z.string().max(150).optional(), name: z.string().trim().min(1).max(120), email: z.email().max(254).transform(v => v.toLowerCase()), role: z.enum(["admin", "editor"]), active: z.boolean(), password: z.union([z.literal(""), z.string().min(12).max(200)]) });
export async function GET() {
  try {
    await requireUserManager();
    const records = await (await getDb()).collection<AdminUser>("adminUsers").find({}, { projection: { passwordHash: 0 } }).sort({ email: 1 }).toArray();
    return Response.json({ records }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return fail(e); }
}
export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireUserManager();
    const parsed = schema.safeParse(await readJson(request));
    if (!parsed.success) throw new AdminError("Ad, e-posta ve rolü kontrol edin. Şifre en az 12 karakter olmalı.");
    const { id, password, ...fields } = parsed.data;
    if (id === actor.id && (!fields.active || fields.role !== "admin")) throw new AdminError("Kendi yönetici yetkinizi veya hesabınızı kapatamazsınız.");
    const db = await getDb();
    const users = db.collection<AdminUser>("adminUsers");
    await users.createIndex({ email: 1 }, { unique: true });
    const previous = id ? await users.findOne({ _id: id }) : null;
    if (id && !previous) throw new AdminError("Kullanıcı bulunamadı.", 404);
    if (!id && !password) throw new AdminError("Yeni kullanıcı için şifre oluşturun.");
    const patch = { ...fields, ...(password ? { passwordHash: await hashPassword(password) } : {}) };
    try {
      if (id) await users.updateOne({ _id: id }, { $set: patch });
      else await users.insertOne({ _id: randomUUID(), ...fields, passwordHash: patch.passwordHash! });
    } catch (e) { if ((e as { code?: number }).code === 11000) throw new AdminError("Bu e-posta zaten kullanılıyor.", 409); throw e; }
    if (id && (password || !fields.active || fields.role !== (previous?.role ?? "admin"))) await db.collection("adminSessions").deleteMany({ userId: id });
    await db.collection("adminHistory").insertOne({ section: "users", recordId: id ?? fields.email, action: id ? "update" : "create", userId: actor.id, at: new Date(), changes: fields });
    return Response.json({ ok: true });
  } catch (e) { return fail(e); }
}
