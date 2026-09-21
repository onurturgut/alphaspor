import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { checkR2Connection, getR2Client } = await import("../src/lib/r2.ts");

const checks = [
  [
    "MongoDB",
    ["MONGODB_URI", "MONGODB_DB"],
    async () => (await getDb()).command({ ping: 1 }),
  ],
  [
    "R2",
    [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
    ],
    checkR2Connection,
  ],
];

try {
  await Promise.all(
    checks.map(async ([name, variables, check]) => {
      const missing = variables.filter((key) => !process.env[key]?.trim());
      if (missing.length) {
        console.error(`${name}: eksik değişkenler: ${missing.join(", ")}`);
        process.exitCode = 1;
        return;
      }
      try {
        await check();
        console.log(`${name}: bağlantı başarılı (salt okunur kontrol).`);
      } catch {
        // SDK errors can contain endpoints/credentials; never print raw errors.
        console.error(
          `${name}: bağlantı başarısız. Kimlik bilgilerini, ağ erişimini ve izinleri kontrol edin.`,
        );
        process.exitCode = 1;
      }
    }),
  );
} finally {
  await closeMongoClient();
  try {
    getR2Client().destroy();
  } catch {
    /* R2 may be unconfigured. */
  }
}
