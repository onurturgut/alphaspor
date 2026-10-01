import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkOrigin, requireAdmin, readJson, fail, AdminError } from "@/lib/admin/auth";
import { settingsSchema } from "@/lib/admin/schema";
import { getDb } from "@/lib/mongodb";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireAdmin();
    const input = z.object({ data: settingsSchema }).safeParse(await readJson(request));
    if (!input.success) throw new AdminError("Önizleme için zorunlu alanları tamamlayın ve bağlantıları kontrol edin.");
    const db = await getDb();
    const previews = db.collection<{ _id: string; userId: string; data: typeof input.data.data; expiresAt: Date }>("adminPreviews");
    await previews.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    const id = randomUUID();
    await previews.insertOne({ _id: id, userId: user.id, data: input.data.data, expiresAt: new Date(Date.now() + 3600000) });
    return Response.json({ id });
  } catch (error) { return fail(error); }
}
