import "server-only";
import { MongoClient } from "mongodb";

const state = globalThis as typeof globalThis & {
  alphaMongo?: Promise<MongoClient>;
};

/** Share the connection pool across requests and development hot reloads. */
export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI ortam değişkeni eksik.");

  if (!state.alphaMongo) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    state.alphaMongo = client.connect().catch(async (error: unknown) => {
      state.alphaMongo = undefined;
      await client.close();
      throw error;
    });
  }
  return state.alphaMongo;
}

export async function getDb() {
  const name = process.env.MONGODB_DB?.trim();
  if (!name) throw new Error("MONGODB_DB ortam değişkeni eksik.");
  return (await getMongoClient()).db(name);
}

/** Only for scripts/shutdown; do not close the shared pool after requests. */
export async function closeMongoClient() {
  const pending = state.alphaMongo;
  state.alphaMongo = undefined;
  if (pending) await (await pending).close();
}
