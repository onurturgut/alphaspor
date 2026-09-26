import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { getContent } from "@/lib/content";

export const runtime = "nodejs";
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[^\r\n]+$/),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).default(""),
  message: z.string().trim().min(5).max(3000),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "İstek doğrulanamadı." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length")) > 20000) {
    return Response.json({ error: "Mesaj çok uzun." }, { status: 413 });
  }
  let input;
  try {
    const text = await request.text();
    if (text.length > 20000)
      return Response.json({ error: "Mesaj çok uzun." }, { status: 413 });
    input = schema.safeParse(JSON.parse(text));
  } catch {
    return Response.json({ error: "Geçersiz form verisi." }, { status: 400 });
  }
  if (!input.success)
    return Response.json(
      { error: "Lütfen ad, e-posta ve mesaj alanlarını kontrol edin." },
      { status: 400 },
    );
  if (input.data.website) return Response.json({ ok: true });
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    return Response.json(
      {
        error:
          "Mesaj gönderimi şu anda kullanılamıyor. Lütfen telefon veya e-posta üzerinden bize ulaşın.",
      },
      { status: 503 },
    );
  }
  try {
    const db = await getDb();
    const limits = db.collection<{
      _id: string;
      count: number;
      expiresAt: Date;
    }>("contact_rate_limits");
    await limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    const bucket = Math.floor(Date.now() / 600000);
    const key = createHash("sha256")
      .update(input.data.email.toLowerCase())
      .digest("hex");
    const rate = await limits.findOneAndUpdate(
      { _id: `${key}:${bucket}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(Date.now() + 1200000) },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (rate && rate.count > 3)
      return Response.json(
        {
          error:
            "Çok sık mesaj gönderdiniz. Lütfen 10 dakika sonra tekrar deneyin.",
        },
        { status: 429 },
      );
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    const { contact } = await getContent();
    const { name, email, phone, message } = input.data;
    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: process.env.CONTACT_TO || contact.email,
      replyTo: email,
      subject: `Alfa Spor iletişim · ${name}`,
      text: `Ad soyad: ${name}\nE-posta: ${email}\nTelefon: ${phone || "Belirtilmedi"}\n\n${message}`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted.length) throw new Error("Message not accepted");
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Mesajınız gönderilemedi. Lütfen tekrar deneyin veya telefonla bize ulaşın.",
      },
      { status: 502 },
    );
  }
}
