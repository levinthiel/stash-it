import { ObjectId } from "mongodb";
import { getColorFromId, randomPocketColor } from "@/lib/colors";
import { deriveNoteTitle } from "@/lib/markdown";
import { getNotesCollection } from "@/lib/mongodb";
import { MAX_PINNED } from "@/lib/note-constants";
import type { Note, NoteDocument, NoteInput, NoteUpdate } from "@/types/note";

export { MAX_PINNED, RECENT_LIMIT } from "@/lib/note-constants";

function toNote(doc: NoteDocument & { _id: ObjectId }): Note {
  const id = doc._id.toHexString();
  return {
    id,
    title: doc.title,
    body: doc.body,
    color: doc.color ?? getColorFromId(id),
    folder: doc.folder ?? null,
    pinned: doc.pinned ?? false,
    pinnedAt: doc.pinnedAt ?? null,
    updatedAt: doc.updatedAt ?? new Date(0).toISOString(),
  };
}

export async function listNotes(): Promise<Note[]> {
  const collection = await getNotesCollection();
  const docs = await collection.find().sort({ updatedAt: -1 }).toArray();
  return docs.map((doc) => toNote(doc as NoteDocument & { _id: ObjectId }));
}

export async function listFolderNames(): Promise<string[]> {
  const collection = await getNotesCollection();
  const folders = await collection.distinct("folder");
  return folders.filter((f): f is string => typeof f === "string" && f.length > 0);
}

export async function createNote(input: NoteInput): Promise<Note> {
  const collection = await getNotesCollection();
  const now = new Date().toISOString();
  const title = deriveNoteTitle(input.title, input.body);
  const document: NoteDocument = {
    title,
    body: input.body,
    color: input.color ?? randomPocketColor(),
    folder: input.folder ?? null,
    pinned: false,
    pinnedAt: null,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return toNote({ _id: result.insertedId, ...document });
}

export async function updateNote(
  id: string,
  update: NoteUpdate
): Promise<{ note: Note; unpinnedTitle?: string } | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getNotesCollection();
  const objectId = new ObjectId(id);
  const existing = await collection.findOne({ _id: objectId });
  if (!existing) return null;

  const current = toNote(existing as NoteDocument & { _id: ObjectId });
  const $set: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (update.body !== undefined) $set.body = update.body;
  if (update.color !== undefined) $set.color = update.color;
  if (update.folder !== undefined) $set.folder = update.folder;

  const nextBody = update.body !== undefined ? update.body : current.body;
  if (update.title !== undefined) {
    $set.title = deriveNoteTitle(update.title, nextBody);
  }

  let unpinnedTitle: string | undefined;

  if (update.pinned !== undefined) {
    const wasPinned = current.pinned;
    const willPin = update.pinned;

    if (!wasPinned && willPin) {
      const pinnedCount = await collection.countDocuments({ pinned: true });
      if (pinnedCount >= MAX_PINNED) {
        const oldest = await collection
          .find({ pinned: true })
          .sort({ pinnedAt: 1 })
          .limit(1)
          .next();

        if (oldest) {
          unpinnedTitle = (oldest as NoteDocument).title;
          await collection.updateOne(
            { _id: oldest._id },
            { $set: { pinned: false, pinnedAt: null } }
          );
        }
      }

      $set.pinned = true;
      $set.pinnedAt = new Date().toISOString();
    } else if (wasPinned && !willPin) {
      $set.pinned = false;
      $set.pinnedAt = null;
    } else {
      $set.pinned = willPin;
    }
  }

  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return {
    note: toNote(result as NoteDocument & { _id: ObjectId }),
    ...(unpinnedTitle !== undefined ? { unpinnedTitle } : {}),
  };
}

export async function renameFolder(from: string, to: string): Promise<number> {
  const collection = await getNotesCollection();
  const result = await collection.updateMany({ folder: from }, { $set: { folder: to } });
  return result.modifiedCount;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getNotesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
