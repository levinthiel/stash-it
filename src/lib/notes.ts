import { ObjectId } from "mongodb";
import { getColorFromId, randomPocketColor } from "@/lib/colors";
import { getNotesCollection } from "@/lib/mongodb";
import type { Note, NoteDocument, NoteInput, NoteUpdate } from "@/types/note";

function toNote(doc: NoteDocument & { _id: ObjectId }): Note {
  const id = doc._id.toHexString();
  return {
    id,
    title: doc.title,
    body: doc.body,
    color: doc.color ?? getColorFromId(id),
    updatedAt: doc.updatedAt ?? new Date(0).toISOString(),
  };
}

export async function listNotes(): Promise<Note[]> {
  const collection = await getNotesCollection();
  const docs = await collection.find().sort({ updatedAt: -1 }).toArray();
  return docs.map((doc) => toNote(doc as NoteDocument & { _id: ObjectId }));
}

export async function createNote(input: NoteInput): Promise<Note> {
  const collection = await getNotesCollection();
  const now = new Date().toISOString();
  const document = { ...input, color: randomPocketColor(), updatedAt: now };
  const result = await collection.insertOne(document);
  return toNote({ _id: result.insertedId, ...document });
}

export async function updateNote(id: string, update: NoteUpdate): Promise<Note | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getNotesCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return toNote(result as NoteDocument & { _id: ObjectId });
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getNotesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
