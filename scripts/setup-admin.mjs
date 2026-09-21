import nextEnv from "@next/env";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { hashPassword } = await import("../src/lib/admin/password.ts");
try {
  const db = await getDb();
  await db.collection("adminUsers").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("adminSessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("adminLoginAttempts")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const club = await db.collection("settings").findOne({ _id: "club" });
  const email = (process.argv[2] || club?.contact?.email || "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("An email is required");
  if (await db.collection("adminUsers").findOne({ email }))
    console.log("Yönetici hesabı zaten var; şifre değiştirilmedi.");
  else {
    const password = randomBytes(18).toString("base64url");
    await mkdir(new URL("../.local-backups/", import.meta.url), {
      recursive: true,
    });
    // Save credentials before creating the account, so a failed write cannot lose access.
    await writeFile(
      new URL("../.local-backups/admin-credentials.txt", import.meta.url),
      `Admin: /admin\nE-posta: ${email}\nGeçici şifre: ${password}\n\nGirişten sonra Hesap bölümünden şifrenizi değiştirin.\n`,
      { flag: "wx" },
    );
    await db
      .collection("adminUsers")
      .insertOne({
        _id: randomUUID(),
        email,
        passwordHash: await hashPassword(password),
        active: true,
        createdAt: new Date(),
      });
    console.log(
      "Yönetici oluşturuldu. Giriş bilgileri .local-backups/admin-credentials.txt dosyasına yazıldı.",
    );
  }
} catch {
  console.error(
    "Yönetici kurulumu tamamlanamadı. MongoDB bağlantısını ve yerel giriş bilgisi dosyasını kontrol edin.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
}
