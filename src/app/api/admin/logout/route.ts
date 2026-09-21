import { checkOrigin, endSession, fail } from "@/lib/admin/auth";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await endSession();
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
