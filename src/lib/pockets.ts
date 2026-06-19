import { ObjectId } from "mongodb";
import { getPocketsCollection } from "@/lib/mongodb";
import type { Pocket, PocketDocument, PocketInput } from "@/types/pocket";

function toPocket(doc: PocketDocument & { _id: ObjectId }): Pocket {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    amount: doc.amount,
    color: doc.color,
    icon: doc.icon,
  };
}

export async function listPockets(): Promise<Pocket[]> {
  const collection = await getPocketsCollection();
  const docs = await collection.find().sort({ name: 1 }).toArray();
  return docs.map((doc) => toPocket(doc as PocketDocument & { _id: ObjectId }));
}

export async function createPocket(input: PocketInput): Promise<Pocket> {
  const collection = await getPocketsCollection();
  const result = await collection.insertOne(input);
  return toPocket({ _id: result.insertedId, ...input });
}

export async function updatePocket(id: string, input: PocketInput): Promise<Pocket | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getPocketsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: input },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return toPocket(result as PocketDocument & { _id: ObjectId });
}

export async function deletePocket(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getPocketsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
