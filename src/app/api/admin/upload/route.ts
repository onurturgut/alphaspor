import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  AdminError,
  checkOrigin,
  fail,
  limitedBody,
  requireAdmin,
} from "@/lib/admin/auth";
import { getR2Client, getR2PublicUrl } from "@/lib/r2";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const body = await limitedBody(request, 26 * 1024 * 1024);
    const form = await new Response(new Uint8Array(body), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size)
      throw new AdminError("Bir dosya seçin.");
    let bytes = Buffer.from(await file.arrayBuffer());
    let extension = "webp",
      contentType = "image/webp",
      width = 0,
      height = 0;
    if (file.type === "video/mp4") {
      if (
        file.size > 25 * 1024 * 1024 ||
        bytes.subarray(4, 8).toString() !== "ftyp"
      )
        throw new AdminError("En fazla 25 MB, geçerli bir MP4 seçin.");
      extension = "mp4";
      contentType = "video/mp4";
    } else {
      if (file.size > 10 * 1024 * 1024)
        throw new AdminError("Görsel en fazla 10 MB olabilir.");
      try {
        const image = sharp(bytes, { limitInputPixels: 40000000 })
          .rotate()
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 });
        const result = await image.toBuffer({ resolveWithObject: true });
        bytes = Buffer.from(result.data);
        width = result.info.width;
        height = result.info.height;
      } catch {
        throw new AdminError(
          "Dosya okunamadı. JPEG, PNG, WebP veya AVIF görseli seçin.",
        );
      }
    }
    const key = `media/admin/${randomUUID()}.${extension}`;
    const url = getR2PublicUrl(key);
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return Response.json({ url, width, height });
  } catch (error) {
    return fail(error);
  }
}
