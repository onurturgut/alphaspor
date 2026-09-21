import { checkOrigin, fail, readJson, requireAdmin } from "@/lib/admin/auth";
import {
  deleteAdmin,
  listAdmin,
  saveAdmin,
  sectionKey,
} from "@/lib/admin/data";
export const runtime = "nodejs";
type Context = { params: Promise<{ section: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdmin();
    const section = sectionKey((await context.params).section);
    return Response.json(
      { records: await listAdmin(section) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireAdmin();
    const section = sectionKey((await context.params).section);
    const id = await saveAdmin(section, await readJson(request), user.id);
    return Response.json({ ok: true, id });
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireAdmin();
    const section = sectionKey((await context.params).section);
    await deleteAdmin(section, await readJson(request), user.id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
