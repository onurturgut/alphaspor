import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2";

export const runtime = "nodejs";

// Only generated, public admin images are exposed; never arbitrary bucket keys.
export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const key = (await context.params).key.join("/");
  if (!/^media\/admin\/[a-f0-9-]{36}\.(webp|jpg|png|avif)$/.test(key)) {
    return new Response(null, { status: 404 });
  }
  try {
    const object = await getR2Client().send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    if (!object.Body) return new Response(null, { status: 404 });
    return new Response(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": object.ContentType ?? "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    return new Response(null, { status: status === 404 ? 404 : 502 });
  }
}
