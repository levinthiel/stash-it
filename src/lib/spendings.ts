import { ObjectId } from "mongodb";
import { pocketColorOptions, type PocketColorKey } from "@/lib/colors";
import { getSpendingsCollection } from "@/lib/mongodb";
import type { Spending, SpendingDocument, SpendingInput } from "@/types/spending";

function randomColor(): PocketColorKey {
  return pocketColorOptions[Math.floor(Math.random() * pocketColorOptions.length)].key;
}

function toSpending(doc: SpendingDocument & { _id: ObjectId }): Spending {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    amount: doc.amount,
    color: doc.color,
  };
}

export async function listSpendings(): Promise<Spending[]> {
  const collection = await getSpendingsCollection();
  const docs = await collection.find().sort({ name: 1 }).toArray();
  return docs.map((doc) => toSpending(doc as SpendingDocument & { _id: ObjectId }));
}

export async function createSpending(input: SpendingInput): Promise<Spending> {
  const collection = await getSpendingsCollection();
  const document = { ...input, color: randomColor() };
  const result = await collection.insertOne(document);
  return toSpending({ _id: result.insertedId, ...document });
}

export async function updateSpending(id: string, input: SpendingInput): Promise<Spending | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getSpendingsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: input },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return toSpending(result as SpendingDocument & { _id: ObjectId });
}

export async function deleteSpending(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getSpendingsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
