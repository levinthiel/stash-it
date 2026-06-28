import { ObjectId } from "mongodb";
import { getColorFromId, randomPocketColor } from "@/lib/colors";
import { normalizeGroceryStore } from "@/lib/grocery-stores";
import { getGroceriesCollection } from "@/lib/mongodb";
import type { Grocery, GroceryDocument, GroceryInput, GroceryUpdate } from "@/types/grocery";

function toGrocery(doc: GroceryDocument & { _id: ObjectId }): Grocery {
  const id = doc._id.toHexString();
  return {
    id,
    name: doc.name,
    quantity: doc.quantity,
    checked: doc.checked,
    color: doc.color ?? getColorFromId(id),
    store: normalizeGroceryStore(doc.store),
  };
}

export async function listGroceries(): Promise<Grocery[]> {
  const collection = await getGroceriesCollection();
  const docs = await collection.find().sort({ checked: 1, _id: 1 }).toArray();
  return docs.map((doc) => toGrocery(doc as GroceryDocument & { _id: ObjectId }));
}

export async function createGrocery(input: GroceryInput): Promise<Grocery> {
  const collection = await getGroceriesCollection();
  const store = normalizeGroceryStore(input.store);
  const document: GroceryDocument = {
    name: input.name,
    quantity: input.quantity,
    checked: false,
    color: randomPocketColor(),
    ...(store ? { store } : {}),
  };
  const result = await collection.insertOne(document);
  return toGrocery({ _id: result.insertedId, ...document });
}

export async function updateGrocery(id: string, update: GroceryUpdate): Promise<Grocery | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getGroceriesCollection();
  const { store, ...rest } = update;
  const mongoUpdate: { $set?: Record<string, unknown>; $unset?: Record<string, ""> } = {};

  if (Object.keys(rest).length > 0) {
    mongoUpdate.$set = rest;
  }

  if (store !== undefined) {
    const normalizedStore = normalizeGroceryStore(store);
    if (normalizedStore === null) {
      mongoUpdate.$unset = { store: "" };
    } else {
      mongoUpdate.$set = { ...mongoUpdate.$set, store: normalizedStore };
    }
  }

  if (!mongoUpdate.$set && !mongoUpdate.$unset) return null;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    mongoUpdate,
    { returnDocument: "after" }
  );

  if (!result) return null;
  return toGrocery(result as GroceryDocument & { _id: ObjectId });
}

export async function deleteGrocery(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getGroceriesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
