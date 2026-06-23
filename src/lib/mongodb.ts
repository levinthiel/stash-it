import { MongoClient, type Db, type Collection } from "mongodb";
import type { PocketDocument } from "@/types/pocket";
import type { SpendingDocument } from "@/types/spending";
import type { GroceryDocument } from "@/types/grocery";
import type { NoteDocument } from "@/types/note";

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

export async function getSpendingsCollection(): Promise<Collection<SpendingDocument>> {
  const collectionName = process.env.MONGODB_SPENDINGS_COLLECTION ?? "spendings";
  const db = await getDb();
  return db.collection<SpendingDocument>(collectionName);
}

export async function getGroceriesCollection(): Promise<Collection<GroceryDocument>> {
  const collectionName = process.env.MONGODB_GROCERIES_COLLECTION ?? "groceries";
  const db = await getDb();
  return db.collection<GroceryDocument>(collectionName);
}

export async function getNotesCollection(): Promise<Collection<NoteDocument>> {
  const collectionName = process.env.MONGODB_NOTES_COLLECTION ?? "notes";
  const db = await getDb();
  return db.collection<NoteDocument>(collectionName);
}
