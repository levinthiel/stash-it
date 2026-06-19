import { MongoClient, type Db, type Collection } from "mongodb";
import type { PocketDocument } from "@/types/pocket";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Missing environment variable: "MONGODB_URI"');
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error('Missing environment variable: "MONGODB_DB"');
  }

  const client = await getClientPromise();
  return client.db(dbName);
}

export async function getPocketsCollection(): Promise<Collection<PocketDocument>> {
  const collectionName = process.env.MONGODB_COLLECTION ?? "pockets";
  const db = await getDb();
  return db.collection<PocketDocument>(collectionName);
}
